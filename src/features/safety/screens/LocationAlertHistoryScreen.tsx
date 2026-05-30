import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle, Filter } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { SafetyRepository, LocationAlert } from '../repositories/SafetyRepository';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const ALERT_META: Record<string, { label: string; badgeClass: string }> = {
  ZoneArrival:           { label: 'Arrived',         badgeClass: 'text-green-700 bg-green-50 border-green-200' },
  ZoneDeparture:         { label: 'Departed',        badgeClass: 'text-blue-700 bg-blue-50 border-blue-200' },
  LateAlert:             { label: 'Late Alert',      badgeClass: 'text-amber-700 bg-amber-50 border-amber-200' },
  SOS:                   { label: '🆘 SOS',          badgeClass: 'text-red-700 bg-red-50 border-red-200' },
  BatteryWarning:        { label: 'Low Battery',     badgeClass: 'text-orange-700 bg-orange-50 border-orange-200' },
  LocationStale:         { label: 'Stale',           badgeClass: 'text-gray-600 bg-gray-50 border-gray-200' },
  LocationSharingPaused: { label: 'Sharing Paused',  badgeClass: 'text-gray-600 bg-gray-50 border-gray-200' },
};

const FILTER_OPTIONS = ['All', 'ZoneArrival', 'ZoneDeparture', 'LateAlert', 'SOS', 'BatteryWarning'];

const LocationAlertHistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<LocationAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('All');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const load = async (type?: string) => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const { items } = await SafetyRepository.listAlerts(user.familyId, {
        alertType: (type ?? filterType) === 'All' ? undefined : (type ?? filterType),
      });
      setAlerts(items);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.familyId]);

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setShowFilters(false);
    load(type);
  };

  const handleResolve = async (alertId: string) => {
    if (!user?.familyId) return;
    setResolvingId(alertId);
    try {
      await SafetyRepository.resolveAlert(user.familyId, alertId);
      setAlerts(prev => prev.map(a => a.alertId === alertId ? { ...a, isResolved: true } : a));
    } finally {
      setResolvingId(null);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    return isToday
      ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
        ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const unresolvedSos = alerts.filter(a => a.alertType === 'SOS' && !a.isResolved);

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Alert History
            </h1>
            <p className="text-xs text-blue-200">{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-xl bg-white/10">
            <Filter className="w-4 h-4 text-white" />
          </button>
          <button onClick={() => load()} className="p-2 rounded-xl bg-white/10">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => handleFilterChange(opt)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterType === opt
                    ? 'bg-[#C8922A] text-white'
                    : 'bg-white/15 text-white'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4 pb-24 space-y-3">
        {/* Active SOS prompt */}
        {unresolvedSos.length > 0 && (
          <div className="bg-red-600 text-white rounded-2xl p-4">
            <p className="text-sm font-bold">⚠ {unresolvedSos.length} unresolved SOS alert{unresolvedSos.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-red-200 mt-1">Mark as resolved once child is confirmed safe.</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <FFEmptyState
            title="No alerts"
            subtitle={filterType === 'All' ? 'All safe zones are quiet.' : `No ${filterType} alerts found.`}
          />
        ) : (
          alerts.map(alert => {
            const meta = ALERT_META[alert.alertType] ?? { label: alert.alertType, badgeClass: 'text-gray-600 bg-gray-50 border-gray-200' };
            return (
              <div
                key={alert.alertId}
                className={`bg-white rounded-2xl p-4 shadow-sm border ${
                  alert.alertType === 'SOS' && !alert.isResolved
                    ? 'border-red-300'
                    : alert.isResolved
                      ? 'border-transparent opacity-70'
                      : 'border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${meta.badgeClass}`}>
                    {meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A2E4A]">{alert.memberName}</p>
                    {alert.zoneName && (
                      <p className="text-xs text-gray-500">{alert.zoneName}</p>
                    )}
                    {alert.latitude != null && (
                      <p className="text-xs text-gray-400">
                        {alert.latitude.toFixed(4)}, {alert.longitude?.toFixed(4)}
                      </p>
                    )}
                    {alert.isResolved && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Resolved {alert.resolvedAt ? formatTime(alert.resolvedAt) : ''}
                        {alert.resolutionNote ? ` — ${alert.resolutionNote}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">{formatTime(alert.triggeredAt)}</p>
                    {!alert.isResolved && alert.alertType === 'SOS' && (
                      <button
                        onClick={() => handleResolve(alert.alertId)}
                        disabled={resolvingId === alert.alertId}
                        className="mt-2 text-xs font-semibold text-white bg-[#1A2E4A] px-3 py-1.5 rounded-xl disabled:opacity-60"
                      >
                        {resolvingId === alert.alertId ? '…' : 'Resolve'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LocationAlertHistoryScreen;
