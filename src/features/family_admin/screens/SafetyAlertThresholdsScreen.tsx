import React, { useState } from 'react';
import { CheckCircle2, FileClock, Save, ShieldAlert, Wallet } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useApiResource } from '../../../core/hooks/useApiResource';
import FFButton from '../../../shared/components/FFButton';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { FamilyAdminL2Repository, type AlertThresholds } from '../repositories/FamilyAdminL2Repository';

interface FieldConfig {
  key: keyof AlertThresholds;
  label: string;
  description: string;
  unit: '₹' | 'days' | 'min';
  min: number;
  max: number;
  step: number;
}

const groups: { title: string; Icon: typeof Wallet; fields: FieldConfig[] }[] = [
  {
    title: 'Finance',
    Icon: Wallet,
    fields: [
      { key: 'financeLargeTransactionThreshold', label: 'Large transaction alert', description: 'Flag transactions above this amount for the family admin.', unit: '₹', min: 1000, max: 50000, step: 500 },
    ],
  },
  {
    title: 'Document expiry reminders',
    Icon: FileClock,
    fields: [
      { key: 'documentExpiryLeadDaysDefault', label: 'General documents', description: 'Default reminder lead time.', unit: 'days', min: 7, max: 90, step: 1 },
      { key: 'documentExpiryLeadDaysIdentity', label: 'Identity documents', description: 'For passports, licences, and other ID documents.', unit: 'days', min: 14, max: 120, step: 1 },
      { key: 'documentExpiryLeadDaysMedical', label: 'Medical documents', description: 'For medical records with an expiry date.', unit: 'days', min: 7, max: 90, step: 1 },
      { key: 'documentExpiryLeadDaysInsurance', label: 'Insurance policies', description: 'For insurance renewals and policy expiry dates.', unit: 'days', min: 14, max: 120, step: 1 },
    ],
  },
  {
    title: 'Safety',
    Icon: ShieldAlert,
    fields: [
      { key: 'lateArrivalToleranceMinutes', label: 'Late arrival tolerance', description: 'Time after scheduled arrival before an alert is sent.', unit: 'min', min: 0, max: 30, step: 5 },
      { key: 'locationStaleThresholdMinutes', label: 'Location update timeout', description: 'Time without a location update before the map pin is marked stale.', unit: 'min', min: 15, max: 120, step: 15 },
    ],
  },
];

const fields = groups.flatMap(group => group.fields);
function formatValue(field: FieldConfig, value: number): string {
  if (field.unit === '₹') return `₹${value.toLocaleString('en-IN')}`;
  return `${value} ${field.unit === 'days' && value === 1 ? 'day' : field.unit}`;
}

function validateValue(field: FieldConfig, text: string): string | null {
  const value = Number(text);
  if (!text.trim() || !Number.isFinite(value) || value < field.min || value > field.max) {
    return `Enter a value from ${formatValue(field, field.min)} to ${formatValue(field, field.max)}.`;
  }
  return (value - field.min) % field.step === 0
    ? null
    : `Use increments of ${formatValue(field, field.step)} from ${formatValue(field, field.min)}.`;
}

