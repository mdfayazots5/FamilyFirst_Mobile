import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Download, Lock, AlertCircle, Tag, Clock } from 'lucide-react';
import { VaultRepository, DocumentDetail, CATEGORY_LABELS } from '../repositories/VaultRepository';
import ExpiryBadge from '../widgets/ExpiryBadge';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFShimmer from '../../../shared/components/FFShimmer';

const ShareDocumentViewScreen: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid share link.');
      setIsLoading(false);
      return;
    }
    VaultRepository.getDocumentByShareToken(token)
      .then(setDoc)
      .catch(() => setError('This share link has expired or been revoked.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-cream">
        <div className="bg-primary px-5 pt-12 pb-5">
          <div className="h-5 w-48 bg-white/20 rounded-full" />
        </div>
        <div className="px-4 pt-4 space-y-4">
          <FFShimmer className="h-[60vh] rounded-ff" />
          <FFShimmer className="h-36 rounded-ff" />
        </div>
        <div className="text-center mt-4">
          <p className="font-body text-sm text-gray-400">Loading secure document…</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center px-8 gap-5">
        <div className="w-16 h-16 bg-alert/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-alert" />
        </div>
        <h2 className="font-display font-semibold text-base text-primary text-center">Link Unavailable</h2>
        <p className="font-body text-sm text-gray-500 text-center">
          {error ?? 'This share link has expired or been revoked.'}
        </p>
        <div className="flex items-center gap-2 bg-black/[0.03] border border-black/5 rounded-xl px-4 py-3">
          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="font-body text-xs text-gray-500">Share links expire after 72 hours by default.</p>
        </div>
      </div>
    );
  }

  const uploadDate = new Date(doc.uploadDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const isImage = doc.fileUrl.match(/\.(jpg|jpeg|png|heic|heif)$/i);

  return (
    <div className="min-h-screen bg-bg-cream pb-16">
      {/* Header */}
      <div className="bg-primary px-5 pt-12 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-accent" />
          <span className="font-body text-xs text-white/60 font-semibold uppercase tracking-wide">Secure Shared Document</span>
        </div>
        <h1 className="font-display font-bold text-lg text-white truncate">{doc.documentName}</h1>
        <p className="font-body text-xs text-white/50 mt-0.5">{CATEGORY_LABELS[doc.category]}</p>
      </div>

      <main className="px-4 pt-4 pb-16 space-y-4">
        {/* Read-only notice */}
        <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3">
          <Lock className="w-4 h-4 text-accent flex-shrink-0" />
          <p className="font-body text-xs text-primary">
            View-only access via secure link · No FamilyFirst account required
          </p>
        </div>

        {/* Document viewer */}
        <FFCard className="overflow-hidden">
          {isImage ? (
            <img src={doc.fileUrl} alt={doc.documentName} className="w-full max-h-[60vh] object-contain" />
          ) : (
            <iframe src={doc.fileUrl} title={doc.documentName} className="w-full h-[60vh] border-0" />
          )}
        </FFCard>

        {/* Metadata */}
        <FFCard className="p-4 space-y-3">
          <MetaRow label="Document" value={doc.documentName} />
          <MetaRow label="For"      value={doc.memberName} />
          <MetaRow label="Uploaded" value={uploadDate} />
          {doc.expiryDate && (
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Expiry
              </span>
              <ExpiryBadge status={doc.expiryStatus} expiryDate={doc.expiryDate} />
            </div>
          )}
          {doc.tags.length > 0 && (
            <div className="flex items-start justify-between">
              <span className="font-body text-xs text-gray-400 mt-0.5">Tags</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                {doc.tags.map(tag => (
                  <span key={tag} className="font-body text-xs bg-black/5 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </FFCard>

        {/* Download — only if shareLink permits it */}
        {doc.activeShareLinks.some(l => l.allowDownload && !l.isRevoked) && (
          <a
            href={doc.fileUrl}
            download={doc.documentName}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FFButton icon={<Download className="w-4 h-4" />} className="w-full">
              Download Document
            </FFButton>
          </a>
        )}

        {/* Branding footer */}
        <div className="text-center pt-2">
          <p className="font-body text-xs text-gray-400">
            Shared securely via <span className="font-semibold text-primary">FamilyFirst</span>
          </p>
        </div>
      </main>
    </div>
  );
};

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="font-body text-xs text-gray-400">{label}</span>
    <span className="font-body text-sm text-primary">{value}</span>
  </div>
);

export default ShareDocumentViewScreen;
