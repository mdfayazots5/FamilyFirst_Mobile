import React, { useState } from 'react';
import { X, Link2, Download, Clock, Copy, Check } from 'lucide-react';
import { VaultRepository, ShareLink } from '../repositories/VaultRepository';
import { useAuth } from '../../../core/auth/AuthContext';

interface SecureShareModalProps {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

const SecureShareModal: React.FC<SecureShareModalProps> = ({ documentId, documentName, onClose }) => {
  const { user } = useAuth();
  const [expiryHours, setExpiryHours] = useState(72);
  const [allowDownload, setAllowDownload] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user?.familyId) return;
    setIsCreating(true);
    setError(null);
    try {
      const link = await VaultRepository.createShareLink(user.familyId, documentId, {
        expiryHours, allowDownload,
      });
      setShareLink(link);
    } catch {
      setError('Failed to create share link. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = () => {
    if (!shareLink) return;
    const fullUrl = `${window.location.origin}${shareLink.shareUrl}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#1A2E4A]" />
            <h2 className="text-base font-bold text-[#1A2E4A]">Share Document</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 truncate">
            <span className="font-medium text-[#1A2E4A]">{documentName}</span>
          </p>

          {!shareLink ? (
            <>
              {/* Expiry picker */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  Link expires after
                </label>
                <div className="flex gap-2">
                  {[24, 72, 168].map(h => (
                    <button
                      key={h}
                      onClick={() => setExpiryHours(h)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors
                        ${expiryHours === h
                          ? 'bg-[#1A2E4A] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {h === 24 ? '1 day' : h === 72 ? '3 days' : '7 days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Allow download</span>
                </div>
                <button
                  onClick={() => setAllowDownload(v => !v)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    allowDownload ? 'bg-[#1A2E4A]' : 'bg-gray-300'
                  }`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1
                    ${allowDownload ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full py-3 bg-[#1A2E4A] text-white rounded-xl font-semibold
                           hover:bg-opacity-90 disabled:opacity-50 transition-all"
              >
                {isCreating ? 'Creating link…' : 'Create Secure Link'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                No FamilyFirst account required to view · Read-only
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-3 bg-[#F8F4EE] rounded-xl">
                <Clock className="w-4 h-4 text-[#C8922A] flex-shrink-0" />
                <p className="text-xs text-gray-600 flex-1">
                  Expires {new Date(shareLink.expiresAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-500 truncate">
                  {`${window.location.origin}${shareLink.shareUrl}`}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-2 bg-[#1A2E4A] text-white rounded-xl text-sm font-medium"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecureShareModal;
