import React, { useEffect, useState } from 'react';
import { RefreshCw, Save, Shield, Info } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyAdminL2Repository, FinancePrivacyConfig } from '../repositories/FamilyAdminL2Repository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const TIER_META = {
  1: { label: 'Full Visibility', colorOn: 'bg-alert text-white border-alert',     colorOff: 'bg-white text-gray-500 border-black/5', desc: 'All transactions + merchant names' },
  2: { label: 'Category Only',   colorOn: 'bg-accent text-primary border-accent',  colorOff: 'bg-white text-gray-500 border-black/5', desc: 'Amounts + categories; merchant private' },
  3: { label: 'Aggregate Only',  colorOn: 'bg-success text-white border-success',  colorOff: 'bg-white text-gray-500 border-black/5', desc: 'Monthly total only' },
};

const REMINDER_OPTIONS = [7, 14, 30, 60, 90];

const FinancePrivacyScreen: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<FinancePrivacyConfig | null>(null);
  const [form, setForm] = useState<FinancePrivacyConfig>({
    defaultAdultEarningMemberTier: 2,
    defaultIndependentMemberTier: 3,
    consentReminderIntervalDays: 30,
    autoExcludeSalaryCredits: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);

  const load = async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await FamilyAdminL2Repository.getFinancePrivacyConfig(user.familyId);
      setConfig(data);
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
      const updated = await FamilyAdminL2Repository.updateFinancePrivacyConfig(user.familyId, form);
      setConfig(updated);
      setForm({ ...updated });
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = config && (
    form.defaultAdultEarningMemberTier !== config.defaultAdultEarningMemberTier ||
    form.defaultIndependentMemberTier  !== config.defaultIndependentMemberTier  ||
    form.consentReminderIntervalDays   !== config.consentReminderIntervalDays   ||
    form.autoExcludeSalaryCredits      !== config.autoExcludeSalaryCredits
  );

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Finance Privacy"
        subtitle="Default sharing tiers for new members"
        showBack
      />

      <main className="px-4 py-5 space-y-4 page-enter">

        {/* Privacy notice */}
        <FFCard className="p-3 flex items-start gap-3">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="font-body text-xs text-gray-500 leading-relaxed">
            These are default tiers for new member invitations. Members see their tier during consent and can decline. Tiers cannot be lowered without re-consent.
          </p>
        </FFCard>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <FFShimmer key={i} className="h-28 rounded-ff" />)}
          </div>
        ) : (
          <>
            {/* Adult Earning Members tier */}
            <TierSelector
              label="Adult Earning Members"
              desc="Default for spouse, adult children with own income"
              value={form.defaultAdultEarningMemberTier}
              onChange={t => setForm(f => ({ ...f, defaultAdultEarningMemberTier: t }))}
            />

            {/* Financially Independent Members tier */}
            <TierSelector
              label="Financially Independent Members"
              desc="Default for members with separate household finances"
              value={form.defaultIndependentMemberTier}
              onChange={t => setForm(f => ({ ...f, defaultIndependentMemberTier: t }))}
            />

            {/* Consent reminder interval */}
            <FFCard className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold text-sm text-primary">Consent Reminder Interval</p>
                <span className="font-numbers font-medium text-sm text-accent">{form.consentReminderIntervalDays} days</span>
              </div>
              <p className="font-body text-xs text-gray-400">How often consented members receive an SMS reminder of their active sharing (DPDP Act 2023).</p>
              <div className="flex gap-2 flex-wrap">
                {REMINDER_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setForm(f => ({ ...f, consentReminderIntervalDays: d }))}
                    className={`px-3 py-1.5 rounded-xl font-body text-xs font-semibold border transition-colors ${
                      form.consentReminderIntervalDays === d
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-500 border-black/5'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </FFCard>

            {/* Auto-exclude salary */}
            <FFCard className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-display font-semibold text-sm text-primary">Auto-Exclude Salary Credits</p>
                  <p className="font-body text-xs text-gray-400 mt-1">
                    Salary credits are tagged as Income and excluded from expense calculations.
                  </p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, autoExcludeSalaryCredits: !f.autoExcludeSalaryCredits }))}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    form.autoExcludeSalaryCredits ? 'bg-primary' : 'bg-black/10'
                  }`}
                  aria-label="Toggle auto-exclude salary credits"
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.autoExcludeSalaryCredits ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </FFCard>

            <FFButton
              icon={<Save className="w-4 h-4" />}
              isLoading={isSaving}
              disabled={!isDirty}
              className="w-full"
              onClick={handleSave}
            >
              Save Privacy Defaults
            </FFButton>
          </>
        )}

      </main>
    </div>
  );
};

interface TierSelectorProps {
  label: string;
  desc: string;
  value: 1 | 2 | 3;
  onChange: (t: 1 | 2 | 3) => void;
}

const TierSelector: React.FC<TierSelectorProps> = ({ label, desc, value, onChange }) => (
  <FFCard className="p-4 space-y-3">
    <div className="flex items-center gap-2">
      <Shield className="w-4 h-4 text-primary" />
      <p className="font-display font-semibold text-sm text-primary">{label}</p>
    </div>
    <p className="font-body text-xs text-gray-400">{desc}</p>
    <div className="flex gap-2">
      {([1, 2, 3] as const).map(tier => {
        const m = TIER_META[tier];
        return (
          <button
            key={tier}
            onClick={() => onChange(tier)}
            className={`flex-1 py-2 px-1 rounded-xl font-body text-xs font-semibold border transition-colors ${
              value === tier ? m.colorOn : m.colorOff
            }`}
          >
            T{tier}
          </button>
        );
      })}
    </div>
    <p className="font-body text-xs text-gray-400">{TIER_META[value].desc}</p>
  </FFCard>
);

export default FinancePrivacyScreen;
