import React from 'react';
import { FileText, AlertTriangle, Star, ChevronRight } from 'lucide-react';
import type { VaultDocument } from '../repositories/VaultRepository';
import ExpiryBadge from './ExpiryBadge';

interface DocumentCardProps {
  document: VaultDocument;
  onClick: () => void;
  onDelete?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick }) => {
  const uploadDate = new Date(document.uploadDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-4 bg-white rounded-2xl shadow-sm border border-gray-100
                 hover:shadow-md active:scale-[0.99] transition-all duration-150 text-left"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F8F4EE] flex items-center justify-center">
        <FileText className="w-5 h-5 text-[#1A2E4A]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-[#1A2E4A] truncate">{document.documentName}</p>
          {document.isEmergencyPriority && (
            <Star className="w-3.5 h-3.5 text-[#C8922A] flex-shrink-0" fill="currentColor" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-500">{document.memberName}</span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-xs text-gray-500">{uploadDate}</span>
          {document.versionNumber > 1 && (
            <>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-400">v{document.versionNumber}</span>
            </>
          )}
        </div>
        <div className="mt-1">
          <ExpiryBadge status={document.expiryStatus} expiryDate={document.expiryDate} compact />
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {(document.expiryStatus === 'Red') && (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </button>
  );
};

export default DocumentCard;
