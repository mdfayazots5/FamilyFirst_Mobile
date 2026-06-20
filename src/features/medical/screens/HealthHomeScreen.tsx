import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { MedicalProvider, useMedical } from '../providers/MedicalProvider';
import HealthSummaryCard from '../widgets/HealthSummaryCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFErrorState from '../../../shared/components/FFErrorState';

const HealthHomeContent: React.FC = () => {
  const navigate = useNavigate();
  const { summaries, isLoading, error, loadSummaries } = useMedical();

  useEffect(() => { loadSummaries(); }, [loadSummaries]);

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Health Records"
        subtitle="Family health profiles · Emergency cards"
        rightAction={
          <button
            onClick={() => navigate('/medical/add')}
            className="p-2 rounded-xl bg-white/10"
            aria-label="Add health profile"
          >
            <Heart className="w-5 h-5 text-white" />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-24 space-y-3 page-enter">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <FFShimmer key={i} className="h-24 rounded-ff" />)}
          </div>
        ) : error ? (
          <FFErrorState message={error} onRetry={loadSummaries} />
        ) : summaries.length === 0 ? (
          <FFEmptyState
            title="No health profiles yet"
            message="Add your family members' health information to get started."
            actionLabel="Add Profile"
            onAction={() => navigate('/medical/add')}
          />
        ) : (
          summaries.map(s => (
            <HealthSummaryCard
              key={s.memberId}
              summary={s}
              onClick={() => navigate(`/medical/${s.memberId}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const HealthHomeScreen: React.FC = () => (
  <MedicalProvider>
    <HealthHomeContent />
  </MedicalProvider>
);

export default HealthHomeScreen;
