import axios from 'axios';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { EmergencyCard } from '../../features/medical/repositories/MedicalRepository';
import type { VaultDocument } from '../../features/vault/repositories/VaultRepository';

export const emergencySessionKey = 'ff_emergency_session';
export const emergencyFileLimit = 25 * 1024 * 1024;

export interface EmergencyLoad<T> {
  data: T;
  fromCache: boolean;
}

interface SealedData {
  iv: Uint8Array<ArrayBuffer>;
  ciphertext: ArrayBuffer;
}

interface EmergencyDatabase extends DBSchema {
  keys: { key: string; value: CryptoKey };
  vault: { key: string; value: { revision: string; data: SealedData } };
  cards: { key: [string, string]; value: SealedData };
  files: {
    key: [string, string];
    value: { data: SealedData; type: string; versionNumber: number; savedAt: number };
  };
}

let database: Promise<IDBPDatabase<EmergencyDatabase>> | undefined;
let clearing: Promise<void> | undefined;

const openDatabase = () => {
  database ??= openDB<EmergencyDatabase>('familyfirst-emergency', 1, {
    upgrade(db) {
      db.createObjectStore('keys');
      db.createObjectStore('vault');
      db.createObjectStore('cards');
      db.createObjectStore('files');
    },
  }).catch(error => {
    database = undefined;
    throw error;
  });
  return database;
};

const currentScope = (scope: string) => localStorage.getItem(emergencySessionKey) === scope;

async function encryptionKey(db: IDBPDatabase<EmergencyDatabase>, scope: string, create = false) {
  if (!currentScope(scope)) return undefined;
  const existing = await db.get('keys', scope);
  if (existing || !create) return existing;

  const generated = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const tx = db.transaction('keys', 'readwrite');
  const concurrent = await tx.store.get(scope);
  if (currentScope(scope) && !concurrent) await tx.store.put(generated, scope);
  await tx.done;
  return currentScope(scope) ? concurrent ?? generated : undefined;
}

async function seal(key: CryptoKey, value: BufferSource): Promise<SealedData> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, value);
  return { iv, ciphertext };
}

async function unseal(key: CryptoKey, data: SealedData) {
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: data.iv }, key, data.ciphertext);
}

const jsonBytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));
const readJson = async <T>(key: CryptoKey, data: SealedData): Promise<T> =>
  JSON.parse(new TextDecoder().decode(await unseal(key, data)));

