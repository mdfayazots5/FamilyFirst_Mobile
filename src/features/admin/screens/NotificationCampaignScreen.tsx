import React, { useState } from 'react';
import { Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { AdminRepository } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const NotificationCampaignScreen: React.FC = () => {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [campaign, setCampaign] = useState({
    title: '',
    body: '',
    targetRole: 'All',
    scheduledFor: 'Immediate',
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await AdminRepository.sendCampaign(campaign);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCampaign({ title: '', body: '', targetRole: 'All', scheduledFor: 'Immediate' });
      }, 3000);
    } catch (err) {
      console.error('Failed to send campaign', err);
    } finally {
      setIsSending(false);
    }
  };

  const roles = ['All', 'Parent', 'Child', 'Teacher', 'Elder'];

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

            <div className="space-y-1.5">
              <label className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. New Features Available"
                className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300"
                value={campaign.title}
                onChange={e => setCampaign({ ...campaign, title: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
                Message
              </label>
              <textarea
                rows={4}
                required
                placeholder="What do you want to tell your users?"
                className="w-full px-4 py-3 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300 resize-none"
                value={campaign.body}
                onChange={e => setCampaign({ ...campaign, body: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  Audience
                </label>
                <select
                  className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
                  value={campaign.targetRole}
                  onChange={e => setCampaign({ ...campaign, targetRole: e.target.value })}
                >
                  {roles.map(role => <option key={role} value={role}>{role}s</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
                  Schedule
                </label>
                <select
                  className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 appearance-none"
                  value={campaign.scheduledFor}
                  onChange={e => setCampaign({ ...campaign, scheduledFor: e.target.value })}
                >
                  <option value="Immediate">Immediate</option>
                  <option value="In 1 Hour">In 1 Hour</option>
                  <option value="Tomorrow">Tomorrow</option>
                </select>
              </div>
            </div>

            <FFButton
              type="submit"
              className="w-full"
              icon={<Send className="w-4 h-4" />}
              isLoading={isSending}
            >
              Send Campaign
            </FFButton>

            {isSuccess && (
              <div className="p-3 bg-success/10 text-success rounded-ff flex items-center gap-2 font-body text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Campaign launched successfully!
              </div>
            )}
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
                  <span className="font-body text-xs text-gray-400 ml-auto">now</span>
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

        {/* Recent Campaigns */}
        <div className="space-y-3">
          <FFSectionHeader
            icon={<Send className="w-[18px] h-[18px]" />}
            title="Recent Campaigns"
          />
          <FFCard className="p-4 flex items-center gap-3" hoverable>
            <div className="w-10 h-10 rounded-ff-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-primary truncate">
                Weekend Challenge!
              </p>
              <p className="font-body text-xs text-gray-400 mt-0.5">All users · 2 days ago</p>
            </div>
            <FFBadge variant="success">Sent</FFBadge>
          </FFCard>
        </div>

      </main>
    </div>
  );
};

export default NotificationCampaignScreen;
