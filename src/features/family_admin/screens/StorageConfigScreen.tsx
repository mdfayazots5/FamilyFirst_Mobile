import React, { useEffect, useState } from 'react';
import { CheckCircle2, HardDrive, Cloud, Save } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  FamilyAdminL2Repository,
  StorageConfig,
  STORAGE_MODE_OPTIONS,
  STORAGE_QUOTA_ALERT_OPTIONS,
  OFFLINE_CACHE_SIZE_OPTIONS,
} from '../repositories/FamilyAdminL2Repository';
import FFErrorState from '../../../shared/components/FFErrorState';
import { useApiResource } from '../../../core/hooks/useApiResource';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

// Presentation only — option data comes from the repository.
const STORAGE_MODE_ICONS: Record<string, React.ReactNode> = {
  AppManaged:  <HardDrive className="w-4 h-4 text-primary" />,
  GoogleDrive: <Cloud className="w-4 h-4 text-primary" />,
  Hybrid:      <Cloud className="w-4 h-4 text-primary" />,
};
const STORAGE_MODES = STORAGE_MODE_OPTIONS.map(m => ({ ...m, icon: STORAGE_MODE_ICONS[m.id] }));
const QUOTA_OPTIONS = STORAGE_QUOTA_ALERT_OPTIONS;
const CACHE_OPTIONS = OFFLINE_CACHE_SIZE_OPTIONS;

const StorageConfigScreen: React.FC = () => {
  const { user } = useAuth();
  const familyId = user?.familyId;
  const resource = useApiResource<StorageConfig>(
    familyId ? () => FamilyAdminL2Repository.getStorageConfig(familyId) : null,
    [familyId],
    'Storage settings could not be loaded.',
  );
  const config = resource.data;
  const isLoading = resource.isLoading;
  const loadError = familyId ? resource.error : 'Family details are not available.';
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isSaving = saveStatus === 'saving';
  const [form, setForm]         = useState<Partial<StorageConfig>>({});

  useEffect(() => {
    if (config) {
      setForm({ storageMode: config.storageMode, storageQuotaAlertThresholdPct: config.storageQuotaAlertThresholdPct, offlineCacheSizeMb: config.offlineCacheSizeMb });
    }
  }, [config]);

  const isDirty = !!config && (
    form.storageMode !== config.storageMode ||
    form.storageQuotaAlertThresholdPct !== config.storageQuotaAlertThresholdPct ||
    form.offlineCacheSizeMb !== config.offlineCacheSizeMb
  );

  const edit = (change: Partial<StorageConfig>) => {
    setSaveStatus('idle');
    setForm(previous => ({ ...previous, ...change }));
  };

  const handleSave = async () => {
    if (!familyId || !form.storageMode || !isDirty || isSaving) return;
    setSaveStatus('saving');
    try {
      const updated = await FamilyAdminL2Repository.updateStorageConfig(familyId, form);
      resource.setData(updated);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const usedPct = config ? Math.round(config.storageUsedBytes / config.storageQuotaBytes * 100) : 0;

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Storage"
        subtitle="Document storage provider and limits"
        showBack
      />

      <main className="px-4 py-5 space-y-4 page-enter">

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <FFShimmer key={i} className="h-28 rounded-ff" />)}
          </div>
        ) : loadError ? (
          <FFErrorState message={loadError} onRetry={familyId ? resource.reload : undefined} />
        ) : (
          <fieldset disabled={isSaving} className="min-w-0 space-y-4">
            <legend className="sr-only">Storage settings</legend>
            {/* Storage usage */}
            {config && (
              <FFCard className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-display font-semibold text-sm text-primary">Storage Used</p>
                  <p className="font-numbers font-medium text-xs text-gray-400">
                    {(config.storageUsedBytes / 1024 / 1024).toFixed(0)} MB / {(config.storageQuotaBytes / 1024 / 1024 / 1024).toFixed(0)} GB
                  </p>
                </div>
                <div className="bg-black/5 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usedPct > 90 ? 'bg-alert' : usedPct > 75 ? 'bg-accent' : 'bg-success'
                    }`}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>
                <p className="font-body text-xs text-gray-400">{usedPct}% used</p>
              </FFCard>
            )}

            {/* Storage provider */}
            <div className="space-y-2">
              <FFSectionHeader icon={<HardDrive className="w-[18px] h-[18px]" />} title="Storage Provider" />
              <FFCard className="p-4 space-y-2">
                {STORAGE_MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => edit({ storageMode: mode.id })}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                      form.storageMode === mode.id
                        ? 'border-primary bg-primary/5'
                        : 'border-black/5 hover:bg-black/[0.02]'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">{mode.icon}</div>
                    <div>
                      <p className="font-body font-semibold text-sm text-primary">{mode.label}</p>
                      <p className="font-body text-xs text-gray-400 mt-0.5">{mode.desc}</p>
                    </div>
                  </button>
                ))}
              </FFCard>
            </div>

            {/* Quota alert threshold */}
            <FFCard className="p-4 space-y-3">
              <p className="font-display font-semibold text-sm text-primary">Storage Alert Threshold</p>
              <p className="font-body text-xs text-gray-400">Notify when storage reaches this percentage.</p>
              <div className="flex gap-2">
                {QUOTA_OPTIONS.map(pct => (
                  <button
                    key={pct}
                    onClick={() => edit({ storageQuotaAlertThresholdPct: pct })}
                    className={`flex-1 py-2 rounded-xl font-body text-sm font-semibold border transition-colors ${
                      form.storageQuotaAlertThresholdPct === pct
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-black/5'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </FFCard>

            {/* Offline cache */}
            <FFCard className="p-4 space-y-3">
              <p className="font-display font-semibold text-sm text-primary">Offline Cache Size</p>
              <p className="font-body text-xs text-gray-400">Documents cached for offline access (most recently accessed first).</p>
              <div className="flex gap-2">
                {CACHE_OPTIONS.map(mb => (
                  <button
                    key={mb}
                    onClick={() => edit({ offlineCacheSizeMb: mb })}
                    className={`flex-1 py-2 rounded-xl font-body text-sm font-semibold border transition-colors ${
                      form.offlineCacheSizeMb === mb
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-black/5'
                    }`}
                  >
                    {mb >= 1000 ? `${mb / 1000} GB` : `${mb} MB`}
                  </button>
                ))}
              </div>
            </FFCard>

            <div role="status" className={saveStatus === 'saved' ? 'flex items-center gap-2 rounded-ff-sm bg-success/10 px-4 py-2.5 text-sm font-semibold text-success' : 'sr-only'}>
              {saveStatus === 'saved' ? <><CheckCircle2 size={17} aria-hidden="true" />Storage configuration saved.</> : null}
            </div>
            {saveStatus === 'error' ? (
              <p role="alert" className="rounded-ff-sm border border-alert/20 bg-alert/5 px-4 py-2.5 text-sm text-alert">
                Storage settings could not be saved. Your edits are still here. Try saving again.
              </p>
            ) : null}
            <FFButton
              icon={<Save className="w-4 h-4" />}
              isLoading={isSaving}
              disabled={!isDirty}
              className="w-full"
              onClick={handleSave}
            >
              Save Configuration
            </FFButton>
          </fieldset>
        )}

      </main>
    </div>
  );
};

export default StorageConfigScreen;
