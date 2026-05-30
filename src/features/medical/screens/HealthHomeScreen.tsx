import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, Plus, RefreshCw } from 'lucide-react';
import { MedicalProvider, useMedical } from '../providers/MedicalProvider';
import HealthSummaryCard from '../widgets/HealthSummaryCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFButton from '../../../shared/components/FFButton';

const HealthHomeContent: React.FC = () => {
  const navigate = useNavigate();
  const { summaries, isLoading, error, loadSummaries } = useMedical();

  useEffect(() => { loadSummaries(); }, [loadSummaries]);

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C8922A]" />
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Health Records
            </h1>
          </div>
        </div>
        <p className="text-blue-200 text-xs mt-1">Family health profiles · Emergency cards</p>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <FFButton variant="secondary" size="sm" onClick={loadSummaries}>Retry</FFButton>
          </div>
        ) : summaries.length === 0 ? (
          <FFEmptyState
            title="No health profiles yet"
            subtitle="Add your family members' health information to get started."
          />
        ) : (
          summaries.map((s, i) => (
            <motion.div
              key={s.memberId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <HealthSummaryCard
                summary={s}
                onClick={() => navigate(`/medical/${s.memberId}`)}
              />
            </motion.div>
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
