import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyAdminL2Repository } from '../repositories/FamilyAdminL2Repository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';

interface NotificationRule {
  id: string;
  event: string;
  label: string;
  recipients: string[];
  channels: ('push' | 'sms' | 'email')[];
  isCritical?: boolean;
}

const EVENT_LABELS: Record<string, string> = {
  ATTENDANCE_ABSENT:        'Child Marked Absent',
  TEACHER_FEEDBACK_SIGNAL:  'Teacher Feedback Received',
  TASK_EXECUTION_COMPLETED: 'Task Completed',
  ASSET_CLAIMED_SUCCESS:    'Reward Redeemed',
  EMERGENCY_SOS_ALERT:      'Emergency SOS Alert',
  WEEKLY_ANALYTIC_DEBRIEF:  'Weekly Summary Report',
};

const CHANNELS = [
  { id: 'push' as const, icon: <Smartphone className="w-4 h-4" />, label: 'Push' },
  { id: 'sms'  as const, icon: <MessageSquare className="w-4 h-4" />, label: 'SMS' },
  { id: 'email' as const, icon: <Mail className="w-4 h-4" />, label: 'Email' },
];

const ROLES = ['PARENT', 'CHILD', 'TEACHER', 'ELDER'];
const ROLE_LABELS: Record<string, string> = { PARENT: 'Parent', CHILD: 'Child', TEACHER: 'Teacher', ELDER: 'Elder' };

const NotificationRulesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [rules, setRules] = useState<NotificationRule[]>([
    { id: '1', event: 'ATTENDANCE_ABSENT',        label: EVENT_LABELS['ATTENDANCE_ABSENT'],        recipients: ['PARENT'],           channels: ['push', 'sms'] },
    { id: '2', event: 'TEACHER_FEEDBACK_SIGNAL',  label: EVENT_LABELS['TEACHER_FEEDBACK_SIGNAL'],  recipients: ['PARENT'],           channels: ['push'] },
    { id: '3', event: 'TASK_EXECUTION_COMPLETED', label: EVENT_LABELS['TASK_EXECUTION_COMPLETED'], recipients: ['PARENT'],           channels: ['push'] },
    { id: '4', event: 'ASSET_CLAIMED_SUCCESS',    label: EVENT_LABELS['ASSET_CLAIMED_SUCCESS'],    recipients: ['PARENT'],           channels: ['push', 'email'] },
    { id: '5', event: 'EMERGENCY_SOS_ALERT',      label: EVENT_LABELS['EMERGENCY_SOS_ALERT'],      recipients: ['PARENT', 'ELDER'],  channels: ['push', 'sms'], isCritical: true },
    { id: '6', event: 'WEEKLY_ANALYTIC_DEBRIEF',  label: EVENT_LABELS['WEEKLY_ANALYTIC_DEBRIEF'],  recipients: ['PARENT'],           channels: ['email'] },
  ]);

  const toggleRecipient = (ruleId: string, role: string) => {
    setRules(prev => prev.map(rule => {
      if (rule.id !== ruleId) return rule;
      const exists = rule.recipients.includes(role);
      return { ...rule, recipients: exists ? rule.recipients.filter(r => r !== role) : [...rule.recipients, role] };
    }));
  };

  const toggleChannel = (ruleId: string, channel: 'push' | 'sms' | 'email') => {
    setRules(prev => prev.map(rule => {
      if (rule.id !== ruleId) return rule;
      const exists = rule.channels.includes(channel);
      return { ...rule, channels: exists ? rule.channels.filter(c => c !== channel) : [...rule.channels, channel] };
    }));
  };

  useEffect(() => {
    if (!user?.familyId) return;
    FamilyAdminL2Repository.getNotificationRules(user.familyId).then(items => {
      setRules(prev => prev.map(rule => {
        const match = items.find(i => i.ruleKey.toUpperCase() === rule.event);
        if (!match) return rule;
        return { ...rule, recipients: match.isEnabled ? rule.recipients : [], channels: match.isEnabled ? rule.channels : [] };
      }));
    }).catch(() => { /* keep defaults */ }).finally(() => setIsLoading(false));
  }, [user?.familyId]);

  const handleSave = async () => {
    if (!user?.familyId) return;
    setIsSaving(true);
    try {
      await Promise.all(
        rules.map(rule =>
          FamilyAdminL2Repository.updateNotificationRule(user.familyId!, rule.id, {
            isEnabled: rule.recipients.length > 0,
          })
        )
      );
    } catch { /* silent */ }
    finally { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Notification Rules"
        subtitle="Who gets notified and how"
        showBack
        rightAction={
          <FFButton size="sm" icon={<Save className="w-4 h-4" />} onClick={handleSave} isLoading={isSaving}>
            Save
          </FFButton>
        }
      />

      <main className="px-4 py-5 space-y-4 page-enter">

        <FFSectionHeader icon={<Bell className="w-[18px] h-[18px]" />} title="Events" />

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <FFShimmer key={i} className="h-28 rounded-ff" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => (
              <FFCard key={rule.id} className="p-4 space-y-3">
                {/* Event label */}
                <div className="flex items-center gap-2">
                  {rule.isCritical && <AlertTriangle className="w-4 h-4 text-alert flex-shrink-0" />}
                  <p className={`font-display font-semibold text-sm ${rule.isCritical ? 'text-alert' : 'text-primary'}`}>
                    {rule.label}
                  </p>
                </div>

                {/* Recipients */}
                <div className="space-y-1.5">
                  <p className="font-body font-semibold text-xs text-gray-400 uppercase tracking-wider">Notify</p>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map(role => {
                      const active = rule.recipients.includes(role);
                      return (
                        <button
                          key={role}
                          onClick={() => toggleRecipient(rule.id, role)}
                          className={`h-8 px-3 rounded-full font-body text-xs font-semibold transition-colors ${
                            active
                              ? 'bg-primary text-white'
                              : 'bg-black/5 text-gray-400 hover:bg-black/10'
                          }`}
                        >
                          {ROLE_LABELS[role]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Channels */}
                <div className="space-y-1.5">
                  <p className="font-body font-semibold text-xs text-gray-400 uppercase tracking-wider">Via</p>
                  <div className="flex gap-2">
                    {CHANNELS.map(ch => {
                      const active = rule.channels.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          onClick={() => toggleChannel(rule.id, ch.id)}
                          className={`flex items-center gap-1.5 h-8 px-3 rounded-xl font-body text-xs font-semibold transition-colors ${
                            active
                              ? 'bg-primary/10 text-primary'
                              : 'bg-black/5 text-gray-400 hover:bg-black/10'
                          }`}
                        >
                          {ch.icon}
                          {ch.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </FFCard>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default NotificationRulesScreen;
