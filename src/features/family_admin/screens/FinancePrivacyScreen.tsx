import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Save, Shield } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyAdminL2Repository, FinancePrivacyConfig } from '../repositories/FamilyAdminL2Repository';

const TIER_META = {
  1: { label: 'Full Visibility', color: 'text-red-600 bg-red-50 border-red-200', desc: 'All transactions + merchant names' },
  2: { label: 'Category Only',   color: 'text-amber-700 bg-amber-50 border-amber-200', desc: 'Amounts + categories; merchant private' },
  3: { label: 'Aggregate Only',  color: 'text-green-700 bg-green-50 border-green-200', desc: 'Monthly total only' },
};

const REMINDER_OPTIONS = [7, 14, 30, 60, 90];

const FinancePrivacyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [config, setConfig]   = useState<FinancePrivacyConfig | null>(null);
  const [form, setForm]       = useState<FinancePrivacyConfig>({
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

  const TierSelector: React.FC<{
    label: string; desc: string;
    value: 1 | 2 | 3;
    onChange: (t: 1 | 2 | 3) => void;
  }> = ({ label, desc, value, onChange }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-[#1A2E4A]" />
        <p className="text-sm font-bold text-[#1A2E4A]">{label}</p>
      </div>
      <p className="text-xs text-gray-400">{desc}</p>
      <div className="flex gap-2">
        {([1, 2, 3] as const).map(tier => {
          const m = TIER_META[tier];
          return (
            <button
              key={tier}
              onClick={() => onChange(tier)}
              className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium border transition-colors ${
                value === tier ? `${m.color} border-current` : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              T{tier}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400">{TIER_META[value].desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Finance Privacy Defaults
            </h1>
            <p className="text-xs text-blue-200">AC-06 — Default tiers for new member consent</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl bg-white/10">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 pb-32 space-y-4">
        {/* Privacy notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs text-blue-700 font-medium">Defaults Only</p>
          <p className="text-xs text-blue-600 mt-1">
            These are the default tiers assigned when inviting a new member to finance sharing.
            The member sees their assigned tier during consent and can decline. Tiers cannot be lowered below documented minimums without re-consent.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 text-gray-300 animate-spin" /></div>
        ) : (
          <>
            <TierSelector
              label="Adult Earning Members"
              desc="Default tier for spouse, adult children with own income"
              value={form.defaultAdultEarningMemberTier}
              onChange={t => setForm(f => ({ ...f, defaultAdultEarningMemberTier: t }))}
            />

            <TierSelector
              label="Financially Independent Members"
              desc="Default tier for members with separate household finances"
              value={form.defaultIndependentMemberTier}
              onChange={t => setForm(f => ({ ...f, defaultIndependentMemberTier: t }))}
            />

            {/* Consent reminder interval */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#1A2E4A]">Consent Reminder Interval</p>
                <span className="text-sm font-bold text-[#C8922A]">{form.consentReminderIntervalDays} days</span>
              </div>
              <p className="text-xs text-gray-400">How often consented members receive an SMS reminder of their active sharing (DPDP Act 2023 requirement).</p>
              <div className="flex gap-2 flex-wrap">
                {REMINDER_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setForm(f => ({ ...f, consentReminderIntervalDays: d }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                      form.consentReminderIntervalDays === d
                        ? 'bg-[#1A2E4A] text-white border-[#1A2E4A]'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-exclude salary */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1A2E4A]">Auto-Exclude Salary Credits</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Salary credit transactions are automatically tagged as Income and excluded from expense calculations.
                  </p>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, autoExcludeSalaryCredits: !f.autoExcludeSalaryCredits }))}
                  className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                    form.autoExcludeSalaryCredits ? 'bg-[#1A2E4A]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.autoExcludeSalaryCredits ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="w-full flex items-center justify-center gap-2 bg-[#1A2E4A] text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving…' : 'Save Privacy Defaults'}
        </button>
      </div>
    </div>
  );
};

export default FinancePrivacyScreen;
