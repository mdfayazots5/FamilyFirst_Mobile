import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ChevronRight, Calendar } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { ReportsRepository, DigestEntry } from '../repositories/ReportsRepository';

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
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Report Archive
            </h1>
            <p className="text-xs text-blue-200">Last 12 months of weekly digests</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl bg-white/10">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500">{error}</p>
            <button onClick={load} className="mt-3 text-xs text-[#1A2E4A] underline">Retry</button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No archived digests yet.</p>
            <p className="text-xs text-gray-300 mt-1">Weekly digests are stored every Sunday evening.</p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <button
              key={entry.weekStartDate}
              onClick={() => handleOpen(entry.weekStartDate)}
              className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm text-left"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                index === 0 ? 'bg-[#1A2E4A] text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {index === 0 ? 'New' : `W${entries.length - index}`}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A2E4A] truncate">
                  Week of {new Date(entry.weekStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Family Score: {entry.familyScore} · {entry.childCount} child{entry.childCount !== 1 ? 'ren' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  entry.familyScore >= 80 ? 'text-green-700 bg-green-50' :
                  entry.familyScore >= 60 ? 'text-amber-700 bg-amber-50' :
                  'text-red-600 bg-red-50'
                }`}>
                  {entry.familyScore}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </button>
          ))
        )}

        <p className="text-xs text-gray-300 text-center pt-4">
          Digests older than 12 months are automatically removed.
        </p>
      </div>
    </div>
  );
};

export default ReportArchiveScreen;
