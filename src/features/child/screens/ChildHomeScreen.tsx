import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  ShieldAlert, 
  RefreshCw, 
  ChevronRight,
  Clock,
  Star,
  Trophy,
  Settings,
  Sparkles,
  Zap,
  Target,
  Rocket,
  ArrowRight,
  Activity,
  Layers,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { TaskCompletionRepository, TaskCompletion } from '../repositories/TaskCompletionRepository';
import ProgressRing from '../widgets/ProgressRing';
import TaskListItem from '../widgets/TaskListItem';
import FFCard from '../../../shared/components/FFCard';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';

import { useLocalNotifications } from '../../../core/notifications/LocalNotificationService';
import { NotificationType } from '../../../core/notifications/NotificationPayloadHandler';

const ChildHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useLocalNotifications();

  const simulateNotification = (type: NotificationType, priority: 'normal' | 'urgent' | 'birthday' = 'normal') => {
    const titles: Record<string, string> = {
      [NotificationType.RewardApproved]: 'Reward Approved! 🎉',
      [NotificationType.Appreciation]: 'Family Love ❤️',
      [NotificationType.Birthday]: 'Happy Birthday! 🎂',
    };

    const bodies: Record<string, string> = {
      [NotificationType.RewardApproved]: 'Your parent approved "Extra Screen Time". Enjoy!',
      [NotificationType.Appreciation]: 'Grandma sent you a special appreciation note.',
      [NotificationType.Birthday]: 'Wishing you a day full of fun and surprises!',
    };

    showNotification({
      title: titles[type] || 'New Notification',
      body: bodies[type] || 'You have a new update.',
      priority,
      payload: {
        type,
        rewardName: 'Extra Screen Time',
        memberName: 'Grandma'
      }
    });
  };

  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyTimer, setEmergencyTimer] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!user?.familyId || !user?.id) return;
    setIsRefreshing(true);
    try {
      const data = await TaskCompletionRepository.getCompletions(
        user.familyId, 
        user.id, 
        new Date().toISOString().split('T')[0]
      );
      setCompletions(data);
    } catch (error) {
      console.error('Failed to fetch child day data', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.familyId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEmergencyStart = () => {
    const timer = setTimeout(() => {
      setEmergencyActive(true);
      alert('EMERGENCY ALERT SENT TO PARENTS!');
    }, 2000);
    setEmergencyTimer(timer);
  };

  const handleEmergencyEnd = () => {
    if (emergencyTimer) clearTimeout(emergencyTimer);
    setEmergencyActive(false);
  };

  const completedCount = completions.filter(c => c.status === 'approved').length;
  const totalCount = completions.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const timeBlocks = ['Morning', 'Evening', 'Night'];

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-40">
      {/* High-Tech Dynamic Header */}
      <header className="bg-white/90 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
              <FFAvatar name={user?.name || 'Child'} size="xl" className="border-4 border-white shadow-2xl relative z-10" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg z-20">
                <Zap size={16} fill="white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5">UNIT_ID: {user?.id?.slice(0, 6).toUpperCase()}</FFBadge>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Live_Deployment: Enforced</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Active Protocol
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/child/settings')}
              className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-gray-300 hover:text-primary shadow-sm border border-black/[0.03] transition-all active:scale-90"
            >
              <Settings size={28} />
            </button>
            <button 
              onClick={fetchData}
              className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-primary shadow-sm border border-black/[0.03] transition-all active:scale-90 group"
            >
              <RefreshCw size={28} className={isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 space-y-20">
        {/* Status Hub: Real-Time Trajectory */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-center bg-primary p-16 rounded-[64px] text-white overflow-hidden relative shadow-2xl shadow-primary/30 group">
          <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000 -rotate-12 translate-x-16 pointer-events-none">
            <Rocket size={480} strokeWidth={1} fill="white" />
          </div>

          <div className="relative z-10 space-y-12 text-center xl:text-left">
            <div>
              <div className="flex items-center justify-center xl:justify-start gap-3 mb-6">
                 <Activity size={20} className="text-accent" />
                 <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-white/40 italic">CURRENT_TRAJECTORY</h2>
              </div>
              <p className="text-5xl md:text-7xl font-display font-black italic tracking-tighter leading-none uppercase">
                {progress === 100 ? "Mission_Accomplished" : progress > 50 ? "Approaching_Target" : "Initializing_Day"}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-8">
              <div 
                className="group/stat cursor-pointer bg-white/5 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl hover:bg-white/10 transition-all shadow-inner"
                onClick={() => navigate('/child/coins')}
              >
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center text-amber-400">
                      <Star size={24} fill="currentColor" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic text-left leading-none">ASSET_BALANCE</p>
                </div>
                <div className="text-5xl font-display font-black italic tracking-tighter">340.00</div>
              </div>

              <div 
                className="group/stat cursor-pointer bg-white/5 p-8 rounded-[40px] border border-white/5 backdrop-blur-xl hover:bg-white/10 transition-all shadow-inner"
                onClick={() => navigate('/child/scores')}
              >
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                      <Trophy size={24} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic text-left leading-none">DAILY_STREAK</p>
                </div>
                <div className="text-5xl font-display font-black italic tracking-tighter text-accent">08_DAYS</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-center">
            <div className="relative group/ring">
               <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-110 group-hover/ring:scale-125 transition-transform duration-1000" />
               <ProgressRing 
                 progress={progress} 
                 label={`${completedCount}/${totalCount}`}
                 subLabel="OBJECTIVES"
                 size={320}
                 strokeWidth={32}
               />
            </div>
          </div>
        </section>

        {/* Phase-Based Execution Blocks */}
        <div className="space-y-24">
          {timeBlocks.map((block, index) => {
            const blockTasks = completions.filter(c => c.timeBlock === block);
            if (blockTasks.length === 0) return null;

            return (
              <motion.section 
                key={block} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-[18px] bg-primary/5 flex items-center justify-center text-primary">
                     <Layers size={24} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">{block}_PHASE</h3>
                  <div className="h-px flex-1 bg-primary/10" />
                  <div className="flex items-center gap-3">
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">
                        {blockTasks.filter(t => t.status === 'approved').length} // {blockTasks.length} LOADED
                     </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blockTasks.map(task => (
                    <TaskListItem 
                      key={task.id} 
                      task={task} 
                      onClick={() => navigate(`/child/tasks/${task.id}`)} 
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      </main>

      {/* Control Simulation Panel */}
      <section className="max-w-7xl mx-auto px-8 lg:px-14 py-24 border-t border-black/[0.03]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Cpu size={24} className="text-primary opacity-20" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/30 italic">SIMULATION_CONTROL_UNIT</h2>
              </div>
              <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase italic">Execute mock signals to test neural response</p>
           </div>
           
           <div className="flex flex-wrap gap-4">
              {[
                { label: 'REWARD_SYNC', type: NotificationType.RewardApproved, priority: 'normal', color: 'bg-primary' },
                { label: 'LOVE_SIGNAL', type: NotificationType.Appreciation, priority: 'normal', color: 'bg-accent' },
                { label: 'ANNUAL_EVENT', type: NotificationType.Birthday, priority: 'birthday', color: 'bg-amber-400' }
              ].map(sim => (
                <button 
                  key={sim.label}
                  onClick={() => simulateNotification(sim.type, sim.priority as any)}
                  className={`px-8 h-16 rounded-[24px] bg-white border border-black/5 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic hover:text-white hover:border-transparent hover:${sim.color} transition-all shadow-xl shadow-black/[0.02] flex items-center gap-3 active:scale-95 group`}
                >
                  <Fingerprint size={16} className="opacity-40 group-hover:opacity-100" />
                  {sim.label}
                </button>
              ))}
           </div>
        </div>
      </section>

      {/* Emergency Distress Protocol */}
      <div className="fixed bottom-12 left-12 z-[50]">
        <motion.button
          onMouseDown={handleEmergencyStart}
          onMouseUp={handleEmergencyEnd}
          onTouchStart={handleEmergencyStart}
          onTouchEnd={handleEmergencyEnd}
          animate={emergencyActive ? { scale: 1.2, backgroundColor: '#dc2626' } : { scale: 1 }}
          className="w-20 h-20 bg-white border-2 border-red-50 text-alert rounded-[32px] shadow-2xl shadow-alert/30 flex items-center justify-center transition-all duration-300 group relative active:scale-90"
        >
          <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
          <ShieldAlert size={36} strokeWidth={2.5} className="group-active:animate-ping relative z-10" />
          
          <AnimatePresence>
            {emergencyActive && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 28 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute left-full whitespace-nowrap bg-red-600 text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
              >
                <Activity size={12} className="animate-pulse" />
                SOS_BROADCAST_ACTIVE
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

       <footer className="text-center space-y-4 py-24 px-8">
         <div className="flex items-center justify-center gap-4 text-primary/10">
            <div className="h-px w-12 bg-current" />
            <Target size={20} />
            <div className="h-px w-12 bg-current" />
         </div>
         <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em]">COMMAND_ENGINE // FamilyFirst Strategic Operating System v2.1.0</p>
      </footer>
    </div>
  );
};

export default ChildHomeScreen;
