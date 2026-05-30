import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Download, Share2, Trash2, Clock, Tag, Star, RefreshCw, History,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository, DocumentDetail, CATEGORY_LABELS } from '../repositories/VaultRepository';
import ExpiryBadge from '../widgets/ExpiryBadge';
import SecureShareModal from '../widgets/SecureShareModal';
import FFButton from '../../../shared/components/FFButton';

const DocumentDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useAuth();

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (!user?.familyId || !documentId) return;
    setIsLoading(true);
    VaultRepository.getDocument(user.familyId, documentId)
      .then(setDoc)
      .finally(() => setIsLoading(false));
  }, [user?.familyId, documentId]);

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
      <div className="min-h-screen bg-[#F8F4EE] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#F8F4EE] flex flex-col items-center justify-center p-6">
        <p className="text-sm text-gray-500 mb-4">Document not found.</p>
        <FFButton onClick={() => navigate('/vault')}>Back to Vault</FFButton>
      </div>
    );
  }

  const uploadDate = new Date(doc.uploadDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Header */}
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {doc.documentName}
            </h1>
            <p className="text-xs text-blue-200">{CATEGORY_LABELS[doc.category]}</p>
          </div>
          {doc.isEmergencyPriority && (
            <Star className="w-5 h-5 text-[#C8922A]" fill="currentColor" />
          )}
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Document preview */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {doc.fileUrl.includes('demo') || !doc.fileUrl ? (
            <div className="h-56 flex flex-col items-center justify-center gap-3 bg-gray-50">
              <div className="w-16 h-16 bg-[#F8F4EE] rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📄</span>
              </div>
              <p className="text-xs text-gray-400">Document preview</p>
            </div>
          ) : doc.fileUrl.match(/\.(jpg|jpeg|png|heic)$/i) ? (
            <img src={doc.fileUrl} alt={doc.documentName} className="w-full h-56 object-cover" />
          ) : (
            <iframe src={doc.fileUrl} title={doc.documentName} className="w-full h-56 border-0" />
          )}
        </div>

        {/* Metadata card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Member</span>
            <span className="text-sm font-medium text-[#1A2E4A]">{doc.memberName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Uploaded</span>
            <span className="text-sm text-gray-700">{uploadDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Version</span>
            <span className="text-sm text-gray-700">v{doc.versionNumber}</span>
          </div>
          {doc.expiryDate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Expiry</span>
              <ExpiryBadge status={doc.expiryStatus} expiryDate={doc.expiryDate} />
            </div>
          )}
          {doc.tags.length > 0 && (
            <div className="flex items-start justify-between">
              <span className="text-xs text-gray-500 mt-0.5">Tags</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                {doc.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.open(doc.fileUrl, '_blank')}
            className="flex items-center justify-center gap-2 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-sm font-medium text-[#1A2E4A]"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center justify-center gap-2 p-3 bg-[#1A2E4A] rounded-2xl shadow-sm text-sm font-medium text-white"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Version history */}
        {doc.versionHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm">
            <button
              onClick={() => setShowVersionHistory(v => !v)}
              className="flex items-center justify-between w-full p-4"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-[#1A2E4A]">
                  Version History ({doc.versionHistory.length})
                </span>
              </div>
              <span className="text-xs text-gray-400">{showVersionHistory ? '▲' : '▼'}</span>
            </button>
            {showVersionHistory && (
              <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                {doc.versionHistory.map(v => (
                  <div key={v.versionId} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Version {v.versionNumber}</span>
                    <span className="text-gray-400">
                      {new Date(v.archivedAt).toLocaleDateString('en-IN')}
                    </span>
                    <button
                      onClick={() => window.open(v.fileUrl, '_blank')}
                      className="text-[#C8922A] font-medium"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-red-500 text-sm font-medium py-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Document
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" />
              <p className="text-sm font-semibold text-red-700">30-day recovery window applies</p>
            </div>
            <p className="text-xs text-red-600">Type DELETE to confirm</p>
            <input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-red-300 text-sm focus:outline-none"
              placeholder="DELETE"
            />
            <div className="flex gap-2">
              <FFButton variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </FFButton>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

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

export default DocumentDetailScreen;
