import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { ReportsRepository, DigestEntry } from '../repositories/ReportsRepository';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';

const ReportArchiveScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<DigestEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ReportsRepository.getDigestArchive(user.familyId);
      setEntries(data);
    } catch {
      setError('Could not load archive. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.familyId]);

  const handleOpen = (weekStartDate: string) => {
    navigate(`/reports/weekly?weekStartDate=${weekStartDate}`);
  };

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Report Archive"
        subtitle="Last 12 months of weekly digests"
        showBack
        rightAction={
          <button onClick={load} className="p-2 rounded-xl bg-white/10" aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-24 space-y-2">
        {isLoading ? (
          [...Array(6)].map((_, i) => <FFShimmer key={i} className="h-16 rounded-ff" />)
        ) : error ? (
          <FFErrorState message={error} onRetry={load} />
        ) : entries.length === 0 ? (
          <FFEmptyState
            icon={<Calendar className="w-10 h-10 text-gray-300" />}
            title="No archived digests yet"
            message="Weekly digests are stored every Sunday evening."
          />
        ) : (
          entries.map((entry, index) => (
            <button
              key={entry.weekStartDate}
              onClick={() => handleOpen(entry.weekStartDate)}
              className="w-full"
            >
              <FFCard className="flex items-center gap-4 p-4 text-left">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-numbers text-sm font-bold flex-shrink-0 ${
                  index === 0 ? 'bg-primary text-white' : 'bg-black/5 text-gray-400'
                }`}>
                  {index === 0 ? 'New' : `W${entries.length - index}`}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-primary truncate">
                    Week of {new Date(entry.weekStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">
                    Family Score: {entry.familyScore} · {entry.childCount} child{entry.childCount !== 1 ? 'ren' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`font-numbers text-xs font-bold px-2 py-0.5 rounded-full ${
                    entry.familyScore >= 80 ? 'text-success bg-success/10' :
                    entry.familyScore >= 60 ? 'text-accent bg-accent/10' :
                    'text-alert bg-alert/5'
                  }`}>
                    {entry.familyScore}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </FFCard>
            </button>
          ))
        )}

        {entries.length > 0 && (
          <p className="font-body text-xs text-gray-300 text-center pt-4">
            Digests older than 12 months are automatically removed.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReportArchiveScreen;
