import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, CheckCircle, MapPin, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { SafetyRepository, LocationAlert } from '../repositories/SafetyRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';

// SL-06 — Parent SOS Alert Screen
// Deep-link from FCM: /safety/sos-alert?alertId=<uuid>&memberId=<uuid>

const SosAlertScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const alertId  = searchParams.get('alertId');
  const memberId = searchParams.get('memberId');

  const [alert, setAlert]         = useState<LocationAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [note, setNote]           = useState('');
  const [resolved, setResolved]   = useState(false);

  useEffect(() => {
    if (!user?.familyId) return;
    SafetyRepository.listAlerts(user.familyId, {
      alertType: 'SOS',
      memberId:  memberId ?? undefined,
    }).then(({ items }) => {
      const found = alertId
        ? items.find(a => a.alertId === alertId)
        : items.find(a => a.alertType === 'SOS' && !a.isResolved);
      setAlert(found ?? items[0] ?? null);
    }).finally(() => setIsLoading(false));
  }, [user?.familyId, alertId, memberId]);

  const handleResolve = async () => {
    if (!user?.familyId || !alert) return;
    setResolving(true);
    try {
      await SafetyRepository.resolveAlert(user.familyId, alert.alertId, note || undefined);
      setResolved(true);
    } finally {
      setResolving(false);
    }
  };

  const mapsUrl = alert?.latitude != null
    ? `https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-alert flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse" />
      </div>
    );
  }

  if (resolved) {
    return (
      <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center gap-6 px-6">
        <div className="bg-white rounded-ff p-8 text-center shadow-card w-full max-w-sm">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="font-display font-bold text-xl text-primary">Alert Resolved</h1>
          <p className="font-body text-sm text-gray-500 mt-2">
            SOS marked as resolved. Stay with your child until they are confirmed safe.
          </p>
          <FFButton onClick={() => navigate('/safety')} className="mt-6 w-full">
            Back to Safety
          </FFButton>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center gap-4 px-6">
        <AlertTriangle className="w-12 h-12 text-gray-300" />
        <p className="font-body text-gray-500 text-sm text-center">Alert not found or already resolved.</p>
        <button onClick={() => navigate('/safety/alerts')} className="font-body text-accent text-sm font-medium">
          View all alerts
        </button>
      </div>
    );
  }

  const triggeredAt = new Date(alert.triggeredAt);

  return (
    <div className="min-h-screen bg-alert flex flex-col">
      {/* SOS header — alert red intentional for emergency */}
      <div className="px-5 pt-14 pb-8 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>
        <h1 className="font-display font-bold text-2xl text-white">SOS Alert</h1>
        <p className="font-body text-white/70 text-sm mt-1">{alert.memberName} needs help</p>
        <p className="font-numbers text-white/50 text-xs mt-1">
          {triggeredAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ·{' '}
          {Math.round((Date.now() - triggeredAt.getTime()) / 60000)} minutes ago
        </p>
      </div>

      {/* Content card */}
      <div className="flex-1 bg-bg-cream rounded-t-ff px-5 pt-6 pb-24 space-y-4">
        {/* Location */}
        {alert.latitude != null && (
          <FFCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-alert/10 rounded-xl">
                <MapPin className="w-5 h-5 text-alert" />
              </div>
              <div className="flex-1">
                <p className="font-body text-sm font-semibold text-primary">Last Known Location</p>
                <p className="font-numbers text-xs text-gray-500 mt-0.5">
                  {alert.latitude.toFixed(6)}, {alert.longitude?.toFixed(6)}
                </p>
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-xs font-semibold text-accent bg-accent/10 px-3 py-1.5 rounded-xl"
                >
                  Open Map
                </a>
              )}
            </div>
          </FFCard>
        )}

        {/* One-tap call */}
        <button
          className="w-full flex items-center justify-center gap-3 bg-success text-white py-4 rounded-ff font-display font-semibold text-base shadow-card"
          onClick={() => {/* tel: link to child's registered phone */}}
        >
          <Phone className="w-5 h-5" />
          Call {alert.memberName}
        </button>

        {/* Resolve */}
        <FFCard className="p-4 space-y-3">
          <p className="font-display font-semibold text-sm text-primary">Resolve Alert</p>
          <p className="font-body text-xs text-gray-400">
            Only mark resolved once you've confirmed {alert.memberName} is safe.
          </p>
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={`Optional note — e.g. "False alarm" or "Child confirmed safe"`}
            className="w-full border border-black/5 rounded-xl px-3 py-2.5 font-body text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          <FFButton onClick={handleResolve} isLoading={resolving} icon={<CheckCircle className="w-4 h-4" />} className="w-full">
            Mark as Resolved
          </FFButton>
        </FFCard>

        <button onClick={() => navigate('/safety/alerts')} className="w-full text-center font-body text-sm text-gray-400 py-2">
          View all alerts
        </button>
      </div>
    </div>
  );
};

export default SosAlertScreen;
