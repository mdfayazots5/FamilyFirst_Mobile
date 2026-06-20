import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Download, Share2, Trash2, Clock, Tag, Star, History, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository, DocumentDetail, CATEGORY_LABELS } from '../repositories/VaultRepository';
import ExpiryBadge from '../widgets/ExpiryBadge';
import SecureShareModal from '../widgets/SecureShareModal';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFErrorState from '../../../shared/components/FFErrorState';

const DocumentDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useAuth();

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const load = () => {
    if (!user?.familyId || !documentId) return;
    setIsLoading(true);
    setLoadError(false);
    VaultRepository.getDocument(user.familyId, documentId)
      .then(setDoc)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [user?.familyId, documentId]);

  const handleDelete = async () => {
    if (!user?.familyId || !documentId || deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await VaultRepository.deleteDocument(user.familyId, documentId);
      navigate('/vault', { replace: true });
    } catch {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-cream">
        <FFPageHeader title="Document" showBack />
        <div className="px-4 pt-4 space-y-4">
          <FFShimmer className="h-48 rounded-ff" />
          <FFShimmer className="h-36 rounded-ff" />
          <FFShimmer className="h-24 rounded-ff" />
        </div>
      </div>
    );
  }

  if (loadError || !doc) {
    return (
      <div className="min-h-screen bg-bg-cream">
        <FFPageHeader title="Document" showBack />
        <div className="px-4 pt-8">
          <FFErrorState message="Document not found." onRetry={load} />
        </div>
      </div>
    );
  }

  const uploadDate = new Date(doc.uploadDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title={doc.documentName}
        subtitle={CATEGORY_LABELS[doc.category]}
        showBack
        rightAction={
          doc.isEmergencyPriority ? (
            <Star className="w-5 h-5 text-accent" fill="currentColor" />
          ) : undefined
        }
      />

      <main className="px-4 pt-4 pb-24 space-y-4 page-enter">
        {/* Document preview */}
        <FFCard className="overflow-hidden">
          {doc.fileUrl.includes('demo') || !doc.fileUrl ? (
            <div className="h-56 flex flex-col items-center justify-center gap-3 bg-black/[0.02]">
              <div className="w-16 h-16 bg-bg-cream rounded-ff flex items-center justify-center">
                <span className="text-3xl">📄</span>
              </div>
              <p className="font-body text-xs text-gray-400">Document preview</p>
            </div>
          ) : doc.fileUrl.match(/\.(jpg|jpeg|png|heic)$/i) ? (
            <img src={doc.fileUrl} alt={doc.documentName} className="w-full h-56 object-cover" />
          ) : (
            <iframe src={doc.fileUrl} title={doc.documentName} className="w-full h-56 border-0" />
          )}
        </FFCard>

        {/* Metadata */}
        <FFCard className="p-4 space-y-3">
          <MetaRow label="Member"   value={doc.memberName} />
          <MetaRow label="Uploaded" value={uploadDate} />
          <MetaRow label="Version"  value={`v${doc.versionNumber}`} />
          {doc.expiryDate && (
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-gray-400">Expiry</span>
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

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <FFButton
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={() => window.open(doc.fileUrl, '_blank')}
            className="w-full"
          >
            Download
          </FFButton>
          <FFButton
            icon={<Share2 className="w-4 h-4" />}
            onClick={() => setShowShareModal(true)}
            className="w-full"
          >
            Share
          </FFButton>
        </div>

        {/* Version history */}
        {doc.versionHistory.length > 0 && (
          <FFCard className="overflow-hidden">
            <button
              onClick={() => setShowVersionHistory(v => !v)}
              className="flex items-center justify-between w-full p-4"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                <span className="font-display font-semibold text-sm text-primary">
                  Version History ({doc.versionHistory.length})
                </span>
              </div>
              {showVersionHistory
                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                : <ChevronDown className="w-4 h-4 text-gray-400" />
              }
            </button>
            {showVersionHistory && (
              <div className="px-4 pb-4 space-y-2 border-t border-black/5 pt-3">
                {doc.versionHistory.map(v => (
                  <div key={v.versionId} className="flex items-center justify-between font-body text-xs">
                    <span className="text-gray-500">Version {v.versionNumber}</span>
                    <span className="text-gray-400">
                      {new Date(v.archivedAt).toLocaleDateString('en-IN')}
                    </span>
                    <button
                      onClick={() => window.open(v.fileUrl, '_blank')}
                      className="text-accent font-semibold"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FFCard>
        )}

        {/* Delete */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 font-body text-sm font-semibold text-alert py-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Document
          </button>
        ) : (
          <FFCard className="p-4 space-y-3 border border-alert/20">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-alert" />
              <p className="font-display font-semibold text-sm text-alert">30-day recovery window applies</p>
            </div>
            <p className="font-body text-xs text-gray-500">Type DELETE to confirm</p>
            <input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-alert/30 font-body text-sm focus:outline-none focus:ring-1 focus:ring-alert/20"
              placeholder="DELETE"
            />
            <div className="flex gap-2">
              <FFButton variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </FFButton>
              <FFButton
                variant="alert"
                className="flex-1"
                onClick={handleDelete}
                disabled={deleteConfirmText !== 'DELETE'}
                isLoading={isDeleting}
              >
                Delete
              </FFButton>
            </div>
          </FFCard>
        )}
      </main>

      {showShareModal && (
        <SecureShareModal
          documentId={doc.documentId}
          documentName={doc.documentName}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

const MetaRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="font-body text-xs text-gray-400">{label}</span>
    <span className="font-body text-sm text-primary">{value}</span>
  </div>
);

export default DocumentDetailScreen;
