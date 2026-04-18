import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Save,
  ChevronRight,
  User,
  Check,
  Zap,
  Activity,
  Radio,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  Send,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

interface NotificationRule {
  id: string;
  event: string;
  recipients: string[];
  channels: ('push' | 'sms' | 'email')[];
}

const NotificationRulesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const roles = ['PARENT', 'CHILD', 'TEACHER', 'ELDER'];
  const channels = [
    { id: 'push', icon: <Smartphone size={20} />, label: 'Push_Notify', color: 'bg-primary' },
    { id: 'sms', icon: <MessageSquare size={20} />, label: 'SMS_Direct', color: 'bg-accent' },
    { id: 'email', icon: <Mail size={20} />, label: 'SMTP_Gateway', color: 'bg-alert' },
  ];

  const [rules, setRules] = useState<NotificationRule[]>([
    { id: '1', event: 'ATTENDANCE_ABSENT', recipients: ['PARENT'], channels: ['push', 'sms'] },
    { id: '2', event: 'TEACHER_FEEDBACK_SIGNAL', recipients: ['PARENT'], channels: ['push'] },
    { id: '3', event: 'TASK_EXECUTION_COMPLETED', recipients: ['PARENT'], channels: ['push'] },
    { id: '4', event: 'ASSET_CLAIMED_SUCCESS', recipients: ['PARENT'], channels: ['push', 'email'] },
    { id: '5', event: 'EMERGENCY_SOS_ALERT', recipients: ['PARENT', 'ELDER'], channels: ['push', 'sms'] },
    { id: '6', event: 'WEEKLY_ANALYTIC_DEBRIEF', recipients: ['PARENT'], channels: ['email'] },
  ]);

  const toggleRecipient = (ruleId: string, role: string) => {
    setRules(prev => prev.map(rule => {
      if (rule.id !== ruleId) return rule;
      const exists = rule.recipients.includes(role);
      return {
        ...rule,
        recipients: exists 
          ? rule.recipients.filter(r => r !== role)
          : [...rule.recipients, role]
      };
    }));
  };

  const toggleChannel = (ruleId: string, channel: 'push' | 'sms' | 'email') => {
    setRules(prev => prev.map(rule => {
      if (rule.id !== ruleId) return rule;
      const exists = rule.channels.includes(channel);
      return {
        ...rule,
        channels: exists 
          ? rule.channels.filter(c => c !== channel)
          : [...rule.channels, channel]
      };
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* High-Command Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <Radio size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">SIGNAL_ROUTING</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">ALERT_DISPATCH_LOGIC</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Alert Matrix
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <FFButton 
              size="lg" 
              icon={<Save size={24} />} 
              onClick={handleSave}
              isLoading={isSaving}
              className="px-10 h-16 rounded-[24px] shadow-2xl shadow-primary/20"
            >
              COMMIT_PROTOCOLS
            </FFButton>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 pt-16 space-y-24">
        {/* Signal Overview */}
        <section className="bg-primary p-12 lg:p-20 rounded-[56px] text-white overflow-hidden relative shadow-3xl shadow-primary/30 group">
          <div className="absolute top-0 right-0 p-20 opacity-[0.05] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-[3000ms]">
            <Wifi size={400} />
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="space-y-6 max-w-lg">
              <FFBadge variant="accent" size="sm" className="font-black px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl">BROADCAST_STATUS</FFBadge>
              <h2 className="text-4xl lg:text-6xl font-display font-black italic tracking-tighter leading-tight drop-shadow-2xl uppercase">Gateways_Online</h2>
              <p className="text-white/40 text-lg italic leading-relaxed font-medium">Configure deep-signal dispatch rules for critical family events. Emergency overrides will bypass standard quiet protocols.</p>
            </div>
            
            <div className="flex gap-12 lg:gap-24">
               <div className="text-center">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 mb-3 italic">LATENCY</p>
                  <h4 className="text-5xl font-display font-black italic">0.04ms</h4>
               </div>
               <div className="text-center">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 mb-3 italic">DELIVERY_RATE</p>
                  <h4 className="text-5xl font-display font-black italic text-success">100%</h4>
               </div>
            </div>
          </div>
        </section>

        {/* Rule Grid */}
        <section className="space-y-12">
           <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Target size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">EVENT_ROUTING_TABLE</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 gap-10">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FFCard className="p-10 border-none bg-white shadow-3xl shadow-black/[0.01] rounded-[48px] overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Activity size={120} strokeWidth={1} />
                  </div>
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                    <div className="space-y-10 flex-1">
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${rule.event.includes('SOS') ? 'bg-alert animate-pulse' : 'bg-primary'}`}>
                             {rule.event.includes('SOS') ? <AlertTriangle size={24} /> : <Radio size={24} />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none mb-3">TRIGGER_IDENTIFIER</p>
                            <h3 className="text-2xl lg:text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none group-hover:text-success transition-colors">{rule.event}</h3>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic ml-1">AUTHORIZED_RECEIVERS</p>
                          <div className="flex flex-wrap gap-3">
                            {roles.map(role => (
                              <button
                                key={role}
                                onClick={() => toggleRecipient(rule.id, role)}
                                className={`px-6 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all border-2 italic ${
                                  rule.recipients.includes(role)
                                    ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-105'
                                    : 'bg-white text-gray-400 border-black/5 hover:border-primary/20'
                                }`}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                       </div>
                    </div>

                    <div className="lg:w-80 space-y-4 lg:pl-12 lg:border-l border-black/[0.03]">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic ml-1">DISPATCH_MODES</p>
                        <div className="flex gap-4">
                          {channels.map(channel => {
                            const isActive = rule.channels.includes(channel.id as any);
                            return (
                              <button
                                key={channel.id}
                                onClick={() => toggleChannel(rule.id, channel.id as any)}
                                className={`flex-1 aspect-square rounded-[28px] flex flex-col items-center justify-center gap-2 transition-all border-2 shadow-sm ${
                                  isActive
                                    ? `${channel.color} text-white border-transparent shadow-2xl scale-110`
                                    : 'bg-white text-gray-300 border-black/5 hover:border-gray-200'
                                }`}
                              >
                                <div className={isActive ? 'animate-bounce' : ''}>{channel.icon}</div>
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${isActive ? 'opacity-100' : 'opacity-40'}`}>{channel.id}</span>
                              </button>
                            );
                          })}
                        </div>
                    </div>
                  </div>
                </FFCard>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="text-center py-24 space-y-6">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.8em] italic opacity-40 leading-relaxed">STATION_ENGINE // Dispatch Logistics v4.4.2</p>
        </footer>
      </main>
    </div>
  );
};

export default NotificationRulesScreen;

