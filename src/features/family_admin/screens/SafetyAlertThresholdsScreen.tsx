import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyAdminL2Repository, AlertThresholds } from '../repositories/FamilyAdminL2Repository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFErrorState from '../../../shared/components/FFErrorState';
import { useApiResource } from '../../../core/hooks/useApiResource';

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
  { key: 'financeLargeTransactionThreshold', label: 'Finance Large Transaction',   desc: 'Amount above which a transaction surfaces to the family admin',        unit: '₹',    min: 1000,  max: 50000, step: 500 },
  { key: 'documentExpiryLeadDaysDefault',    label: 'Document Expiry — Default',   desc: 'Days before expiry to start reminders (general documents)',            unit: 'days', min: 7,     max: 90,    step: 1 },
  { key: 'documentExpiryLeadDaysIdentity',   label: 'Document Expiry — Identity',  desc: 'Lead time for ID documents (passport, licence)',                       unit: 'days', min: 14,    max: 120,   step: 1 },
  { key: 'documentExpiryLeadDaysMedical',    label: 'Document Expiry — Medical',   desc: 'Lead time for medical documents',                                      unit: 'days', min: 7,     max: 90,    step: 1 },
  { key: 'documentExpiryLeadDaysInsurance',  label: 'Document Expiry — Insurance', desc: 'Lead time for insurance policies',                                     unit: 'days', min: 14,    max: 120,   step: 1 },
  { key: 'lateArrivalToleranceMinutes',      label: 'Late Arrival Tolerance',      desc: 'Minutes past scheduled arrival before a late alert fires',             unit: 'min',  min: 0,     max: 30,    step: 5 },
  { key: 'locationStaleThresholdMinutes',    label: 'Location Stale Threshold',    desc: 'Minutes without a location update before the pin is marked stale',     unit: 'min',  min: 15,    max: 120,   step: 15 },
];

const formatValue = (field: FieldConfig, value: number): string =>
  field.unit === '₹' ? `₹${value.toLocaleString('en-IN')}` : `${value} ${field.unit}`;

const SafetyAlertThresholdsScreen: React.FC = () => {
  const { user } = useAuth();
  const familyId = user?.familyId;
  const resource = useApiResource<AlertThresholds>(
    familyId ? () => FamilyAdminL2Repository.getAlertThresholds(familyId) : null,
    [familyId],
    'Alert thresholds could not be loaded.',
  );
  const thresholds = resource.data;
  const isLoading = resource.isLoading;
  const loadError = familyId ? resource.error : 'Family details are not available.';
  const [form, setForm]             = useState<Partial<AlertThresholds>>({});
  const [isSaving, setIsSaving]     = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);

  useEffect(() => {
    if (thresholds) setForm({ ...thresholds });
  }, [thresholds]);

  const handleSave = async () => {
    if (!familyId) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const updated = await FamilyAdminL2Repository.updateAlertThresholds(familyId, form);
      resource.setData(updated);
    } catch {
      setSaveError('Alert thresholds could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = thresholds && FIELDS.some(f => form[f.key] !== thresholds[f.key]);

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Alert Thresholds"
        subtitle="Finance, document & safety limits"
        showBack
      />

      <main className="px-4 py-5 space-y-4 page-enter">

        <FFSectionHeader icon={<Save className="w-[18px] h-[18px]" />} title="Thresholds" />

        {saveError && <p role="alert" className="font-body text-sm text-alert">{saveError}</p>}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => <FFShimmer key={i} className="h-24 rounded-ff" />)}
          </div>
        ) : loadError ? (
          <FFErrorState message={loadError} onRetry={familyId ? resource.reload : undefined} />
        ) : (
          <>
            <div className="space-y-3">
              {FIELDS.map(field => {
                const value = (form[field.key] as number) ?? 0;
                return (
                  <FFCard key={field.key} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display font-semibold text-sm text-primary">{field.label}</p>
                      <span className="font-numbers font-medium text-sm text-accent flex-shrink-0">
                        {formatValue(field, value)}
                      </span>
                    </div>
                    <p className="font-body text-xs text-gray-400">{field.desc}</p>
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={value}
                      onChange={e => setForm(f => ({ ...f, [field.key]: parseFloat(e.target.value) }))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between font-body text-xs text-gray-400">
                      <span>{formatValue(field, field.min)}</span>
                      <span>{formatValue(field, field.max)}</span>
                    </div>
                  </FFCard>
                );
              })}
            </div>

            <FFButton
              icon={<Save className="w-4 h-4" />}
              isLoading={isSaving}
              disabled={!isDirty}
              className="w-full"
              onClick={handleSave}
            >
              Save Thresholds
            </FFButton>
          </>
        )}

      </main>
    </div>
  );
};

export default SafetyAlertThresholdsScreen;
