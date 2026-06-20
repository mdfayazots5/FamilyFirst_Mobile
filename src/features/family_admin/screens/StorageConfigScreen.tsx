import React, { useEffect, useState } from 'react';
import { HardDrive, Cloud, Save } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyAdminL2Repository, StorageConfig } from '../repositories/FamilyAdminL2Repository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const STORAGE_MODES = [
  { id: 'AppManaged',  icon: <HardDrive className="w-4 h-4 text-primary" />, label: 'App Managed',  desc: 'Documents stored securely on FamilyFirst servers (AWS S3, India region).' },
  { id: 'GoogleDrive', icon: <Cloud className="w-4 h-4 text-primary" />,     label: 'Google Drive', desc: 'All documents routed to your Google Drive. Requires Google sign-in.' },
  { id: 'Hybrid',      icon: <Cloud className="w-4 h-4 text-primary" />,     label: 'Hybrid',       desc: 'Medical + Identity stay on app; other categories route to Google Drive.' },
] as const;

const QUOTA_OPTIONS = [75, 90, 95];
const CACHE_OPTIONS = [500, 1000, 2000];

const StorageConfigScreen: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig]     = useState<StorageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [form, setForm]         = useState<Partial<StorageConfig>>({});

  const load = async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await FamilyAdminL2Repository.getStorageConfig(user.familyId);
      setConfig(data);
      setForm({ storageMode: data.storageMode, storageQuotaAlertThresholdPct: data.storageQuotaAlertThresholdPct, offlineCacheSizeMb: data.offlineCacheSizeMb });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.familyId]);

  const handleSave = async () => {
    if (!user?.familyId || !form.storageMode) return;
    setIsSaving(true);
    try {
      const updated = await FamilyAdminL2Repository.updateStorageConfig(user.familyId, form);
      setConfig(updated);
    } finally {
      setIsSaving(false);
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
        ) : (
          <>
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
                    onClick={() => setForm(f => ({ ...f, storageMode: mode.id }))}
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
                    onClick={() => setForm(f => ({ ...f, storageQuotaAlertThresholdPct: pct }))}
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
                    onClick={() => setForm(f => ({ ...f, offlineCacheSizeMb: mb }))}
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

            <FFButton
              icon={<Save className="w-4 h-4" />}
              isLoading={isSaving}
              className="w-full"
              onClick={handleSave}
            >
              Save Configuration
            </FFButton>
          </>
        )}

      </main>
    </div>
  );
};

export default StorageConfigScreen;
