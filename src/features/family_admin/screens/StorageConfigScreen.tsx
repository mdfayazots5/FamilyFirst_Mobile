import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, HardDrive, Cloud, Save } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyAdminL2Repository, StorageConfig } from '../repositories/FamilyAdminL2Repository';

const STORAGE_MODES = [
  { id: 'AppManaged', label: 'App Managed', desc: 'Documents stored securely on FamilyFirst servers (AWS S3, India region).' },
  { id: 'GoogleDrive', label: 'Google Drive', desc: 'All documents routed to your Google Drive. Requires Google sign-in.' },
  { id: 'Hybrid', label: 'Hybrid', desc: 'Medical + Identity stay on app; other categories route to Google Drive.' },
] as const;

const QUOTA_OPTIONS = [75, 90, 95];
const CACHE_OPTIONS = [500, 1000, 2000];

const StorageConfigScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [config, setConfig]   = useState<StorageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [form, setForm]       = useState<Partial<StorageConfig>>({});

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
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Storage Configuration
            </h1>
            <p className="text-xs text-blue-200">AC-01 — Document storage provider</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl bg-white/10">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 pb-32 space-y-4">
        {/* Storage usage */}
        {config && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#1A2E4A]">Storage Used</p>
              <p className="text-xs text-gray-400">
                {(config.storageUsedBytes / 1024 / 1024).toFixed(0)} MB / {(config.storageQuotaBytes / 1024 / 1024 / 1024).toFixed(0)} GB
              </p>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${usedPct > 90 ? 'bg-red-500' : usedPct > 75 ? 'bg-amber-400' : 'bg-[#2D6A4F]'}`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{usedPct}% used</p>
          </div>
        )}

        {/* Storage mode */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Storage Provider
          </h2>
          {STORAGE_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setForm(f => ({ ...f, storageMode: mode.id }))}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                form.storageMode === mode.id
                  ? 'border-[#1A2E4A] bg-[#1A2E4A]/5'
                  : 'border-gray-200'
              }`}
            >
              {mode.id === 'AppManaged' ? <HardDrive className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#1A2E4A]" /> : <Cloud className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />}
              <div>
                <p className="text-sm font-semibold text-[#1A2E4A]">{mode.label}</p>
                <p className="text-xs text-gray-400">{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Quota alert threshold */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Storage Alert Threshold
          </h2>
          <p className="text-xs text-gray-400">Notify when storage reaches this percentage.</p>
          <div className="flex gap-2">
            {QUOTA_OPTIONS.map(pct => (
              <button
                key={pct}
                onClick={() => setForm(f => ({ ...f, storageQuotaAlertThresholdPct: pct }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                  form.storageQuotaAlertThresholdPct === pct
                    ? 'bg-[#1A2E4A] text-white border-[#1A2E4A]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Offline cache */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Offline Cache Size
          </h2>
          <p className="text-xs text-gray-400">Documents cached for offline access (most recently accessed first).</p>
          <div className="flex gap-2">
            {CACHE_OPTIONS.map(mb => (
              <button
                key={mb}
                onClick={() => setForm(f => ({ ...f, offlineCacheSizeMb: mb }))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border ${
                  form.offlineCacheSizeMb === mb
                    ? 'bg-[#1A2E4A] text-white border-[#1A2E4A]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {mb >= 1000 ? `${mb / 1000} GB` : `${mb} MB`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#1A2E4A] text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving…' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default StorageConfigScreen;