export const EmergencyOfflineStore = {
  isCurrent: currentScope,

  invalidateSession() {
    localStorage.removeItem(emergencySessionKey);
    clearing = openDatabase().then(async db => {
      const stores = ['vault', 'files', 'cards', 'keys'] as const;
      const tx = db.transaction(stores, 'readwrite');
      await Promise.all([...stores.map(store => tx.objectStore(store).clear()), tx.done]);
    }).catch(() => undefined);
    return clearing;
  },

  async saveVault(scope: string, revision: string, documents?: VaultDocument[]) {
    await clearing;
    const db = await openDatabase();
    const key = documents ? await encryptionKey(db, scope, true) : undefined;
    if (documents && !key) return;
    const sealed = documents && key ? await seal(key, jsonBytes(documents)) : undefined;
    if (!currentScope(scope)) return;
    const tx = db.transaction(['vault', 'files'], 'readwrite');
    const vault = tx.objectStore('vault');
    if (sealed) await vault.put({ revision, data: sealed }, scope);
    else await vault.delete(scope);
    const files = tx.objectStore('files');
    let cursor = await files.openCursor(IDBKeyRange.bound([scope], [scope, []]));
    const versions = new Map(documents?.map(doc => [doc.documentId, doc.versionNumber]));
    while (cursor) {
      if (versions.get(cursor.key[1]) !== cursor.value.versionNumber) await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  },

  async getVault(scope: string) {
    await clearing;
    const db = await openDatabase();
    const [key, snapshot] = await Promise.all([encryptionKey(db, scope), db.get('vault', scope)]);
    const documents = key && snapshot ? await readJson<VaultDocument[]>(key, snapshot.data) : undefined;
    return currentScope(scope) ? documents : undefined;
  },

  async saveFile(scope: string, revision: string, doc: VaultDocument, blob: Blob) {
    if (!blob.size || blob.size > emergencyFileLimit) return;
    await clearing;
    const db = await openDatabase();
    const encryption = await encryptionKey(db, scope);
    if (!encryption) return;
    const data = await seal(encryption, await blob.arrayBuffer());
    const size = data.ciphertext.byteLength + data.iv.byteLength;
    if (size > emergencyFileLimit) return;
    if (!currentScope(scope)) return;
    const tx = db.transaction(['vault', 'files'], 'readwrite');
    const snapshot = await tx.objectStore('vault').get(scope);
    if (!currentScope(scope) || snapshot?.revision !== revision) {
      await tx.done;
      return;
    }

    const files = tx.objectStore('files');
    const key: [string, string] = [scope, doc.documentId];
    const [keys, values] = await Promise.all([files.getAllKeys(), files.getAll()]);
    const oldFiles = keys.map((key, index) => ({ key, value: values[index] }))
      .filter(entry => entry.key[0] !== scope || entry.key[1] !== doc.documentId)
      .sort((a, b) => a.value.savedAt - b.value.savedAt);

    const storedSize = ({ data }: { data: SealedData }) => data.ciphertext.byteLength + data.iv.byteLength;
    let total = size + oldFiles.reduce((bytes, entry) => bytes + storedSize(entry.value), 0);
    for (const entry of oldFiles) {
      if (total <= emergencyFileLimit) break;
      await files.delete(entry.key);
      total -= storedSize(entry.value);
    }
    if (currentScope(scope)) {
      await files.put({ data, type: blob.type, versionNumber: doc.versionNumber, savedAt: Date.now() }, key);
    }
    await tx.done;
  },

  async getFile(scope: string, doc: VaultDocument) {
    await clearing;
    const db = await openDatabase();
    const [key, file] = await Promise.all([encryptionKey(db, scope), db.get('files', [scope, doc.documentId])]);
    if (!key || !file || file.versionNumber !== doc.versionNumber) return;
    const bytes = await unseal(key, file.data);
    return currentScope(scope) ? new Blob([bytes], { type: file.type }) : undefined;
  },

  async removeFile(scope: string, revision: string, doc: VaultDocument) {
    await clearing;
    const db = await openDatabase();
    const tx = db.transaction(['vault', 'files'], 'readwrite');
    if ((await tx.objectStore('vault').get(scope))?.revision === revision && currentScope(scope)) {
      await tx.objectStore('files').delete([scope, doc.documentId]);
    }
    await tx.done;
  },

  async saveCard(scope: string, memberId: string, card: EmergencyCard) {
    await clearing;
    const db = await openDatabase();
    const key = await encryptionKey(db, scope, true);
    if (!key) return;
    const sealed = await seal(key, jsonBytes(card));
    if (currentScope(scope)) await db.put('cards', sealed, [scope, memberId]);
  },

  async getCard(scope: string, memberId: string) {
    await clearing;
    const db = await openDatabase();
    const [key, sealed] = await Promise.all([encryptionKey(db, scope), db.get('cards', [scope, memberId])]);
    const card = key && sealed ? await readJson<EmergencyCard>(key, sealed) : undefined;
    return currentScope(scope) ? card : undefined;
  },

  async removeCard(scope: string, memberId: string) {
    const db = await openDatabase();
    await db.delete('cards', [scope, memberId]);
  },
};

export const isEmergencyNetworkFailure = (error: unknown) =>
  axios.isAxiosError(error) && !error.response && ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'].includes(error.code ?? '');

export const isEmergencyAccessFailure = (error: unknown) =>
  axios.isAxiosError(error) && [401, 403, 404, 410].includes(error.response?.status ?? 0);

export async function downloadEmergencyFile(fileUrl: string): Promise<Blob | undefined> {
  const url = new URL(fileUrl, location.origin);
  if (url.protocol !== 'https:' && url.origin !== location.origin) return;
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'omit',
    redirect: 'error',
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok || !response.body) return;
  if (Number(response.headers.get('content-length')) > emergencyFileLimit) {
    await response.body.cancel();
    return;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > emergencyFileLimit) {
      await reader.cancel();
      return;
    }
    chunks.push(new Uint8Array(value));
  }
  const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  const canPreview = type === 'application/pdf' || /^image\/(jpeg|png|gif|webp|bmp|avif)$/.test(type ?? '');
  return new Blob(chunks, { type: canPreview ? type : 'application/octet-stream' });
}
