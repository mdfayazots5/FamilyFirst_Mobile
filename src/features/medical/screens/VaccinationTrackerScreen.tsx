import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Syringe, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { MedicalRepository, VaccinationEntry } from '../repositories/MedicalRepository';
import FFButton from '../../../shared/components/FFButton';

const STATUS_ORDER = { Overdue: 0, Due: 1, Given: 2, NotApplicable: 3 };

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

  const STATUS_COLOR: Record<string, string> = {
    Given: 'bg-green-50 text-green-700 border-green-200',
    Due: 'bg-amber-50 text-amber-700 border-amber-200',
    Overdue: 'bg-red-50 text-red-700 border-red-200',
    NotApplicable: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Vaccination Tracker
            </h1>
            <p className="text-xs text-blue-200">{vaccinations.length} vaccines recorded</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : (
          <>
            {vaccinations.map(v => (
              <div
                key={v.vaccinationId}
                className={`bg-white rounded-2xl p-4 shadow-sm border ${STATUS_COLOR[v.status] ?? ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Syringe className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#1A2E4A]">{v.vaccineName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {v.status === 'Given' && v.givenDate
                          ? `Given: ${new Date(v.givenDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : v.dueDate
                          ? `Due: ${new Date(v.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : v.status}
                      </p>
                    </div>
                  </div>
                  {(v.status === 'Due' || v.status === 'Overdue') && (
                    <button
                      onClick={() => markAsGiven(v.vaccinationId)}
                      disabled={markingId === v.vaccinationId}
                      className="text-xs font-semibold px-3 py-1.5 bg-[#1A2E4A] text-white rounded-xl disabled:opacity-50"
                    >
                      {markingId === v.vaccinationId ? '…' : 'Mark Given'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-[#1A2E4A] hover:text-[#1A2E4A] transition-colors"
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
