import React, { useEffect, useState } from 'react';
import { RefreshCw, Shield, UserCheck, UserX, CheckCircle } from 'lucide-react';
import { FinanceProvider, useFinance } from '../providers/FinanceProvider';
import { FinanceRepository } from '../repositories/FinanceRepository';
import { useAuth } from '../../../core/auth/AuthContext';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';

const TIER_LABELS: Record<number, { label: string; desc: string; color: string }> = {
  1: { label: 'Full Visibility',  desc: 'All transactions with merchant names', color: 'text-alert bg-alert/5' },
  2: { label: 'Category Only',    desc: 'Amounts + categories, merchant private', color: 'text-accent bg-accent/10' },
  3: { label: 'Aggregate Only',   desc: 'Monthly total only — most private', color: 'text-success bg-success/10' },
};

const CONSENT_LABELS: Record<string, { label: string; color: string }> = {
  NotInvited: { label: 'Not Invited', color: 'text-gray-400' },
  Invited:    { label: 'Invite Sent', color: 'text-accent' },
  Accepted:   { label: 'Active',      color: 'text-success' },
  Declined:   { label: 'Declined',    color: 'text-alert' },
  OptedOut:   { label: 'Opted Out',   color: 'text-gray-400' },
};

const FinanceSettingsContent: React.FC = () => {
  const { user } = useAuth();
  const { settings, isLoading, loadSettings } = useFinance();
  const [inviting, setInviting] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleInvite = async (memberId: string) => {
    if (!user?.familyId) return;
    setInviting(memberId);
    try {
      await FinanceRepository.inviteConsent(user.familyId, { memberId, privacyTier: 2 });
      await loadSettings();
    } finally {
      setInviting(null);
    }
  };

  const handleRevoke = async (memberId: string) => {
    if (!user?.familyId) return;
    setRevoking(memberId);
    try {
      await FinanceRepository.revokeConsent(user.familyId, memberId);
      await loadSettings();
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Finance Settings"
        subtitle="Privacy tiers & consent"
        showBack
        rightAction={
          <button onClick={loadSettings} className="p-2 rounded-xl bg-white/10" aria-label="Refresh">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="px-4 pt-5 pb-24 space-y-4">
        {/* Privacy tier legend */}
        <FFCard className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <p className="font-display text-sm font-semibold text-primary">Privacy Tier Guide</p>
          </div>
          {Object.entries(TIER_LABELS).map(([tier, { label, desc, color }]) => (
            <div key={tier} className="flex items-start gap-3">
              <span className={`font-numbers text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${color}`}>
                T{tier}
              </span>
              <div>
                <p className="font-body text-xs font-semibold text-primary">{label}</p>
                <p className="font-body text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
          <p className="font-body text-xs text-gray-400 border-t border-black/5 pt-2 mt-1">
            Tiers cannot be lowered without member re-consent. Upgrades (more privacy) apply immediately.
          </p>
        </FFCard>

        {/* Module status */}
        {settings && (
          <div className={`rounded-ff p-4 shadow-card ${
            settings.isModuleEnabled
              ? 'bg-success/5 border border-success/20'
              : 'bg-black/[0.02] border border-black/5'
          }`}>
            <div className="flex items-center gap-2">
              {settings.isModuleEnabled && <CheckCircle className="w-4 h-4 text-success" />}
              <p className="font-body text-sm font-semibold text-primary">
                Module {settings.isModuleEnabled ? 'Enabled' : 'Not Enabled'}
              </p>
            </div>
            {settings.cfoMemberName && (
              <p className="font-body text-xs text-gray-500 mt-0.5">Family CFO: {settings.cfoMemberName}</p>
            )}
          </div>
        )}

        {/* Member consent list */}
        <FFCard className="overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="font-display text-sm font-semibold text-primary">Member Consent</p>
          </div>
          {isLoading ? (
            <div className="px-4 pb-4 space-y-3">
              {[...Array(3)].map((_, i) => <FFShimmer key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : (
            settings?.memberSettings.map((m, i) => {
              const consent  = CONSENT_LABELS[m.consentStatus] ?? CONSENT_LABELS.NotInvited;
              const tierMeta = TIER_LABELS[m.privacyTier];

              return (
                <div key={m.memberId} className={`px-4 py-3 ${i !== 0 ? 'border-t border-black/5' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-numbers font-bold text-sm flex-shrink-0">
                      {m.memberName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-body text-sm font-semibold text-primary">{m.memberName}</p>
                        <span className={`font-numbers text-xs font-medium px-2 py-0.5 rounded-full ${tierMeta?.color ?? 'text-gray-400 bg-black/5'}`}>
                          T{m.privacyTier}
                        </span>
                      </div>
                      <p className={`font-body text-xs font-medium mt-0.5 ${consent.color}`}>{consent.label}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {m.consentStatus === 'Accepted' ? (
                        <button
                          onClick={() => handleRevoke(m.memberId)}
                          disabled={revoking === m.memberId}
                          className="flex items-center gap-1 font-body text-xs text-alert border border-alert/20 px-2 py-1.5 rounded-xl disabled:opacity-50"
                        >
                          {revoking === m.memberId
                            ? <RefreshCw className="w-3 h-3 animate-spin" />
                            : <UserX className="w-3 h-3" />}
                          Revoke
                        </button>
                      ) : m.consentStatus === 'NotInvited' || m.consentStatus === 'Declined' ? (
                        <button
                          onClick={() => handleInvite(m.memberId)}
                          disabled={inviting === m.memberId}
                          className="flex items-center gap-1 font-body text-xs text-primary border border-black/10 px-2 py-1.5 rounded-xl disabled:opacity-50"
                        >
                          {inviting === m.memberId
                            ? <RefreshCw className="w-3 h-3 animate-spin" />
                            : <UserCheck className="w-3 h-3" />}
                          Invite
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </FFCard>

        {/* DPDP notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-ff p-4">
          <p className="font-body text-xs text-primary font-medium">DPDP Act 2023 Compliant</p>
          <p className="font-body text-xs text-primary/70 mt-1">
            Consent is explicit, recorded, and revocable at any time. Members can stop sharing by texting STOP.
            Data is purged immediately on opt-out. No residual data. No follow-up pressure.
          </p>
        </div>
      </div>
    </div>
  );
};

const FinanceSettingsScreen: React.FC = () => (
  <FinanceProvider>
    <FinanceSettingsContent />
  </FinanceProvider>
);

export default FinanceSettingsScreen;
