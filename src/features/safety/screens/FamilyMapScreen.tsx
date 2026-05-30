import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, MapPin, Battery, AlertTriangle } from 'lucide-react';
import { SafetyProvider, useSafety } from '../providers/SafetyProvider';

const ZONE_COLORS: Record<string, string> = {
  Home:           '#22c55e',
  School:         '#3b82f6',
  Tuition:        '#a855f7',
  RelativesHouse: '#f59e0b',
  Workplace:      '#6b7280',
  PlaceOfWorship: '#6366f1',
  Other:          '#9ca3af',
};

const FamilyMapContent: React.FC = () => {
  const navigate = useNavigate();
  const { mapView, isLoading, loadMapView } = useSafety();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { loadMapView(); }, [loadMapView]);

  // Simple canvas-based map placeholder — renders zone circles + member pins
  // In production this would use @react-google-maps/api with real tiles
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

    // Determine bounds from member locations
    const lats = mapView.memberPins.filter(p => p.lastKnownLat != null).map(p => p.lastKnownLat!);
    const lngs = mapView.memberPins.filter(p => p.lastKnownLng != null).map(p => p.lastKnownLng!);
    if (lats.length === 0) return;

    const minLat = Math.min(...lats) - 0.005;
    const maxLat = Math.max(...lats) + 0.005;
    const minLng = Math.min(...lngs) - 0.005;
    const maxLng = Math.max(...lngs) + 0.005;

    const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (W - 40) + 20;
    const toY = (lat: number) => H - (((lat - minLat) / (maxLat - minLat)) * (H - 40) + 20);

    // Draw zone circles
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

    // Draw member pins
    mapView.memberPins.forEach(pin => {
      if (pin.lastKnownLat == null || pin.lastKnownLng == null) return;
      const px = toX(pin.lastKnownLng);
      const py = toY(pin.lastKnownLat);
      const pinColor = pin.hasActiveSos ? '#dc2626' : pin.isStale ? '#9ca3af' : '#1A2E4A';

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
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Family Map
            </h1>
            <p className="text-xs text-blue-200">
              {mapView?.memberPins.length ?? 0} member{(mapView?.memberPins.length ?? 0) !== 1 ? 's' : ''} · {mapView?.safeZones.length ?? 0} zones
            </p>
          </div>
          <button onClick={loadMapView} className="p-2 rounded-xl bg-white/10">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Canvas map */}
      <div className="relative bg-gray-100 border-b border-gray-200" style={{ height: 320 }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
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
        <div className="absolute bottom-3 right-3 bg-white/90 rounded-xl px-3 py-2 text-xs space-y-1 shadow">
          {Object.entries(ZONE_COLORS).slice(0, 4).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Member cards */}
      <div className="px-4 pt-4 pb-24 space-y-3">
        <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Member Locations
        </h2>

        {mapView?.memberPins.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No location data. Members need to enable location sharing.
          </div>
        )}

        {mapView?.memberPins.map(pin => (
          <div
            key={pin.memberId}
            className={`flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border ${
              pin.hasActiveSos ? 'border-red-300' : 'border-transparent'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
              pin.hasActiveSos ? 'bg-red-600 animate-pulse' :
              pin.isStale     ? 'bg-gray-300' : 'bg-[#1A2E4A]'
            }`}>
              {pin.memberName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#1A2E4A]">{pin.memberName}</p>
                {pin.hasActiveSos && (
                  <span className="flex items-center gap-0.5 text-xs text-red-600 font-bold">
                    <AlertTriangle className="w-3 h-3" />SOS
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {pin.isStale
                  ? '⚠ Location outdated (>1 hr)'
                  : pin.currentLocationName
                    ?? (pin.lastKnownLat != null
                      ? `${pin.lastKnownLat.toFixed(4)}, ${pin.lastKnownLng?.toFixed(4)}`
                      : 'Location unknown')}
              </p>
              {pin.isInsideZone && pin.zoneType && (
                <span className="text-xs" style={{ color: ZONE_COLORS[pin.zoneType] ?? '#6b7280' }}>
                  Inside {pin.zoneType}
                </span>
              )}
            </div>

            <div className="text-right flex-shrink-0 space-y-1">
              {pin.batteryLevel != null && (
                <div className={`flex items-center justify-end gap-1 text-xs ${pin.batteryLevel < 15 ? 'text-red-500' : 'text-gray-400'}`}>
                  <Battery className="w-3 h-3" />
                  {pin.batteryLevel}%
                </div>
              )}
              {pin.lastUpdatedAt && (
                <p className="text-xs text-gray-400">
                  {Math.round((Date.now() - new Date(pin.lastUpdatedAt).getTime()) / 60000)}m ago
                </p>
              )}
              {pin.lastKnownLat != null && (
                <div className="flex items-center gap-0.5 text-xs text-gray-300">
                  <MapPin className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
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
