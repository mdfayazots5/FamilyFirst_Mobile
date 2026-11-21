import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
import type { MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';
import {
  downloadEmergencyFile, EmergencyOfflineStore, isEmergencyAccessFailure, isEmergencyNetworkFailure,
  type EmergencyLoad,
} from '../../../core/cache/EmergencyOfflineStore';
import { SecureStorageService } from '../../../core/storage/SecureStorageService';

const mapDocumentCategories = (items: MasterDataItem[]) =>
  items
    .map((item) => ({ id: item.id, value: item.sortOrder, name: item.name }))
    .sort((a, b) => a.value - b.value);

export type DocumentCategory =
  | 'Medical' | 'Identity' | 'School' | 'Financial'
  | 'Insurance' | 'Legal' | 'Certificates' | 'Other';

/**
 * DocumentCategory option from GetMasters 'DocumentCategory' (P3 seed 112).
 * `value` = the int the API persists (lookup SortOrder = DocumentCategory enum value 1–8).
 */
export interface DocumentCategoryOption {
  id: string;
  value: number;
  name: string;
}


export type ExpiryStatus = 'None' | 'Green' | 'Amber' | 'Red';

export interface VaultDocument {
  documentId: string;
  documentName: string;
  category: number;
  categoryName: string;
  memberId: string;
  memberName: string;
  uploadedByUserId: string;
  uploadDate: string;
  expiryDate?: string;
  expiryStatus: ExpiryStatus;
  thumbnailUrl?: string;
  tags: string[];
  isEmergencyPriority: boolean;
  versionNumber: number;
}

export interface DocumentDetail extends VaultDocument {
  fileUrl: string;
  visibility: number;
  versionHistory: VersionEntry[];
  activeShareLinks: ShareLink[];
}

export interface VersionEntry {
  versionId: string;
  versionNumber: number;
  fileUrl: string;
  uploadedByUserId: string;
  archivedAt: string;
}

export interface ShareLink {
  shareLinkId: string;
  shareUrl: string;
  expiresAt: string;
  allowDownload: boolean;
  isRevoked: boolean;
  lastAccessedAt?: string;
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  expiresAtUtc: string;
}

export interface PaginatedDocuments {
  items: VaultDocument[];
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const VaultRepository = {

  /** Document category lookup — GetMasters 'DocumentCategory'. Sorted by enum value. */
  getDocumentCategories: async (): Promise<DocumentCategoryOption[]> => {
    return mapDocumentCategories(await getMasters('DocumentCategory'));
  },

  getUploadUrl: async (
    familyId: string,
    fileName: string,
    contentType: string,
    category: number,
  ): Promise<UploadUrlResponse> => {
    const response = await apiClient.post<ApiResponse<UploadUrlResponse>>(resolvePath(MasterApiReference.Vault.UploadUrl, {
      familyId,
    }), {
      fileName, contentType, category,
    });
    return requireApiData(response.data, 'VaultRepository.getUploadUrl');
  },

  /**
   * PUTs the file to the presigned S3 URL from getUploadUrl. `contentType` must be the same value sent to
   * getUploadUrl (it is part of the signature). Rejects on any non-2xx status, so a document record is never
   * created for a file that did not upload. Direct S3 call: intentionally not via apiClient (no Bearer token).
   */
  uploadFile: async (uploadUrl: string, file: Blob, contentType: string): Promise<void> => {
    const response = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': contentType } });
    if (!response.ok) {
      throw new Error(`Document upload failed (HTTP ${response.status}).`);
    }
  },

  listDocuments: async (
    familyId: string,
    params?: {
      category?: number;
      memberId?: string;
      search?: string;
      expiryStatus?: string;
      page?: number;
      pageSize?: number;
      sortBy?: string;
    },
  ): Promise<PaginatedDocuments> => {
    const response = await apiClient.get<ApiResponse<PaginatedDocuments>>(
      resolvePath(MasterApiReference.Vault.Documents, { familyId }),
      { params },
    );
    return requireApiData(response.data, 'VaultRepository.listDocuments');
  },

  getDocument: async (familyId: string, documentId: string): Promise<DocumentDetail> => {
    const response = await apiClient.get<ApiResponse<DocumentDetail>>(
      resolvePath(MasterApiReference.Vault.Document, { familyId, documentId }),
    );
    return requireApiData(response.data, 'VaultRepository.getDocument');
  },

  createDocument: async (
    familyId: string,
    data: {
      documentName: string; memberId: string; category: number;
      fileUrl: string; expiryDate?: string; tags?: string[];
      visibility?: number; isEmergencyPriority?: boolean;
    },
  ): Promise<VaultDocument> => {
    const response = await apiClient.post<ApiResponse<VaultDocument>>(
      resolvePath(MasterApiReference.Vault.Documents, { familyId }),
      data,
    );
    return requireApiData(response.data, 'VaultRepository.createDocument');
  },

  updateDocument: async (
    familyId: string,
    documentId: string,
    data: Partial<{
      documentName: string; expiryDate: string; tags: string[];
      visibility: number; isEmergencyPriority: boolean; newFileUrl: string;
    }>,
  ): Promise<VaultDocument> => {
    const response = await apiClient.put<ApiResponse<VaultDocument>>(
      resolvePath(MasterApiReference.Vault.Document, { familyId, documentId }),
      data,
    );
    return requireApiData(response.data, 'VaultRepository.updateDocument');
  },

  deleteDocument: async (familyId: string, documentId: string): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Vault.Document, { familyId, documentId }),
    );
    return response.data.data ?? false;
  },

  getExpiringDocuments: async (familyId: string): Promise<VaultDocument[]> => {
    const response = await apiClient.get<ApiResponse<VaultDocument[]>>(
      resolvePath(MasterApiReference.Vault.Expiry, { familyId }),
    );
    return response.data.data ?? [];
  },

  getEmergencyDocuments: async (familyId: string): Promise<VaultDocument[]> => {
    return (await VaultRepository.loadEmergencyDocuments(familyId)).data;
  },

  loadEmergencyDocuments: async (familyId: string): Promise<EmergencyLoad<VaultDocument[]>> => {
    const scope = SecureStorageService.getEmergencyCacheScope(familyId);
    const revision = scope ? crypto.randomUUID() : '';
    let documents: VaultDocument[];
    try {
      const response = await apiClient.get<ApiResponse<VaultDocument[]>>(
        resolvePath(MasterApiReference.Vault.Emergency, { familyId }),
      );
      documents = requireApiData(response.data, 'VaultRepository.getEmergencyDocuments');
    } catch (error) {
      if (scope && isEmergencyNetworkFailure(error)) {
        const cached = await EmergencyOfflineStore.getVault(scope).catch(() => undefined);
        if (cached) return { data: cached, fromCache: true };
      } else if (scope && isEmergencyAccessFailure(error)) {
        await EmergencyOfflineStore.saveVault(scope, revision).catch(() => undefined);
      }
      throw error;
    }

    if (scope) {
      await EmergencyOfflineStore.saveVault(scope, revision, documents).catch(() => undefined);
      // R6: file bytes are cached in the background so the folder renders as soon as metadata arrives
      // (previously one getDocument + download per document ran sequentially before returning).
      void VaultRepository.cacheEmergencyFiles(familyId, scope, revision, documents);
    }
    return { data: documents, fromCache: false };
  },

  /** Background offline caching of emergency file bytes; stops when a newer revision takes over. Never throws. */
  cacheEmergencyFiles: async (familyId: string, scope: string, revision: string, documents: VaultDocument[]) => {
    for (const doc of documents) {
      if (!EmergencyOfflineStore.isCurrent(scope)) break;
      try {
        const detail = await VaultRepository.getDocument(familyId, doc.documentId);
        if (detail.versionNumber !== doc.versionNumber) continue;
        const blob = await downloadEmergencyFile(detail.fileUrl);
        if (blob) await EmergencyOfflineStore.saveFile(scope, revision, doc, blob);
        else await EmergencyOfflineStore.removeFile(scope, revision, doc);
      } catch (error) {
        if (isEmergencyAccessFailure(error)) {
          await EmergencyOfflineStore.removeFile(scope, revision, doc).catch(() => undefined);
        }
      }
    }
  },

  getSavedEmergencyFile: async (familyId: string, doc: VaultDocument) => {
    const scope = SecureStorageService.getEmergencyCacheScope(familyId);
    return scope ? EmergencyOfflineStore.getFile(scope, doc) : undefined;
  },

  createShareLink: async (
    familyId: string,
    documentId: string,
    data: { expiryHours?: number; allowDownload?: boolean },
  ): Promise<ShareLink> => {
    const response = await apiClient.post<ApiResponse<ShareLink>>(
      resolvePath(MasterApiReference.Vault.Share, { familyId, documentId }),
      data,
    );
    return requireApiData(response.data, 'VaultRepository.createShareLink');
  },

  revokeShareLink: async (
    familyId: string,
    documentId: string,
    shareLinkId: string,
  ): Promise<boolean> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Vault.ShareLink, { familyId, documentId, shareLinkId }),
    );
    return response.data.data ?? false;
  },

  getDocumentByShareToken: async (token: string): Promise<DocumentDetail> => {
    const response = await apiClient.get<ApiResponse<DocumentDetail>>(
      resolvePath(MasterApiReference.Vault.ShareToken, { token }),
    );
    return requireApiData(response.data, 'VaultRepository.getDocumentByShareToken');
  },
};
