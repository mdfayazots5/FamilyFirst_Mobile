import { useRef, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Send, MessageSquare } from 'lucide-react';
import type { ApiResponse } from '../../../core/network/apiTypes';
import {
  ADMIN_CAMPAIGN_ROLE_OPTIONS,
  ADMIN_CAMPAIGN_SCHEDULE_OPTIONS,
  AdminRepository,
} from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { APP_LOCALE } from '../../../core/utils/format';

const emptyCampaign = { title: '', body: '', targetRole: 'All', scheduledFor: 'Immediate' };
const roleLabels: Record<string, string> = { All: 'All users', Child: 'Children' };

const NotificationCampaignScreen = () => {
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [campaign, setCampaign] = useState(emptyCampaign);
  const sending = useRef(false);

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending.current) return;
    const title = campaign.title.trim();
    const body = campaign.body.trim();
    setNotice('');
    setError('');
    if (!title || !body) {
      setError('Enter a title and message.');
      return;
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const scheduledFor = campaign.scheduledFor === 'In 1 Hour'
      ? new Date(now.getTime() + 3_600_000)
      : campaign.scheduledFor === 'Tomorrow' ? tomorrow : null;
    sending.current = true;
    setIsSending(true);
    try {
      const { recipientCount } = await AdminRepository.sendCampaign({
        title,
        body,
        roles: campaign.targetRole === 'All' ? [] : [campaign.targetRole],
        scheduledFor: scheduledFor?.toISOString() ?? null,
      });
      if (recipientCount === 0) {
        setError('No recipients matched this audience.');
        return;
      }
      const recipients = `${recipientCount} ${recipientCount === 1 ? 'recipient' : 'recipients'}`;
      setNotice(scheduledFor
        ? `Campaign scheduled for ${scheduledFor.toLocaleString(APP_LOCALE)} · ${recipients}.`
        : `Campaign queued for ${recipients}.`);
      setCampaign(emptyCampaign);
    } catch (err) {
      const response = isAxiosError<ApiResponse<unknown>>(err) ? err.response?.data : undefined;
      setError((Array.isArray(response?.errors) ? response.errors[0]?.message : undefined)
        || response?.message || 'Could not queue the campaign. Please try again.');
    } finally {
      sending.current = false;
      setIsSending(false);
    }
  };

  const roles = ADMIN_CAMPAIGN_ROLE_OPTIONS;

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Broadcasts"
        subtitle="Send announcements to users"
        showBack
      />

      <main className="px-4 py-5 space-y-6 page-enter">

        {/* Campaign Form */}
        <FFCard className="p-4">
          <form onSubmit={handleSend} className="space-y-4">
            <fieldset disabled={isSending} className="space-y-4">

              <div className="space-y-1.5">
                <label htmlFor="campaign-title" className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  Title
                </label>
                <input
                  id="campaign-title"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="e.g. New Features Available"
                  className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300"
                  value={campaign.title}
                  onChange={e => setCampaign({ ...campaign, title: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="campaign-message" className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  id="campaign-message"
                  rows={4}
                  required
                  maxLength={1000}
                  placeholder="What do you want to tell your users?"
                  className="w-full px-4 py-3 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300 resize-none"
                  value={campaign.body}
                  onChange={e => setCampaign({ ...campaign, body: e.target.value })}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="campaign-audience" className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
                    Audience
                  </label>
                  <select
                    id="campaign-audience"
                    className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    value={campaign.targetRole}
                    onChange={e => setCampaign({ ...campaign, targetRole: e.target.value })}
                  >
                    {roles.map(role => <option key={role} value={role}>{roleLabels[role] ?? `${role}s`}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="campaign-schedule" className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
                    Schedule
                  </label>
                  <select
                    id="campaign-schedule"
                    className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    value={campaign.scheduledFor}
                    onChange={e => setCampaign({ ...campaign, scheduledFor: e.target.value })}
                  >
                    {ADMIN_CAMPAIGN_SCHEDULE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <FFButton
              type="submit"
              className="w-full"
              icon={<Send className="w-4 h-4" />}
              isLoading={isSending}
            >
              {campaign.scheduledFor === 'Immediate' ? 'Send campaign' : 'Schedule campaign'}
            </FFButton>

            {notice && <p role="status" className="rounded-ff bg-success/10 p-3 text-sm font-semibold text-success">{notice}</p>}
            {error && <p role="alert" className="rounded-ff bg-alert/10 p-3 text-sm font-semibold text-alert">{error}</p>}
          </form>
        </FFCard>

        {/* Notification Preview */}
        <div className="space-y-3">
          <FFSectionHeader
            icon={<MessageSquare className="w-[18px] h-[18px]" />}
            title="Preview"
          />
          <FFCard className="p-4">
            <div className="bg-black/5 rounded-ff p-3">
              <div className="bg-white rounded-xl p-3 shadow-card">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-body font-bold text-[9px] text-white">FF</span>
                  </div>
                  <span className="font-body font-semibold text-xs text-gray-500">FamilyFirst</span>
                  <span className="font-body text-xs text-gray-500 ml-auto">{campaign.scheduledFor}</span>
                </div>
                <p className="font-display font-semibold text-xs text-primary truncate">
                  {campaign.title || 'Notification Title'}
                </p>
                <p className="font-body text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {campaign.body || 'Your message will appear here.'}
                </p>
              </div>
            </div>
          </FFCard>
        </div>

      </main>
    </div>
  );
};

export default NotificationCampaignScreen;
