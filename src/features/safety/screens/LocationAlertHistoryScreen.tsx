import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { SafetyRepository, LocationAlert } from '../repositories/SafetyRepository';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';

const ALERT_META: Record<string, { label: string; badge: string }> = {
  ZoneArrival:           { label: 'Arrived',        badge: 'text-success bg-success/10 border-success/20' },
  ZoneDeparture:         { label: 'Departed',       badge: 'text-primary bg-primary/10 border-primary/20' },
  LateAlert:             { label: 'Late Alert',     badge: 'text-accent bg-accent/10 border-accent/20' },
  SOS:                   { label: 'SOS',            badge: 'text-alert bg-alert/10 border-alert/20' },
  BatteryWarning:        { label: 'Low Battery',    badge: 'text-accent bg-accent/10 border-accent/20' },
  LocationStale:         { label: 'Stale',          badge: 'text-gray-500 bg-black/5 border-black/10' },
  LocationSharingPaused: { label: 'Sharing Paused', badge: 'text-gray-500 bg-black/5 border-black/10' },
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
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Alert History"
        subtitle={`${alerts.length} alert${alerts.length !== 1 ? 's' : ''}`}
        showBack
        rightAction={
          <div className="flex items-center gap-1">
            <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-xl bg-white/10" aria-label="Filter">
              <Filter className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => load()} className="p-2 rounded-xl bg-white/10" aria-label="Refresh">
              <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* Filter chips — inside header extension */}
      {showFilters && (
        <div className="bg-primary px-4 pb-3 flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => handleFilterChange(opt)}
              className={`px-3 py-1 rounded-full font-body text-xs font-medium transition-colors ${
                filterType === opt ? 'bg-accent text-white' : 'bg-white/15 text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pt-4 pb-24 space-y-3">
        {/* Active SOS prompt */}
        {unresolvedSos.length > 0 && (
          <div className="bg-alert text-white rounded-ff p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-display font-bold text-sm">
                {unresolvedSos.length} unresolved SOS alert{unresolvedSos.length > 1 ? 's' : ''}
              </p>
              <p className="font-body text-xs text-white/70 mt-0.5">Mark as resolved once child is confirmed safe.</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <FFShimmer key={i} className="h-16 rounded-ff" />)}
          </div>
        ) : alerts.length === 0 ? (
          <FFEmptyState
            title="No alerts"
            message={filterType === 'All' ? 'All safe zones are quiet.' : `No ${filterType} alerts found.`}
          />
        ) : (
          alerts.map(alert => {
            const meta = ALERT_META[alert.alertType] ?? { label: alert.alertType, badge: 'text-gray-500 bg-black/5 border-black/10' };
            return (
              <FFCard
                key={alert.alertId}
                className={`p-4 ${
                  alert.alertType === 'SOS' && !alert.isResolved
                    ? 'border border-alert/40'
                    : alert.isResolved ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${meta.badge}`}>
                    {meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-primary">{alert.memberName}</p>
                    {alert.zoneName && <p className="font-body text-xs text-gray-500">{alert.zoneName}</p>}
                    {alert.latitude != null && (
                      <p className="font-numbers text-xs text-gray-400">
                        {alert.latitude.toFixed(4)}, {alert.longitude?.toFixed(4)}
                      </p>
                    )}
                    {alert.isResolved && (
                      <p className="font-body text-xs text-success mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Resolved {alert.resolvedAt ? formatTime(alert.resolvedAt) : ''}
                        {alert.resolutionNote ? ` — ${alert.resolutionNote}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-numbers text-xs text-gray-400">{formatTime(alert.triggeredAt)}</p>
                    {!alert.isResolved && alert.alertType === 'SOS' && (
                      <button
                        onClick={() => handleResolve(alert.alertId)}
                        disabled={resolvingId === alert.alertId}
                        className="mt-2 font-body text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-xl disabled:opacity-60"
                      >
                        {resolvingId === alert.alertId ? '…' : 'Resolve'}
                      </button>
                    )}
                  </div>
                </div>
              </FFCard>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LocationAlertHistoryScreen;
