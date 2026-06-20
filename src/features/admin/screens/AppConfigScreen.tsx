import React, { useState, useEffect, useCallback } from 'react';
import { Settings, ShieldAlert, Globe, Smartphone, Save } from 'lucide-react';
import { AdminRepository, FeatureFlag } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const AppConfigScreen: React.FC = () => {
  const [flags, setFlags]       = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [isSaving, setIsSaving]   = useState(false);
  const [pendingCritical, setPendingCritical] = useState<string | null>(null);

  const fetchFlags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setFlags(await AdminRepository.getFeatureFlags());
    } catch {
      setError('Could not load configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const handleToggle = async (id: string, currentState: boolean) => {
    // Maintenance mode enabling requires inline confirmation — no window.confirm
    if (id === 'f1' && !currentState) {
      setPendingCritical(id);
      return;
    }
    await performToggle(id, currentState);
  };

  const performToggle = async (id: string, currentState: boolean) => {
    setPendingCritical(null);
    setFlags(prev => prev.map(f => f.id === id ? { ...f, isEnabled: !currentState } : f));
    try {
      await AdminRepository.updateFeatureFlag(id, !currentState);
    } catch {
      setFlags(prev => prev.map(f => f.id === id ? { ...f, isEnabled: currentState } : f));
    }
  };

  return (
    <div className="px-4 py-5 space-y-6 pb-24 page-enter">

      {/* Maintenance mode confirmation banner */}
      {pendingCritical && (
        <FFCard className="p-4 border border-alert/20">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-alert flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-primary">Enable Maintenance Mode?</p>
              <p className="font-body text-xs text-gray-500 mt-1">
                This will block all user access until you turn it off.
              </p>
              <div className="flex gap-2 mt-3">
                <FFButton
                  variant="alert"
                  size="sm"
                  onClick={() => {
                    const flag = flags.find(f => f.id === pendingCritical);
                    if (flag) performToggle(flag.id, flag.isEnabled);
                  }}
                >
                  Enable
                </FFButton>
                <FFButton variant="outline" size="sm" onClick={() => setPendingCritical(null)}>
                  Cancel
                </FFButton>
              </div>
            </div>
          </div>
        </FFCard>
      )}

      {/* Feature Flags */}
      <div className="space-y-3">
        <FFSectionHeader
          icon={<Settings className="w-[18px] h-[18px]" />}
          title="Feature Flags"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <FFShimmer key={i} className="h-24 rounded-ff" />)}
          </div>
        ) : error ? (
          <FFErrorState message={error} onRetry={fetchFlags} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {flags.map(flag => (
              <FFCard
                key={flag.id}
                className={`p-4 transition-all ${flag.isEnabled ? '' : 'opacity-60'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-ff-sm flex items-center justify-center transition-colors ${
                    flag.isEnabled ? 'bg-primary/10 text-primary' : 'bg-black/5 text-gray-400'
                  }`}>
                    {flag.id === 'f1' ? <ShieldAlert className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                  </div>
                  <button
                    onClick={() => handleToggle(flag.id, flag.isEnabled)}
                    className={`w-12 h-6 rounded-full transition-all relative p-0.5 flex-shrink-0 ${
                      flag.isEnabled ? 'bg-primary' : 'bg-black/10'
                    }`}
                    aria-label={`Toggle ${flag.name}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-sm ${
                      flag.isEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <p className="font-display font-semibold text-sm text-primary">{flag.name}</p>
                <p className="font-body text-xs text-gray-400 mt-0.5 leading-relaxed">{flag.description}</p>
              </FFCard>
            ))}
          </div>
        )}
      </div>

      {/* System Settings */}
      <div className="space-y-3">
        <FFSectionHeader
          icon={<Settings className="w-[18px] h-[18px]" />}
          title="System Settings"
        />
        <FFCard className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
              App Version
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                defaultValue="1.2.0"
                className="flex-1 h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
              <FFButton size="sm" variant="outline">Update</FFButton>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
              Coin Multiplier
            </label>
            <input
              type="number"
              defaultValue="1.0"
              step="0.1"
              className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
              Support Email
            </label>
            <input
              type="email"
              defaultValue="support@familyfirst.app"
              className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <FFButton icon={<Save className="w-4 h-4" />} isLoading={isSaving} className="w-full">
            Save Settings
          </FFButton>
        </FFCard>
      </div>

      {/* System Status */}
      <div className="space-y-3">
        <FFSectionHeader
          icon={<Globe className="w-[18px] h-[18px]" />}
          title="System Status"
        />
        <div className="space-y-2">
          <StatusRow icon={<Globe className="w-4 h-4" />}     label="API Server"    status="Healthy"  variant="success" />
          <StatusRow icon={<Smartphone className="w-4 h-4" />} label="Push Service"  status="Healthy"  variant="success" />
          <StatusRow icon={<ShieldAlert className="w-4 h-4" />} label="Auth Service" status="Degraded" variant="alert" />
        </div>
      </div>

    </div>
  );
};

interface StatusRowProps {
  icon: React.ReactNode;
  label: string;
  status: string;
  variant: 'success' | 'alert';
}

const StatusRow: React.FC<StatusRowProps> = ({ icon, label, status, variant }) => (
  <FFCard className="p-3">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-ff-sm bg-black/5 flex items-center justify-center text-gray-400 flex-shrink-0">
        {icon}
      </div>
      <p className="font-body text-sm text-primary flex-1 min-w-0">{label}</p>
      <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${
        variant === 'success'
          ? 'bg-success/10 text-success'
          : 'bg-alert/10 text-alert'
      }`}>
        {status}
      </span>
    </div>
  </FFCard>
);

export default AppConfigScreen;
