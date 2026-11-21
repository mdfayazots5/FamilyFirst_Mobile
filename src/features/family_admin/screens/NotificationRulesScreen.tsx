import React, { useEffect, useState } from 'react';
import { Bell, Save } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  FamilyAdminL2Repository,
  NotificationRuleItem,
  NOTIFICATION_RULE_LABELS,
} from '../repositories/FamilyAdminL2Repository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import { useApiResource } from '../../../core/hooks/useApiResource';

// AC notification rules (R6). The API persists one `isEnabled` flag per family rule (plus priority / delay), so
// the screen edits exactly that. Before R6 it showed six hardcoded rules with ids '1'–'6' and per-role recipient
// and channel toggles that no endpoint stores; saving sent the fake ids and failed silently.
// [VERIFY — L2 spec AC "notification intelligence"] per-role recipients / channels need a backend contract first.

const NotificationRulesScreen: React.FC = () => {
  const { user } = useAuth();
  const familyId = user?.familyId;
  const resource = useApiResource<NotificationRuleItem[]>(
    familyId ? () => FamilyAdminL2Repository.getNotificationRules(familyId) : null,
    [familyId],
    'Notification rules could not be loaded.',
  );
  const rules = resource.data ?? [];
  const loadError = familyId ? resource.error : 'Family details are not available.';

  // Form state: enabled flag per ruleId, seeded from each load.
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (resource.data) setEnabled(Object.fromEntries(resource.data.map(r => [r.ruleId, r.isEnabled])));
  }, [resource.data]);

  const changed = rules.filter(r => enabled[r.ruleId] !== undefined && enabled[r.ruleId] !== r.isEnabled);

  const handleSave = async () => {
    if (!familyId || changed.length === 0) return;
    setIsSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      const updated = await Promise.all(
        changed.map(rule => FamilyAdminL2Repository.updateNotificationRule(familyId, rule.ruleId, {
          isEnabled: enabled[rule.ruleId],
          priorityOverride: rule.priorityOverride,
          deliveryDelayMinutes: rule.deliveryDelayMinutes,
        })),
      );
      const byId = new Map(updated.map(r => [r.ruleId, r]));
      resource.setData(rules.map(r => byId.get(r.ruleId) ?? r));
      setSaved(true);
    } catch {
      setSaveError('Notification rules could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Notification Rules"
        subtitle="Choose which family events send notifications"
        showBack
        rightAction={
          <FFButton
            size="sm"
            icon={<Save className="w-4 h-4" />}
            onClick={() => void handleSave()}
            isLoading={isSaving}
            disabled={changed.length === 0}
          >
            Save
          </FFButton>
        }
      />

      <main className="px-4 py-5 space-y-4 page-enter">
        <FFSectionHeader icon={<Bell className="w-[18px] h-[18px]" />} title="Events" />

        {saveError && <p role="alert" className="font-body text-sm text-alert">{saveError}</p>}
        {saved && !saveError && <p className="font-body text-sm text-success">Notification rules saved.</p>}

        {resource.isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <FFShimmer key={i} className="h-16 rounded-ff" />)}
          </div>
        ) : loadError ? (
          <FFErrorState message={loadError} onRetry={familyId ? resource.reload : undefined} />
        ) : rules.length === 0 ? (
          <FFEmptyState title="No notification rules" message="This family has no configurable notification rules yet." />
        ) : (
          <FFCard className="overflow-hidden">
            {rules.map((rule, index) => {
              const isOn = enabled[rule.ruleId] ?? rule.isEnabled;
              return (
                <label
                  key={rule.ruleId}
                  className={`flex items-center justify-between gap-3 px-4 min-h-[56px] cursor-pointer ${index > 0 ? 'border-t border-black/5' : ''}`}
                >
                  <span className="font-body text-sm font-medium text-primary">
                    {NOTIFICATION_RULE_LABELS[rule.ruleKey] ?? rule.ruleKey}
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={isOn}
                    onChange={e => setEnabled(prev => ({ ...prev, [rule.ruleId]: e.target.checked }))}
                    className="w-6 h-6 accent-primary"
                    aria-label={`${NOTIFICATION_RULE_LABELS[rule.ruleKey] ?? rule.ruleKey} notifications`}
                  />
                </label>
              );
            })}
          </FFCard>
        )}
      </main>
    </div>
  );
};

export default NotificationRulesScreen;
