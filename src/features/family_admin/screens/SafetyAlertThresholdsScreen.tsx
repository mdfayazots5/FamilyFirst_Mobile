import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Save } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyAdminL2Repository, AlertThresholds } from '../repositories/FamilyAdminL2Repository';

interface FieldConfig {
  key: keyof AlertThresholds;
  label: string;
  desc: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const FIELDS: FieldConfig[] = [
  { key: 'financeLargeTransactionThreshold', label: 'Finance Large Transaction', desc: 'Amount above which a transaction surfaces to CFO regardless of tier', unit: '₹', min: 1000, max: 50000, step: 500 },
  { key: 'documentExpiryLeadDaysDefault',    label: 'Document Expiry — Default', desc: 'Days before expiry to start reminders (general documents)', unit: 'days', min: 7, max: 90, step: 1 },
  { key: 'documentExpiryLeadDaysIdentity',   label: 'Document Expiry — Identity', desc: 'Lead time for ID documents (passport, licence)', unit: 'days', min: 14, max: 120, step: 1 },
  { key: 'documentExpiryLeadDaysMedical',    label: 'Document Expiry — Medical', desc: 'Lead time for medical documents', unit: 'days', min: 7, max: 90, step: 1 },
  { key: 'documentExpiryLeadDaysInsurance',  label: 'Document Expiry — Insurance', desc: 'Lead time for insurance policies', unit: 'days', min: 14, max: 120, step: 1 },
  { key: 'lateArrivalToleranceMinutes',      label: 'Late Arrival Tolerance', desc: 'Minutes past scheduled arrival before late alert fires (0 = fires exactly on time)', unit: 'min', min: 0, max: 30, step: 5 },
  { key: 'locationStaleThresholdMinutes',    label: 'Location Stale Threshold', desc: 'Minutes without location update before pin is marked as stale', unit: 'min', min: 15, max: 120, step: 15 },
];

const SafetyAlertThresholdsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thresholds, setThresholds] = useState<AlertThresholds | null>(null);
  const [form, setForm]             = useState<Partial<AlertThresholds>>({});
  const [isLoading, setIsLoading]   = useState(true);
  const [isSaving, setIsSaving]     = useState(false);

  const load = async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await FamilyAdminL2Repository.getAlertThresholds(user.familyId);
      setThresholds(data);
      setForm({ ...data });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.familyId]);

  const handleSave = async () => {
    if (!user?.familyId) return;
    setIsSaving(true);
    try {
      const updated = await FamilyAdminL2Repository.updateAlertThresholds(user.familyId, form);
      setThresholds(updated);
      setForm({ ...updated });
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = thresholds && FIELDS.some(f => form[f.key] !== thresholds[f.key]);

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Alert Thresholds
            </h1>
            <p className="text-xs text-blue-200">AC-04 — Finance, document & safety thresholds</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl bg-white/10">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 pb-32 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 text-gray-300 animate-spin" /></div>
        ) : FIELDS.map(field => {
          const value = (form[field.key] as number) ?? 0;
          return (
            <div key={field.key} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-[#1A2E4A]">{field.label}</p>
                <span className="text-sm font-bold text-[#C8922A] flex-shrink-0">
                  {field.unit === '₹' ? `₹${value.toLocaleString('en-IN')}` : `${value} ${field.unit}`}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{field.desc}</p>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={value}
                onChange={e => setForm(f => ({ ...f, [field.key]: parseFloat(e.target.value) }))}
                className="w-full accent-[#1A2E4A]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{field.unit === '₹' ? `₹${field.min.toLocaleString('en-IN')}` : `${field.min} ${field.unit}`}</span>
                <span>{field.unit === '₹' ? `₹${field.max.toLocaleString('en-IN')}` : `${field.max} ${field.unit}`}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="w-full flex items-center justify-center gap-2 bg-[#1A2E4A] text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving…' : 'Save Thresholds'}
        </button>
      </div>
    </div>
  );
};

export default SafetyAlertThresholdsScreen;
