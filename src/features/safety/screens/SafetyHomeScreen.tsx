import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, MapPin, Bell, Settings, AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react';
import { SafetyProvider, useSafety } from '../providers/SafetyProvider';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const ALERT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ZoneArrival:           { label: 'Arrived',         color: 'text-green-700 bg-green-50' },
  ZoneDeparture:         { label: 'Departed',        color: 'text-blue-700 bg-blue-50' },
  LateAlert:             { label: 'Late Alert',      color: 'text-amber-700 bg-amber-50' },
  SOS:                   { label: '🆘 SOS',          color: 'text-red-700 bg-red-50' },
  BatteryWarning:        { label: 'Low Battery',     color: 'text-orange-700 bg-orange-50' },
  LocationStale:         { label: 'Location Stale',  color: 'text-gray-700 bg-gray-50' },
  LocationSharingPaused: { label: 'Sharing Paused',  color: 'text-gray-700 bg-gray-50' },
};

const SafetyHomeContent: React.FC = () => {
  const navigate = useNavigate();
  const { mapView, alerts, isLoading, loadMapView, loadAlerts } = useSafety();

  useEffect(() => {
    loadMapView();
    loadAlerts();
  }, [loadMapView, loadAlerts]);

  const activeSos = alerts.filter(a => a.alertType === 'SOS' && !a.isResolved);
  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#C8922A]" />
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Family Safety
            </h1>
          </div>
          <button onClick={() => navigate('/safety/settings')} className="p-2 rounded-xl bg-white/10">
            <Settings className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-blue-200 text-xs mt-1">
          {mapView?.memberPins.length ?? 0} member{(mapView?.memberPins.length ?? 0) !== 1 ? 's' : ''} tracked · {mapView?.safeZones.length ?? 0} safe zones
        </p>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Active SOS banner */}
        {activeSos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-600 text-white rounded-2xl p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">Active SOS Alert</p>
              <p className="text-xs text-red-200">{activeSos[0].memberName} needs help · Tap to respond</p>
            </div>
            <button
              onClick={() => navigate('/safety/alerts')}
              className="bg-white text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl"
            >
              Respond
            </button>
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/safety/map')}
            className="flex flex-col items-start p-4 bg-white rounded-2xl shadow-sm gap-2"
          >
            <div className="p-2 bg-blue-50 rounded-xl">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-[#1A2E4A]">Family Map</p>
            <p className="text-xs text-gray-400">
              {mapView?.memberPins.filter(p => !p.isStale).length ?? 0} active
            </p>
          </button>

          <button
            onClick={() => navigate('/safety/zones')}
            className="flex flex-col items-start p-4 bg-white rounded-2xl shadow-sm gap-2"
          >
            <div className="p-2 bg-green-50 rounded-xl">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-[#1A2E4A]">Safe Zones</p>
            <p className="text-xs text-gray-400">
              {mapView?.safeZones.length ?? 0} configured
            </p>
          </button>
        </div>

        {/* Member location strips */}
        {mapView?.memberPins && mapView.memberPins.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Member Locations
            </h2>
            {mapView.memberPins.map(pin => (
              <div key={pin.memberId} className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  pin.hasActiveSos ? 'bg-red-500 animate-pulse' :
                  pin.isStale ? 'bg-gray-300' :
                  pin.isInsideZone ? 'bg-green-500' : 'bg-amber-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A2E4A]">{pin.memberName}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {pin.isStale ? '⚠ Location outdated' :
                     pin.currentLocationName ??
                     (pin.lastKnownLat ? `${pin.lastKnownLat?.toFixed(4)}, ${pin.lastKnownLng?.toFixed(4)}` : 'Unknown')}
                  </p>
                </div>
                {pin.batteryLevel !== undefined && pin.batteryLevel < 20 && (
                  <span className="text-xs text-orange-500">🔋{pin.batteryLevel}%</span>
                )}
                <span className="text-xs text-gray-400">
                  {pin.lastUpdatedAt
                    ? `${Math.round((Date.now() - new Date(pin.lastUpdatedAt).getTime()) / 60000)}m`
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recent alerts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Recent Alerts
            </h2>
            <button onClick={() => navigate('/safety/alerts')} className="text-xs text-[#C8922A] font-medium">
              See all
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <RefreshCw className="w-5 h-5 text-gray-300 animate-spin" />
            </div>
          ) : recentAlerts.length === 0 ? (
            <FFEmptyState title="No alerts" subtitle="All safe zones are quiet." />
          ) : (
            <div className="space-y-2">
              {recentAlerts.map(alert => {
                const config = ALERT_TYPE_LABELS[alert.alertType] ?? { label: alert.alertType, color: 'text-gray-600 bg-gray-50' };
                return (
                  <div key={alert.alertId} className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${config.color}`}>
                      {config.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1A2E4A] truncate">{alert.memberName}</p>
                      {alert.zoneName && <p className="text-xs text-gray-400">{alert.zoneName}</p>}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(alert.triggeredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SafetyHomeScreen: React.FC = () => (
  <SafetyProvider>
    <SafetyHomeContent />
  </SafetyProvider>
);

export default SafetyHomeScreen;
