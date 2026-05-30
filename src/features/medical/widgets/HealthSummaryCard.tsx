import React from 'react';
import { Heart, Pill, Syringe, AlertTriangle, ChevronRight } from 'lucide-react';
import type { HealthProfileSummary } from '../repositories/MedicalRepository';

interface HealthSummaryCardProps {
  summary: HealthProfileSummary;
  onClick: () => void;
}

const HealthSummaryCard: React.FC<HealthSummaryCardProps> = ({ summary, onClick }) => {
  const nextVacc = summary.nextVaccinationDue
    ? new Date(summary.nextVaccinationDue).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;

  const daysUntilVacc = summary.nextVaccinationDue
    ? Math.ceil((new Date(summary.nextVaccinationDue).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full p-4 bg-white rounded-2xl shadow-sm border border-gray-100
                 hover:shadow-md active:scale-[0.99] transition-all duration-150 text-left"
    >
      {/* Blood group badge */}
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex flex-col items-center justify-center flex-shrink-0">
        <Heart className="w-4 h-4 text-red-500 mb-0.5" fill="currentColor" />
        <span className="text-sm font-bold text-red-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {summary.bloodGroup || '?'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#1A2E4A]">{summary.memberName}</p>
          {!summary.isProfileComplete && (
            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">Incomplete</span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {summary.hasAllergies && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="w-3 h-3" />Allergies
            </span>
          )}
          {summary.activeMedicationCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <Pill className="w-3 h-3" />{summary.activeMedicationCount} medication{summary.activeMedicationCount > 1 ? 's' : ''}
            </span>
          )}
          {nextVacc && (
            <span className={`flex items-center gap-1 text-xs ${
              daysUntilVacc !== null && daysUntilVacc <= 14 ? 'text-amber-600' : 'text-gray-500'
            }`}>
              <Syringe className="w-3 h-3" />Vacc {nextVacc}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </button>
  );
};

export default HealthSummaryCard;
