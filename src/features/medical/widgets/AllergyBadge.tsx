import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AllergyEntry } from '../repositories/MedicalRepository';

interface AllergyBadgeProps {
  allergies: AllergyEntry[];
  compact?: boolean;
}

const AllergyBadge: React.FC<AllergyBadgeProps> = ({ allergies, compact = false }) => {
  if (allergies.length === 0) return null;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3 h-3" />
        {allergies.length} {allergies.length === 1 ? 'allergy' : 'allergies'}
      </span>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="text-sm font-semibold text-amber-800">Known Allergies</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {allergies.map((a, i) => (
          <span
            key={i}
            className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium"
          >
            {a.text} <span className="text-amber-500">({a.category})</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default AllergyBadge;
