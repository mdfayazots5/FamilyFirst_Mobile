import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Battery, AlertTriangle } from 'lucide-react';
import { SafetyProvider, useSafety } from '../providers/SafetyProvider';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

// Hex values intentionally kept for canvas 2D API (cannot use CSS token classes)
const ZONE_COLORS: Record<string, string> = {
  Home:           '#2D6A4F',
  School:         '#1A2E4A',
  Tuition:        '#C8922A',
  RelativesHouse: '#C8922A',
  Workplace:      '#6b7280',
  PlaceOfWorship: '#1A2E4A',
  Other:          '#9ca3af',
};

const FamilyMapContent: React.FC = () => {
  const navigate = useNavigate();
  const { mapView, isLoading, loadMapView } = useSafety();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { loadMapView(); }, [loadMapView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mapView) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    if (mapView.memberPins.length === 0) return;

    const lats = mapView.memberPins.filter(p => p.lastKnownLat != null).map(p => p.lastKnownLat!);
    const lngs = mapView.memberPins.filter(p => p.lastKnownLng != null).map(p => p.lastKnownLng!);
    if (lats.length === 0) return;

    const minLat = Math.min(...lats) - 0.005;
    const maxLat = Math.max(...lats) + 0.005;
    const minLng = Math.min(...lngs) - 0.005;
    const maxLng = Math.max(...lngs) + 0.005;

    const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (W - 40) + 20;
    const toY = (lat: number) => H - (((lat - minLat) / (maxLat - minLat)) * (H - 40) + 20);

    mapView.safeZones.forEach(zone => {
      const cx = toX(zone.centerLongitude);
      const cy = toY(zone.centerLatitude);
      const latDeg = (zone.radiusMetres / 111320);
      const r = Math.abs(toY(zone.centerLatitude + latDeg) - cy);
      const color = ZONE_COLORS[zone.zoneType] ?? ZONE_COLORS.Other;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(r, 20), 0, Math.PI * 2);
      ctx.fillStyle = color + '22';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.zoneName, cx, cy + Math.max(r, 20) + 14);
    });

    mapView.memberPins.forEach(pin => {
      if (pin.lastKnownLat == null || pin.lastKnownLng == null) return;
      const px = toX(pin.lastKnownLng);
      const py = toY(pin.lastKnownLat);
      const pinColor = pin.hasActiveSos ? '#C1121F' : pin.isStale ? '#9ca3af' : '#1A2E4A';

      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fillStyle = pinColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pin.memberName.charAt(0).toUpperCase(), px, py);

      ctx.fillStyle = '#1A2E4A';
      ctx.font = '9px sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(pin.memberName, px, py + 17);
    });
  }, [mapView]);

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Family Map"
        subtitle={`${mapView?.memberPins.length ?? 0} member${(mapView?.memberPins.length ?? 0) !== 1 ? 's' : ''} · ${mapView?.safeZones.length ?? 0} zones`}
        showBack
        rightAction={
          <button onClick={loadMapView} className="p-2 rounded-xl bg-white/10" aria-label="Refresh">
            <MapPin className={`w-4 h-4 text-white ${isLoading ? 'animate-pulse' : ''}`} />
          </button>
        }
      />

      {/* Canvas map */}
      <div className="relative bg-black/5 border-b border-black/5" style={{ height: 320 }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <div className="w-12 h-12 rounded-full bg-black/5 animate-pulse" />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={320}
            className="w-full h-full"
          />
        )}
        {/* Zone legend */}
        <div className="absolute bottom-3 right-3 bg-white/90 rounded-xl px-3 py-2 text-xs space-y-1 shadow-card">
          {Object.entries(ZONE_COLORS).slice(0, 4).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-body text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-3">
        <FFSectionHeader title="Member Locations" />

        {mapView?.memberPins.length === 0 && (
          <p className="font-body text-center py-8 text-gray-400 text-sm">
            No location data. Members need to enable location sharing.
          </p>
        )}

        {mapView?.memberPins.map(pin => (
          <FFCard
            key={pin.memberId}
            className={`flex items-center gap-3 p-4 ${pin.hasActiveSos ? 'border border-alert/40' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
              pin.hasActiveSos ? 'bg-alert animate-pulse' :
              pin.isStale     ? 'bg-gray-300' : 'bg-primary'
            }`}>
              {pin.memberName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-body text-sm font-semibold text-primary">{pin.memberName}</p>
                {pin.hasActiveSos && (
                  <span className="flex items-center gap-0.5 font-body text-xs text-alert font-bold">
                    <AlertTriangle className="w-3 h-3" />SOS
                  </span>
                )}
              </div>
              <p className="font-body text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1">
                {pin.isStale && <AlertTriangle className="w-3 h-3 text-accent inline flex-shrink-0" />}
                {pin.isStale
                  ? 'Location outdated (>1 hr)'
                  : pin.currentLocationName
                    ?? (pin.lastKnownLat != null
                      ? `${pin.lastKnownLat.toFixed(4)}, ${pin.lastKnownLng?.toFixed(4)}`
                      : 'Location unknown')}
              </p>
              {pin.isInsideZone && pin.zoneType && (
                <span className="font-body text-xs text-success">Inside {pin.zoneType}</span>
              )}
            </div>

            <div className="text-right flex-shrink-0 space-y-1">
              {pin.batteryLevel != null && (
                <div className={`flex items-center justify-end gap-1 font-numbers text-xs ${pin.batteryLevel < 15 ? 'text-alert' : 'text-gray-400'}`}>
                  <Battery className="w-3 h-3" />
                  {pin.batteryLevel}%
                </div>
              )}
              {pin.lastUpdatedAt && (
                <p className="font-numbers text-xs text-gray-400">
                  {Math.round((Date.now() - new Date(pin.lastUpdatedAt).getTime()) / 60000)}m ago
                </p>
              )}
            </div>
          </FFCard>
        ))}
      </div>
    </div>
  );
};

const FamilyMapScreen: React.FC = () => (
  <SafetyProvider>
    <FamilyMapContent />
  </SafetyProvider>
);

export default FamilyMapScreen;
