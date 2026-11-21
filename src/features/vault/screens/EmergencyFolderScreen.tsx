import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository } from '../repositories/VaultRepository';
import type { VaultDocument } from '../repositories/VaultRepository';
import DocumentCard from '../widgets/DocumentCard';
import FFCard from '../../../shared/components/FFCard';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFButton from '../../../shared/components/FFButton';
import EmergencyCacheBanner from '../../../core/connectivity/EmergencyCacheBanner';

type FolderState =
  | { status: 'loading' | 'error' }
  | { status: 'ready'; documents: VaultDocument[]; fromCache: boolean };

type FilePreview = { url: string; canPreview: boolean };

const EmergencyFolderScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const familyId = user?.familyId;
  const [folder, setFolder] = useReducer((_previous: FolderState, next: FolderState) => next, { status: 'loading' });
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [selectedFile, setSelectedFile] = useState<VaultDocument | null>(null);
  const [preview, setPreview] = useState<FilePreview | 'loading' | 'unavailable'>('loading');

  useEffect(() => {
    let active = true;
    setFolder({ status: 'loading' });
    setSelectedFile(null);
    if (!familyId) {
      setFolder({ status: 'error' });
      return;
    }
    void VaultRepository.loadEmergencyDocuments(familyId)
      .then(({ data, fromCache }) => { if (active) setFolder({ status: 'ready', documents: data, fromCache }); })
      .catch(() => { if (active) setFolder({ status: 'error' }); });
    return () => { active = false; };
  }, [familyId, user?.id, loadAttempt]);

  useEffect(() => {
    if (!familyId || !selectedFile) return;
    let active = true;
    let url: string | undefined;
    void VaultRepository.getSavedEmergencyFile(familyId, selectedFile)
      .then(blob => {
        if (!active) return;
        if (!blob) {
          setPreview('unavailable');
          return;
        }
        url = URL.createObjectURL(blob);
        setPreview({ url, canPreview: blob.type !== 'application/octet-stream' });
      })
      .catch(() => { if (active) setPreview('unavailable'); });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [familyId, user?.id, selectedFile]);

  const documents = folder.status === 'ready' ? folder.documents : [];
  const fromCache = folder.status === 'ready' && folder.fromCache;

  const openDocument = (doc: VaultDocument) => {
    if (fromCache) {
      if (selectedFile?.documentId === doc.documentId) return;
      setPreview('loading');
      setSelectedFile(doc);
    } else {
      navigate('/vault/' + doc.documentId);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      {fromCache && <EmergencyCacheBanner />}

      {/* Emergency header — alert red is intentional for emergency context */}
      <div className="bg-alert px-5 pt-12 pb-5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {user && (
            <button onClick={() => navigate(-1)} className="grid min-h-12 min-w-12 place-items-center rounded-xl bg-white/10" aria-label="Go back">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-white" />
            <h1 className="font-display font-bold text-lg text-white">Emergency Folder</h1>
          </div>
        </div>
        <p className="font-body text-white/70 text-xs mt-2">View-only emergency documents</p>
      </div>

      <main className="px-4 pt-4 pb-24 space-y-5 page-enter">

        {selectedFile && (
          <FFCard className="p-4 space-y-3">
            <h2 className="font-display font-semibold text-primary">{selectedFile.documentName}</h2>
            {preview === 'loading' ? <FFShimmer className="h-12" /> : preview === 'unavailable' ? (
              <p className="text-sm text-primary">This file has no saved copy. Reconnect and reload the emergency folder.</p>
            ) : (
              <a
                href={preview.url}
                target={preview.canPreview ? '_blank' : undefined}
                rel="noopener noreferrer"
                download={preview.canPreview ? undefined : selectedFile.documentName}
                className="inline-flex min-h-12 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white"
              >
                {preview.canPreview ? 'Open saved file' : 'Download saved file'}
              </a>
            )}
            <FFButton className="ml-2" variant="outline" onClick={() => setSelectedFile(null)}>Close</FFButton>
          </FFCard>
        )}

        {/* Priority documents */}
        <div className="space-y-3">
          <FFSectionHeader icon={<ShieldAlert className="w-[18px] h-[18px]" />} title={`Priority Documents (${documents.length}/5)`} />

          {folder.status === 'loading' ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <FFShimmer key={i} className="h-16 rounded-ff" />)}
            </div>
          ) : folder.status === 'error' ? (
            <FFErrorState message="Unable to load priority documents." onRetry={() => setLoadAttempt(attempt => attempt + 1)} />
          ) : documents.length === 0 ? (
            <FFCard className="p-6 text-center">
              <p className="font-body text-sm text-gray-400">No documents tagged as emergency priority.</p>
              {user && !fromCache && (
                <button
                  onClick={() => navigate('/vault')}
                  className="mt-3 flex items-center gap-1 font-body text-xs text-accent font-semibold mx-auto"
                >
                  Tag documents <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </FFCard>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <DocumentCard
                  key={doc.documentId}
                  document={doc}
                  onClick={() => openDocument(doc)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmergencyFolderScreen;
