import { useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { Globe, Settings, ShieldAlert } from 'lucide-react';
import { useApiResource } from '../../../core/hooks/useApiResource';
import type { ApiResponse } from '../../../core/network/apiTypes';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { AdminRepository, type FeatureFlag } from '../repositories/AdminRepository';

const maintenanceKey = 'maintenancemode';
const minimumVersionKey = 'minimumappversion';
const flagLabels: Record<string, string> = {
  globalnotifications: 'Global notifications',
  globalreports: 'Global reports',
};

export default function AppConfigScreen() {
  const flags = useApiResource(AdminRepository.getFeatureFlags, [], 'Could not load configuration. Please try again.');
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ key: string; message: string; error: boolean }>();
  const pendingSave = useRef(false);
  const maintenance = flags.data?.find(flag => flag.flagKey.toLowerCase() === maintenanceKey);
  const minimumVersion = flags.data?.find(flag => flag.flagKey.toLowerCase() === minimumVersionKey);
  const storedFlags = flags.data?.filter(flag => flag !== maintenance && flag !== minimumVersion) ?? [];
  const maintenanceEnabled = maintenance?.flagValue.trim().toLowerCase() === 'true';

  const save = async (flag: FeatureFlag, value: string | boolean, message: string) => {
    if (pendingSave.current || !flags.data) return;
    pendingSave.current = true;
    setSavingKey(flag.flagKey);
    setNotice(undefined);
    const showSaved = (data: FeatureFlag[]) => {
      flags.setData(data);
      setConfirmMaintenance(false);
      setNotice({ key: flag.flagKey, message, error: false });
    };
    try {
      const saved = await AdminRepository.updateFeatureFlag(flag.flagKey, value);
      showSaved(flags.data.map(item => item.flagKey === flag.flagKey ? saved : item));
    } catch (error) {
      const response = isAxiosError<ApiResponse<unknown>>(error) ? error.response?.data : undefined;
      const status = isAxiosError(error) ? error.response?.status : undefined;
      let failureMessage = response?.errors?.[0]?.message || response?.message;

      if (status === undefined || status >= 500) {
        // A missing or failed response can arrive after the database commits the update.
        const current = await AdminRepository.getFeatureFlags().catch(() => null);
        const stored = current?.find(item => item.flagKey === flag.flagKey)?.flagValue.trim();
        if (current && stored === String(value)) {
          showSaved(current);
          return;
        }

        failureMessage ??= current
          ? 'The API returned a different value. Please try again.'
          : 'Could not confirm the save. Recheck the setting before trying again.';
      }

      setNotice({
        key: flag.flagKey,
        message: failureMessage || 'Could not save this setting. Please try again.',
        error: true,
      });
    } finally {
      pendingSave.current = false;
      setSavingKey(null);
    }
  };

  const renderNotice = (key: string) => notice?.key === key && (
    <p role={notice.error ? 'alert' : 'status'} className={`text-sm ${notice.error ? 'text-alert' : 'text-success'}`}>
      {notice.message}
    </p>
  );

  const refresh = () => {
    setNotice(undefined);
    setConfirmMaintenance(false);
    flags.reload();
  };

  return (
    <div className="space-y-6 px-4 py-5 pb-24 page-enter">
      <h1 className="font-display text-xl font-bold text-primary">Platform configuration</h1>
      {flags.isLoading ? (
        <FFShimmer className="h-40 rounded-ff" />
      ) : flags.error ? (
        <FFErrorState message={flags.error} onRetry={refresh} />
      ) : (
        <>
          <section className="space-y-3" aria-label="Feature flags">
            <FFSectionHeader icon={<Settings />} title="Feature flags" />
            {maintenance && (
              <FFCard className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-primary" aria-hidden="true" />
                      <h2 className="font-display text-sm font-semibold text-primary">Maintenance mode</h2>
                      <FFBadge variant={maintenanceEnabled ? 'alert' : 'gray'}>{maintenanceEnabled ? 'On' : 'Off'}</FFBadge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">Pauses normal API traffic. Super Admin access and sign-in remain available.</p>
                  </div>
                  {!confirmMaintenance && (
                    <FFButton type="button" size="sm" variant="outline" disabled={savingKey !== null}
                      isLoading={savingKey === maintenance.flagKey}
                      aria-label={maintenanceEnabled ? 'Disable maintenance mode' : 'Enable maintenance mode'}
                      onClick={() => {
                        if (maintenanceEnabled) void save(maintenance, false, 'Maintenance mode disabled.');
                        else {
                          setNotice(undefined);
                          setConfirmMaintenance(true);
                        }
                      }}>
                      {maintenanceEnabled ? 'Disable maintenance mode' : 'Enable maintenance mode'}
                    </FFButton>
                  )}
                </div>
                {confirmMaintenance && (
                  <div className="space-y-3 rounded-xl border border-alert/20 bg-alert/5 p-3">
                    <p className="text-sm text-primary">Enable maintenance mode and pause normal API traffic?</p>
                    <div className="flex flex-wrap gap-2">
                      <FFButton type="button" size="sm" variant="alert" isLoading={savingKey === maintenance.flagKey}
                        disabled={savingKey !== null} aria-label="Confirm maintenance mode"
                        onClick={() => void save(maintenance, true, 'Maintenance mode enabled.')}>
                        Confirm enable
                      </FFButton>
                      <FFButton type="button" size="sm" variant="outline" disabled={savingKey !== null}
                        onClick={() => { setConfirmMaintenance(false); setNotice(undefined); }}>
                        Cancel
                      </FFButton>
                    </div>
                  </div>
                )}
                {renderNotice(maintenance.flagKey)}
              </FFCard>
            )}
            {storedFlags.length > 0 && (
              <FFCard className="p-4 sm:p-5">
                <h2 className="font-display text-sm font-semibold text-primary">Stored flags</h2>
                <p className="mt-1 text-sm text-slate-600">These values are shown for reference. This screen only changes maintenance mode and the minimum app version.</p>
                <dl className="mt-2 divide-y divide-primary/10">
                  {storedFlags.map(flag => (
                    <div key={flag.flagKey} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-sm">
                      <dt className="break-all font-semibold text-primary">{flagLabels[flag.flagKey.toLowerCase()] ?? flag.flagKey}</dt>
                      <dd className="min-w-0 break-all text-slate-600">{flag.flagValue}</dd>
                    </div>
                  ))}
                </dl>
              </FFCard>
            )}
            {!maintenance && !storedFlags.length && <FFCard className="p-4 text-sm text-slate-600">No feature flags are configured.</FFCard>}
          </section>

          <section className="space-y-3" aria-label="System settings">
            <FFSectionHeader icon={<Settings />} title="System settings" />
            <FFCard className="space-y-3 p-4 sm:p-5">
              {minimumVersion ? (
                <>
                  <VersionForm
                    key={minimumVersion.flagValue}
                    current={minimumVersion.flagValue}
                    disabled={savingKey !== null || confirmMaintenance}
                    isSaving={savingKey === minimumVersion.flagKey}
                    onSave={value => void save(minimumVersion, value, 'Minimum app version saved.')}
                  />
                  {renderNotice(minimumVersion.flagKey)}
                </>
              ) : <p className="text-sm text-slate-600">Minimum app version is missing from the API configuration.</p>}
            </FFCard>
          </section>
        </>
      )}

      <section className="space-y-3" aria-label="System status">
        <FFSectionHeader icon={<Globe />} title="System status" />
        <FFCard className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <div>
            <h2 className="font-display text-sm font-semibold text-primary">Configuration API</h2>
            <p className="mt-1 text-sm text-slate-600">Status from the latest configuration request.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FFBadge variant={flags.isLoading ? 'gray' : flags.error ? 'alert' : 'success'}>
              {flags.isLoading ? 'Checking' : flags.error ? 'Request failed' : 'Responding'}
            </FFBadge>
            <FFButton type="button" size="sm" variant="outline" disabled={flags.isLoading || savingKey !== null} onClick={refresh}>
              Recheck
            </FFButton>
          </div>
        </FFCard>
      </section>
    </div>
  );
}

function VersionForm({ current, disabled, isSaving, onSave }: {
  current: string;
  disabled: boolean;
  isSaving: boolean;
  onSave: (value: string) => void;
}) {
  const [version, setVersion] = useState(current);
  const value = version.trim();

  return (
    <form className="space-y-2" onSubmit={event => {
      event.preventDefault();
      if (!disabled && value !== current) onSave(value);
    }}>
      <label htmlFor="minimum-app-version" className="font-display text-sm font-semibold text-primary">Minimum app version</label>
      <p id="version-description" className="text-sm text-slate-600">Stored version for release tracking. Older clients can still connect.</p>
      <div className="flex flex-wrap items-center gap-2">
        <input id="minimum-app-version" aria-describedby="version-description" type="text"
          pattern="[0-9]+[.][0-9]+[.][0-9]+" title="Enter three numbers separated by periods, such as 1.2.0."
          maxLength={32} required disabled={disabled} value={version} onChange={event => setVersion(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-primary/20 px-3 text-sm text-primary sm:w-48" />
        <FFButton type="submit" size="sm" aria-label="Save minimum app version" disabled={disabled || value === current} isLoading={isSaving}>
          Save version
        </FFButton>
      </div>
    </form>
  );
}
