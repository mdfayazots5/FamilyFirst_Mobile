import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { SafetyRepository, SafeZone } from '../repositories/SafetyRepository';

const ZONE_TYPES = ['Home', 'School', 'Tuition', 'RelativesHouse', 'Workplace', 'PlaceOfWorship', 'Other'] as const;

const DEFAULT_RADIUS_BY_TYPE: Record<string, number> = {
  Home: 100, School: 200, Tuition: 100, RelativesHouse: 150,
  Workplace: 150, PlaceOfWorship: 100, Other: 150,
};

interface FormState {
  zoneName: string;
  zoneType: string;
  latitude: string;
  longitude: string;
  radiusMetres: number;
  alertOnArrival: boolean;
  alertOnDeparture: boolean;
  lateAlertEnabled: boolean;
  lateAlertTime: string;
  overrideQuietHours: boolean;
}

const DEFAULT_FORM: FormState = {
  zoneName: '',
  zoneType: 'School',
  latitude: '',
  longitude: '',
  radiusMetres: 200,
  alertOnArrival: true,
  alertOnDeparture: true,
  lateAlertEnabled: false,
  lateAlertTime: '08:30',
  overrideQuietHours: true,
};

const AddEditSafeZoneScreen: React.FC = () => {
  const navigate = useNavigate();
  const { zoneId } = useParams<{ zoneId: string }>();
  const { user } = useAuth();
  const isEditing = Boolean(zoneId);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  // Load zone for edit
  useEffect(() => {
    if (!isEditing || !user?.familyId) return;
    SafetyRepository.listZones(user.familyId).then(zones => {
      const zone = zones.find(z => z.zoneId === zoneId);
      if (!zone) return;
      setForm({
        zoneName:         zone.zoneName,
        zoneType:         zone.zoneType,
        latitude:         zone.centerLatitude.toString(),
        longitude:        zone.centerLongitude.toString(),
        radiusMetres:     zone.radiusMetres,
        alertOnArrival:   zone.alertOnArrival,
        alertOnDeparture: zone.alertOnDeparture,
        lateAlertEnabled: zone.lateAlertEnabled,
        lateAlertTime:    zone.lateAlertTime ?? '08:30',
        overrideQuietHours: zone.overrideQuietHours,
      });
    });
  }, [isEditing, zoneId, user?.familyId]);

  const useCurrentLocation = () => {
    setIsLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          latitude:  pos.coords.latitude.toFixed(7),
          longitude: pos.coords.longitude.toFixed(7),
        }));
        setIsLoadingGps(false);
      },
      () => setIsLoadingGps(false),
      { timeout: 8000 },
    );
  };

  const handleZoneTypeChange = (type: string) => {
    setForm(f => ({
      ...f,
      zoneType:         type,
      radiusMetres:     DEFAULT_RADIUS_BY_TYPE[type] ?? 150,
      alertOnArrival:   type !== 'Home',
      alertOnDeparture: true,
      lateAlertEnabled: type === 'School',
      overrideQuietHours: type === 'School' || type === 'Home',
    }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.zoneName.trim())        e.zoneName   = 'Zone name is required.';
    if (form.zoneName.length > 40)    e.zoneName   = 'Zone name must not exceed 40 characters.';
    if (!form.latitude)               e.latitude   = 'Latitude is required.';
    if (!form.longitude)              e.longitude  = 'Longitude is required.';
    if (form.radiusMetres < 50 || form.radiusMetres > 500)
                                      e.radiusMetres = 'Radius must be between 50 and 500 m.';
    if (form.lateAlertEnabled && !form.lateAlertTime)
                                      e.lateAlertTime = 'Late alert time is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !user?.familyId) return;
    setIsSaving(true);
    try {
      const payload: Omit<SafeZone, 'zoneId'> = {
        zoneName:         form.zoneName.trim(),
        zoneType:         form.zoneType,
        centerLatitude:   parseFloat(form.latitude),
        centerLongitude:  parseFloat(form.longitude),
        radiusMetres:     form.radiusMetres,
        alertOnArrival:   form.alertOnArrival,
        alertOnDeparture: form.alertOnDeparture,
        lateAlertEnabled: form.lateAlertEnabled,
        lateAlertTime:    form.lateAlertEnabled ? form.lateAlertTime : undefined,
        overrideQuietHours: form.overrideQuietHours,
        appliedToMemberIds: [],
      };

      if (isEditing && zoneId) {
        await SafetyRepository.updateZone(user.familyId, zoneId, payload);
      } else {
        await SafetyRepository.createZone(user.familyId, payload);
      }
      navigate('/safety/zones');
    } finally {
      setIsSaving(false);
    }
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {isEditing ? 'Edit Safe Zone' : 'Add Safe Zone'}
            </h1>
            <p className="text-xs text-blue-200">Configure alerts for this location</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 pb-32 space-y-5">
        {/* Zone name */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Zone Details
          </h2>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Zone Name</label>
            <input
              type="text"
              maxLength={40}
              value={form.zoneName}
              onChange={e => set('zoneName', e.target.value)}
              placeholder="e.g. Delhi Public School"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
            />
            {errors.zoneName && <p className="text-xs text-red-500 mt-1">{errors.zoneName}</p>}
            <p className="text-xs text-gray-400 mt-1 text-right">{form.zoneName.length}/40</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Zone Type</label>
            <div className="grid grid-cols-2 gap-2">
              {ZONE_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => handleZoneTypeChange(type)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                    form.zoneType === type
                      ? 'bg-[#1A2E4A] text-white border-[#1A2E4A]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Location
            </h2>
            <button
              onClick={useCurrentLocation}
              disabled={isLoadingGps}
              className="flex items-center gap-1.5 text-xs text-[#C8922A] font-medium"
            >
              <MapPin className="w-3.5 h-3.5" />
              {isLoadingGps ? 'Locating…' : 'Use current'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Latitude</label>
              <input
                type="number"
                value={form.latitude}
                onChange={e => set('latitude', e.target.value)}
                placeholder="28.6139"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
              />
              {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Longitude</label>
              <input
                type="number"
                value={form.longitude}
                onChange={e => set('longitude', e.target.value)}
                placeholder="77.2090"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
              />
              {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Radius — {form.radiusMetres}m
            </label>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={form.radiusMetres}
              onChange={e => set('radiusMetres', parseInt(e.target.value))}
              className="w-full accent-[#1A2E4A]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>50m</span><span>500m</span>
            </div>
            {errors.radiusMetres && <p className="text-xs text-red-500 mt-1">{errors.radiusMetres}</p>}
          </div>

          {/* Visual radius indicator */}
          <div className="flex items-center justify-center py-2">
            <div
              className="rounded-full border-2 border-dashed border-[#1A2E4A] bg-[#1A2E4A]/5 flex items-center justify-center"
              style={{ width: Math.max(40, form.radiusMetres / 5), height: Math.max(40, form.radiusMetres / 5) }}
            >
              <MapPin className="w-4 h-4 text-[#1A2E4A]" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Alert Settings
          </h2>

          {[
            { key: 'alertOnArrival' as const,    label: 'Alert on arrival',         desc: 'Notify when member enters this zone' },
            { key: 'alertOnDeparture' as const,  label: 'Alert on departure',       desc: 'Notify when member leaves this zone' },
            { key: 'overrideQuietHours' as const, label: 'Override quiet hours',    desc: 'Alerts always delivered — even during quiet hours' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1A2E4A]">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <button
                onClick={() => set(key, !form[key])}
                className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  form[key] ? 'bg-[#1A2E4A]' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form[key] ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}

          {/* Late alert */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1A2E4A]">Late arrival alert</p>
              <p className="text-xs text-gray-400">Alert if member hasn't arrived by set time</p>
            </div>
            <button
              onClick={() => set('lateAlertEnabled', !form.lateAlertEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                form.lateAlertEnabled ? 'bg-[#1A2E4A]' : 'bg-gray-200'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.lateAlertEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {form.lateAlertEnabled && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Expected arrival time</label>
              <input
                type="time"
                value={form.lateAlertTime}
                onChange={e => set('lateAlertTime', e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
              />
              {errors.lateAlertTime && <p className="text-xs text-red-500 mt-1">{errors.lateAlertTime}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 bg-[#1A2E4A] text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
        >
          {isSaving ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Zone'}
        </button>
      </div>
    </div>
  );
};

export default AddEditSafeZoneScreen;
