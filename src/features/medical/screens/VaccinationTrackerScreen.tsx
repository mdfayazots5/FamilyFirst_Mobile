import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Syringe, Plus } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { MedicalRepository, VaccinationEntry } from '../repositories/MedicalRepository';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';

const STATUS_ORDER = { Overdue: 0, Due: 1, Given: 2, NotApplicable: 3 };

const STATUS_STYLE: Record<string, { border: string; badge: string }> = {
  Given:         { border: 'border-success/20',  badge: 'bg-success/10 text-success' },
  Due:           { border: 'border-accent/20',   badge: 'bg-accent/10 text-accent' },
  Overdue:       { border: 'border-alert/20',    badge: 'bg-alert/10 text-alert' },
  NotApplicable: { border: 'border-black/5',     badge: 'bg-black/5 text-gray-400' },
};

const VaccinationTrackerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  const { user } = useAuth();

  const [vaccinations, setVaccinations] = useState<VaccinationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.familyId || !memberId) return;
    MedicalRepository.listVaccinations(user.familyId, memberId)
      .then(v => setVaccinations([...v].sort((a, b) =>
        (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9),
      )))
      .finally(() => setIsLoading(false));
  }, [user?.familyId, memberId]);

  const markAsGiven = async (vaccinationId: string) => {
    if (!user?.familyId || !memberId) return;
    setMarkingId(vaccinationId);
    try {
      const today = new Date().toISOString().split('T')[0];
      const updated = await MedicalRepository.updateVaccinationStatus(
        user.familyId, memberId, vaccinationId, { status: 'Given', givenDate: today },
      );
      setVaccinations(prev => prev.map(v => v.vaccinationId === vaccinationId ? updated : v));
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Vaccination Tracker"
        subtitle={isLoading ? '' : `${vaccinations.length} vaccines recorded`}
        showBack
      />

      <div className="px-4 pt-4 pb-24 space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <FFShimmer key={i} className="h-16 rounded-ff" />)}
          </div>
        ) : (
          <>
            {vaccinations.map(v => {
              const style = STATUS_STYLE[v.status] ?? STATUS_STYLE.NotApplicable;
              return (
                <div
                  key={v.vaccinationId}
                  className={`bg-white border ${style.border} rounded-ff p-4 shadow-card`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Syringe className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <div>
                        <p className="font-body text-sm font-semibold text-primary">{v.vaccineName}</p>
                        <p className="font-body text-xs text-gray-500 mt-0.5">
                          {v.status === 'Given' && v.givenDate
                            ? `Given: ${new Date(v.givenDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : v.dueDate
                            ? `Due: ${new Date(v.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            : v.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
                        {v.status}
                      </span>
                      {(v.status === 'Due' || v.status === 'Overdue') && (
                        <button
                          onClick={() => markAsGiven(v.vaccinationId)}
                          disabled={markingId === v.vaccinationId}
                          className="font-body text-xs font-semibold px-3 py-1.5 bg-primary text-white rounded-xl disabled:opacity-50"
                        >
                          {markingId === v.vaccinationId ? '…' : 'Mark Given'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-black/10 rounded-ff font-body text-gray-400 hover:border-primary hover:text-primary transition-colors"
              onClick={() => {/* navigate to add vaccination form */}}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Vaccination Record</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VaccinationTrackerScreen;
