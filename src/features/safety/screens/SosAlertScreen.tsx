import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, CheckCircle, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { SafetyRepository, LocationAlert } from '../repositories/SafetyRepository';

// SL-06 — Parent SOS Alert Screen
// Reached via deep-link from FCM push notification payload:
//   /safety/sos-alert?alertId=<uuid>&memberId=<uuid>
// Shows child location, one-tap call, and resolve action.

const SosAlertScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const alertId  = searchParams.get('alertId');
  const memberId = searchParams.get('memberId');

  const [alert, setAlert]       = useState<LocationAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [note, setNote]         = useState('');
  const [resolved, setResolved] = useState(false);

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
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (resolved) {
    return (
      <div className="min-h-screen bg-[#F8F4EE] flex flex-col items-center justify-center gap-6 px-6">
        <div className="bg-white rounded-3xl p-8 text-center shadow-lg w-full max-w-sm">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Alert Resolved
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            SOS marked as resolved. Stay with your child until they are confirmed safe.
          </p>
          <button
            onClick={() => navigate('/safety')}
            className="mt-6 w-full bg-[#1A2E4A] text-white py-3 rounded-2xl font-semibold text-sm"
          >
            Back to Safety
          </button>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-[#F8F4EE] flex flex-col items-center justify-center gap-4 px-6">
        <AlertTriangle className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 text-sm text-center">Alert not found or already resolved.</p>
        <button onClick={() => navigate('/safety/alerts')} className="text-[#C8922A] text-sm font-medium">
          View all alerts
        </button>
      </div>
    );
  }

  const triggeredAt = new Date(alert.triggeredAt);

  return (
    <div className="min-h-screen bg-red-600 flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-8 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
          SOS Alert
        </h1>
        <p className="text-red-200 text-sm mt-1">
          {alert.memberName} needs help
        </p>
        <p className="text-red-300 text-xs mt-1">
          {triggeredAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ·{' '}
          {Math.round((Date.now() - triggeredAt.getTime()) / 60000)} minutes ago
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-[#F8F4EE] rounded-t-3xl px-5 pt-6 pb-24 space-y-4">
        {/* Location */}
        {alert.latitude != null && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-xl">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1A2E4A]">Last Known Location</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {alert.latitude.toFixed(6)}, {alert.longitude?.toFixed(6)}
                </p>
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#C8922A] bg-amber-50 px-3 py-1.5 rounded-xl"
                >
                  Open Map
                </a>
              )}
            </div>
          </div>
        )}

        {/* One-tap call */}
        <button
          className="w-full flex items-center justify-center gap-3 bg-[#2D6A4F] text-white py-4 rounded-2xl font-semibold text-base shadow-md"
          onClick={() => { /* In production: tel: link to child's registered phone */ }}
        >
          <Phone className="w-5 h-5" />
          Call {alert.memberName}
        </button>

        {/* Resolve */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-[#1A2E4A]">Resolve Alert</p>
          <p className="text-xs text-gray-400">
            Only mark resolved once you've confirmed {alert.memberName} is safe.
          </p>
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={`Optional note — e.g. "False alarm" or "Child confirmed safe"`}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
          />
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="w-full flex items-center justify-center gap-2 bg-[#1A2E4A] text-white py-3 rounded-2xl font-semibold text-sm disabled:opacity-60"
          >
            {resolving ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {resolving ? 'Resolving…' : 'Mark as Resolved'}
          </button>
        </div>

        <button
          onClick={() => navigate('/safety/alerts')}
          className="w-full text-center text-sm text-gray-400 py-2"
        >
          View all alerts
        </button>
      </div>
    </div>
  );
};

export default SosAlertScreen;