const SafetyAlertThresholdsScreen: React.FC = () => {
  const { user } = useAuth();
  const familyId = user?.familyId;
  const resource = useApiResource<AlertThresholds>(
    familyId ? () => FamilyAdminL2Repository.getAlertThresholds(familyId) : null,
    [familyId],
    'Alert thresholds could not be loaded.',
  );
  const thresholds = resource.data;
  const loadError = familyId ? resource.error : 'Family details are not available.';
  const [draft, setDraft] = useState<Partial<Record<keyof AlertThresholds, string>>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isSaving = saveStatus === 'saving';

  const pending = fields.flatMap(field => {
    const text = draft[field.key];
    return text === undefined ? [] : [{ key: field.key, value: Number(text), error: validateValue(field, text) }];
  });
  const hasErrors = pending.some(change => change.error !== null);
  const canSave = pending.length > 0 && !hasErrors && !isSaving;

  const updateField = (key: keyof AlertThresholds, text: string) => {
    setSaveStatus('idle');
    setDraft(previous => ({
      ...previous,
      [key]: text.trim() && Number(text) === thresholds?.[key] ? undefined : text,
    }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!familyId || !canSave) return;

    setSaveStatus('saving');
    try {
      const changes = Object.fromEntries(pending.map(({ key, value }) => [key, value]));
      const updated = await FamilyAdminL2Repository.updateAlertThresholds(familyId, changes);
      resource.setData(updated);
      setDraft({});
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const statusMessage = isSaving
    ? 'Saving thresholds…'
    : saveStatus === 'saved'
      ? 'Alert thresholds saved.'
      : pending.length
        ? `${pending.length} unsaved ${pending.length === 1 ? 'change' : 'changes'}`
        : 'No unsaved changes';

  return (
    <div className="space-y-5 pb-6">
      <div className="overflow-hidden rounded-ff">
        <FFPageHeader title="Alert Thresholds" showBack />
      </div>

      {resource.isLoading ? (
        <div className="space-y-3" aria-label="Loading thresholds">
          {groups.map(group => <FFShimmer key={group.title} height={144} />)}
        </div>
      ) : loadError ? (
        <FFErrorState message={loadError} onRetry={familyId ? resource.reload : undefined} />
      ) : thresholds ? (
        <form className="space-y-4" noValidate onSubmit={handleSave}>
          <fieldset disabled={isSaving} className="min-w-0 space-y-4">
            <legend className="sr-only">Alert threshold settings</legend>
            {groups.map(({ title, Icon, fields: groupFields }) => (
              <section key={title} className="overflow-hidden rounded-ff border border-primary/10 bg-white shadow-card">
                <div className="flex items-center gap-2.5 border-b border-primary/10 bg-primary/[0.03] px-4 py-3 sm:px-5">
                  <span className="inline-flex size-8 items-center justify-center rounded-ff-sm bg-accent/15 text-primary">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <h2 className="text-base!">{title}</h2>
                </div>
                <div className="divide-y divide-primary/10">
                  {groupFields.map(field => {
                    const savedValue = thresholds[field.key];
                    const text = draft[field.key];
                    const error = text !== undefined ? validateValue(field, text) : null;
                    const sliderValue = text !== undefined && !error ? Number(text) : savedValue;
                    const descriptionId = `${field.key}-description`;
                    const errorId = `${field.key}-error`;

                    return (
                      <div key={field.key} className={`grid items-start gap-3 px-4 py-3.5 sm:px-5 lg:grid-cols-2 lg:gap-5 ${text !== undefined ? 'bg-accent/[0.07]' : ''}`}>
                        <div>
                          <label htmlFor={field.key} className="block text-sm font-bold text-primary">{field.label}</label>
                          <p id={descriptionId} className="mt-0.5 text-xs leading-relaxed text-slate-600">{field.description}</p>
                          {text !== undefined ? (
                            <p className="mt-1 text-xs font-semibold text-slate-600">Saved value {formatValue(field, savedValue)}</p>
                          ) : null}
                        </div>
                        <div>
                          <div className="grid grid-cols-[minmax(0,1fr)_6.25rem] items-start gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
                            <div className="min-w-0">
                              <input
                                type="range"
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                value={sliderValue}
                                aria-label={`${field.label} slider`}
                                aria-valuetext={formatValue(field, sliderValue)}
                                onChange={event => updateField(field.key, event.target.value)}
                                className="block h-8 w-full cursor-pointer scroll-mt-24 scroll-mb-32 accent-primary disabled:cursor-default"
                              />
                              <div aria-hidden="true" className="flex justify-between gap-2 text-xs tabular-nums text-slate-600">
                                <span>{formatValue(field, field.min)}</span>
                                <span>{formatValue(field, field.max)}</span>
                              </div>
                            </div>
                            <div className={`flex min-h-11 items-center rounded-ff-sm border bg-white px-2.5 focus-within:ring-2 focus-within:ring-primary/25 ${error ? 'border-alert' : 'border-primary/20'}`}>
                              {field.unit === '₹' ? <span aria-hidden="true" className="mr-1 text-sm text-slate-600">₹</span> : null}
                              <input
                                id={field.key}
                                type="number"
                                inputMode="numeric"
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                value={text ?? savedValue}
                                aria-describedby={error ? `${descriptionId} ${errorId}` : descriptionId}
                                aria-invalid={error ? true : undefined}
                                onChange={event => updateField(field.key, event.target.value)}
                                className="w-full min-w-0 scroll-mt-24 scroll-mb-32 appearance-[textfield] bg-transparent py-2 text-sm font-semibold tabular-nums text-primary outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                              {field.unit !== '₹' ? <span aria-hidden="true" className="ml-1 text-xs text-slate-600">{field.unit}</span> : null}
                            </div>
                          </div>
                          {error ? <p id={errorId} className="mt-1.5 text-xs font-semibold text-alert">{error}</p> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </fieldset>

          <div className="sticky bottom-16 z-20 space-y-2 bg-bg-cream py-2 md:bottom-0">
            {saveStatus === 'error' ? (
              <p role="alert" className="rounded-ff-sm border border-alert/20 bg-white px-3 py-2 text-sm text-alert">
                Thresholds could not be saved. Your edits are still here. Try again.
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-ff border border-primary/10 bg-white p-2.5 shadow-card sm:px-4">
              <div className="px-1">
                <p role="status" className={`flex items-center gap-1.5 text-sm font-semibold ${saveStatus === 'saved' ? 'text-success' : 'text-slate-700'}`}>
                  {saveStatus === 'saved' ? <CheckCircle2 size={17} aria-hidden="true" /> : null}
                  {statusMessage}
                </p>
                {hasErrors ? <p className="mt-0.5 text-xs text-alert">Correct the highlighted values before saving.</p> : null}
              </div>
              <FFButton type="submit" size="sm" icon={<Save size={16} aria-hidden="true" />} disabled={!canSave} isLoading={isSaving}>
                Save Thresholds
              </FFButton>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
};

export default SafetyAlertThresholdsScreen;
