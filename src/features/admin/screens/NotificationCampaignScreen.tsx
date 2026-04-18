import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Users, 
  Calendar, 
  MessageSquare, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminRepository } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const NotificationCampaignScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [campaign, setCampaign] = useState({
    title: '',
    body: '',
    targetRole: 'All',
    scheduledFor: 'Immediate'
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
    } catch (error) {
      console.error('Failed to send campaign', error);
    } finally {
      setIsSending(false);
    }
  };

  const roles = ['All', 'Parent', 'Child', 'Teacher', 'Elder'];

  return (
    <div className="min-h-screen bg-bg-cream pb-32">
      <header className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-black text-primary tracking-tight mb-1">Campaigns</h1>
            <p className="text-sm text-gray-400 font-medium">Send system-wide broadcasts and announcements</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-white rounded-2xl border border-black/5 text-gray-400 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Campaign Form */}
          <div className="lg:col-span-7">
            <FFCard className="p-8">
              <form onSubmit={handleSend} className="space-y-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Campaign Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. New Features Available!"
                    className="w-full px-5 py-4 bg-gray-50/50 border border-black/5 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-primary placeholder:text-gray-300"
                    value={campaign.title}
                    onChange={e => setCampaign({ ...campaign, title: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Message Body</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="What do you want to tell your users?"
                    className="w-full px-5 py-4 bg-gray-50/50 border border-black/5 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-primary placeholder:text-gray-300 resize-none"
                    value={campaign.body}
                    onChange={e => setCampaign({ ...campaign, body: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Target Audience</label>
                    <div className="relative">
                      <select 
                        className="w-full px-5 py-4 bg-gray-50/50 border border-black/5 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-primary appearance-none cursor-pointer"
                        value={campaign.targetRole}
                        onChange={e => setCampaign({ ...campaign, targetRole: e.target.value })}
                      >
                        {roles.map(role => <option key={role} value={role}>{role}s</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">Schedule</label>
                    <div className="relative">
                      <select 
                        className="w-full px-5 py-4 bg-gray-50/50 border border-black/5 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-primary appearance-none cursor-pointer"
                        value={campaign.scheduledFor}
                        onChange={e => setCampaign({ ...campaign, scheduledFor: e.target.value })}
                      >
                        <option value="Immediate">Immediate</option>
                        <option value="In 1 Hour">In 1 Hour</option>
                        <option value="Tomorrow">Tomorrow</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5">
                  <FFButton 
                    type="submit" 
                    className="w-full py-5 shadow-xl shadow-primary/20" 
                    icon={<Send size={20} />}
                    isLoading={isSending}
                  >
                    Launch Campaign
                  </FFButton>
                </div>

                {isSuccess && (
                  <div className="p-4 bg-success/10 text-success rounded-2xl flex items-center gap-3 font-bold text-sm">
                    <CheckCircle2 size={20} />
                    Campaign launched successfully!
                  </div>
                )}
              </form>
            </FFCard>
          </div>

          {/* Preview & History */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1 mb-6">Live Preview</h3>
              <div className="bg-black rounded-[48px] p-4 aspect-[9/16] max-w-[280px] mx-auto border-[10px] border-gray-900 shadow-2xl relative overflow-hidden">
                <div className="absolute top-12 left-3 right-3 bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-[10px] text-white font-black">FF</div>
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">FamilyFirst</span>
                    <span className="text-[9px] font-bold text-gray-400 ml-auto">now</span>
                  </div>
                  <h4 className="font-bold text-xs text-primary truncate leading-tight mb-1">{campaign.title || 'Notification Title'}</h4>
                  <p className="text-[11px] text-gray-600 leading-normal line-clamp-3 font-medium">{campaign.body || 'This is how your message will appear on user devices.'}</p>
                </div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-3xl" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-1.5 bg-white/20 rounded-full" />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Recent Campaigns</h3>
              <div className="space-y-3">
                <FFCard className="p-5 flex items-center gap-5 hover:border-primary/20 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                    <MessageSquare size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-primary">Weekend Challenge!</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Sent to All Users • 2 days ago</p>
                  </div>
                  <FFBadge variant="success" size="sm" className="opacity-80">Sent</FFBadge>
                </FFCard>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationCampaignScreen;
