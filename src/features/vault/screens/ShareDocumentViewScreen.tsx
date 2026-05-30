import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Download, Lock, RefreshCw, AlertCircle, Tag, Clock } from 'lucide-react';
import { VaultRepository, DocumentDetail, CATEGORY_LABELS } from '../repositories/VaultRepository';
import ExpiryBadge from '../widgets/ExpiryBadge';

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
      <div className="min-h-screen bg-[#F8F4EE] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
        <p className="text-sm text-gray-400">Loading secure document…</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-[#F8F4EE] flex flex-col items-center justify-center px-8 gap-5">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-base font-bold text-[#1A2E4A] text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Link Unavailable
        </h2>
        <p className="text-sm text-gray-500 text-center">
          {error ?? 'This share link has expired or been revoked.'}
        </p>
        <div className="flex items-center gap-2 bg-[#F8F4EE] border border-gray-200 rounded-xl px-4 py-3 mt-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <p className="text-xs text-gray-500">Share links expire after 72 hours by default.</p>
        </div>
      </div>
    );
  }

  const uploadDate = new Date(doc.uploadDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const isImage = doc.fileUrl.match(/\.(jpg|jpeg|png|heic|heif)$/i);

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Header */}
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[#C8922A]" />
          <span className="text-xs text-blue-200 font-medium uppercase tracking-wide">Secure Shared Document</span>
        </div>
        <h1 className="text-lg font-bold text-white truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {doc.documentName}
        </h1>
        <p className="text-xs text-blue-200 mt-0.5">{CATEGORY_LABELS[doc.category]}</p>
      </div>

      <div className="px-4 pt-4 pb-16 space-y-4">
        {/* Read-only notice */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            View-only access via secure link · No FamilyFirst account required
          </p>
        </div>

        {/* Document viewer */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isImage ? (
            <img src={doc.fileUrl} alt={doc.documentName} className="w-full max-h-[60vh] object-contain" />
          ) : (
            <iframe src={doc.fileUrl} title={doc.documentName} className="w-full h-[60vh] border-0" />
          )}
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Document</span>
            <span className="text-sm font-medium text-[#1A2E4A]">{doc.documentName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">For</span>
            <span className="text-sm text-gray-700">{doc.memberName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Uploaded</span>
            <span className="text-sm text-gray-700">{uploadDate}</span>
          </div>
          {doc.expiryDate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Expiry
              </span>
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

        {/* Download — only if shareLink permits it */}
        {doc.activeShareLinks.some(l => l.allowDownload && !l.isRevoked) && (
          <a
            href={doc.fileUrl}
            download={doc.documentName}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#1A2E4A] text-white rounded-2xl text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Download Document
          </a>
        )}

        {/* FamilyFirst branding footer */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">
            Shared securely via <span className="font-semibold text-[#1A2E4A]">FamilyFirst</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareDocumentViewScreen;
