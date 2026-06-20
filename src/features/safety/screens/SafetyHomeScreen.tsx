import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, Settings, AlertTriangle, ChevronRight, Battery } from 'lucide-react';
import { SafetyProvider, useSafety } from '../providers/SafetyProvider';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const ALERT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ZoneArrival:           { label: 'Arrived',         color: 'text-success bg-success/10' },
  ZoneDeparture:         { label: 'Departed',        color: 'text-primary bg-primary/10' },
  LateAlert:             { label: 'Late Alert',      color: 'text-accent bg-accent/10' },
  SOS:                   { label: 'SOS',             color: 'text-alert bg-alert/10' },
  BatteryWarning:        { label: 'Low Battery',     color: 'text-accent bg-accent/10' },
  LocationStale:         { label: 'Location Stale',  color: 'text-gray-500 bg-black/5' },
  LocationSharingPaused: { label: 'Sharing Paused',  color: 'text-gray-500 bg-black/5' },
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
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Family Safety"
        subtitle={`${mapView?.memberPins.length ?? 0} member${(mapView?.memberPins.length ?? 0) !== 1 ? 's' : ''} tracked · ${mapView?.safeZones.length ?? 0} safe zones`}
        rightAction={
          <button onClick={() => navigate('/safety/settings')} className="p-2 rounded-xl bg-white/10" aria-label="Settings">
            <Settings className="w-4 h-4 text-white" />
          </button>
        }
      />

      <div className="px-4 pt-4 pb-24 space-y-4 page-enter">
        {/* Active SOS banner */}
        {activeSos.length > 0 && (
          <div className="bg-alert text-white rounded-ff p-4 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="font-display font-bold text-sm">Active SOS Alert</p>
              <p className="font-body text-xs text-white/70">{activeSos[0].memberName} needs help · Tap to respond</p>
            </div>
            <button
              onClick={() => navigate('/safety/alerts')}
              className="bg-white text-alert font-body text-xs font-bold px-3 py-1.5 rounded-xl"
            >
              Respond
            </button>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/safety/map')}
            className="flex flex-col items-start p-4 bg-white border border-black/5 rounded-ff shadow-card gap-2"
          >
            <div className="p-2 bg-primary/10 rounded-xl">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <p className="font-display font-semibold text-sm text-primary">Family Map</p>
            <p className="font-body text-xs text-gray-400">
              {mapView?.memberPins.filter(p => !p.isStale).length ?? 0} active
            </p>
          </button>

          <button
            onClick={() => navigate('/safety/zones')}
            className="flex flex-col items-start p-4 bg-white border border-black/5 rounded-ff shadow-card gap-2"
          >
            <div className="p-2 bg-success/10 rounded-xl">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <p className="font-display font-semibold text-sm text-primary">Safe Zones</p>
            <p className="font-body text-xs text-gray-400">
              {mapView?.safeZones.length ?? 0} configured
            </p>
          </button>
        </div>

        {/* Member location strips */}
        {mapView?.memberPins && mapView.memberPins.length > 0 && (
          <div className="space-y-2">
            <FFSectionHeader title="Member Locations" />
            {mapView.memberPins.map(pin => (
              <FFCard key={pin.memberId} className="flex items-center gap-3 p-4">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  pin.hasActiveSos ? 'bg-alert animate-pulse' :
                  pin.isStale     ? 'bg-gray-300' :
                  pin.isInsideZone ? 'bg-success' : 'bg-accent'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-primary">{pin.memberName}</p>
                  <p className="font-body text-xs text-gray-500 truncate flex items-center gap-1">
                    {pin.isStale && <AlertTriangle className="w-3 h-3 text-accent inline" />}
                    {pin.isStale ? 'Location outdated' :
                     pin.currentLocationName ??
                     (pin.lastKnownLat ? `${pin.lastKnownLat?.toFixed(4)}, ${pin.lastKnownLng?.toFixed(4)}` : 'Unknown')}
                  </p>
                </div>
                {pin.batteryLevel !== undefined && pin.batteryLevel < 20 && (
                  <span className="flex items-center gap-0.5 font-body text-xs text-accent">
                    <Battery className="w-3 h-3" />{pin.batteryLevel}%
                  </span>
                )}
                <span className="font-numbers text-xs text-gray-400">
                  {pin.lastUpdatedAt
                    ? `${Math.round((Date.now() - new Date(pin.lastUpdatedAt).getTime()) / 60000)}m`
                    : '—'}
                </span>
              </FFCard>
            ))}
          </div>
        )}

        {/* Recent alerts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FFSectionHeader title="Recent Alerts" />
            <button onClick={() => navigate('/safety/alerts')} className="font-body text-xs text-accent font-medium">
              See all
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <FFShimmer key={i} className="h-14 rounded-ff" />)}
            </div>
          ) : recentAlerts.length === 0 ? (
            <FFEmptyState title="No alerts" message="All safe zones are quiet." />
          ) : (
            <div className="space-y-2">
              {recentAlerts.map(alert => {
                const config = ALERT_TYPE_LABELS[alert.alertType] ?? { label: alert.alertType, color: 'text-gray-500 bg-black/5' };
                return (
                  <FFCard key={alert.alertId} className="flex items-center gap-3 p-3">
                    <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${config.color}`}>
                      {config.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-primary truncate">{alert.memberName}</p>
                      {alert.zoneName && <p className="font-body text-xs text-gray-400">{alert.zoneName}</p>}
                    </div>
                    <span className="font-numbers text-xs text-gray-400 flex-shrink-0">
                      {new Date(alert.triggeredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </FFCard>
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
