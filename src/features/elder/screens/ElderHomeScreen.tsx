import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Calendar, 
  Settings, 
  Phone, 
  ChevronRight,
  MessageCircle,
  Star,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { ElderRepository, GrandchildStatus } from '../repositories/ElderRepository';
import { CalendarRepository, CalendarEvent } from '../../calendar/repositories/CalendarRepository';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';

const ElderHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [grandchildren, setGrandchildren] = useState<GrandchildStatus[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Elder font size setting (1.0, 1.3, 1.6)
  const fontSizeScale = localStorage.getItem('elderFontSize') || '1.3';
  const scale = parseFloat(fontSizeScale);

  const fetchData = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const [grandList, eventList] = await Promise.all([
        ElderRepository.getGrandchildren(user.familyId),
        CalendarRepository.getUpcomingEvents(user.familyId, 30)
      ]);
      setGrandchildren(grandList);
      setEvents(eventList.filter(e => e.visibilityScope.includes('Elder') || e.type === 'Birthday'));
    } catch (error) {
      console.error('Failed to fetch elder home data', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const familyScore = 78;

  return (
    <div className="min-h-screen bg-bg-cream pb-32" style={{ fontSize: `${16 * scale}px` }}>
      {/* Header */}
      <header className="p-8 lg:p-14 space-y-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <motion.div whileHover={{ scale: 1.05 }} className="relative">
                <FFAvatar name={user?.name || 'Elder'} size="xl" className="border-4 border-white shadow-2xl ring-1 ring-black/5" />
                <div className="absolute inset-0 rounded-full border border-black/5" />
              </motion.div>
              <div className="absolute -bottom-2 -right-2 bg-accent text-white p-2.5 rounded-xl shadow-lg border-2 border-white ring-1 ring-black/5">
                <Heart size={18} fill="currentColor" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-black text-primary tracking-tight leading-tight" style={{ fontSize: `${36 * scale}px` }}>
                Namaste, <span className="text-accent underline decoration-accent/10">{user?.name?.split(' ')[0]}</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Users size={14} className="text-gray-400" />
                <p className="font-bold text-gray-400 uppercase tracking-[0.2em]" style={{ fontSize: `${10 * scale}px` }}>
                  Family Guardian & Elder
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/elder/settings')}
            className="p-4 bg-white rounded-2xl border border-black/[0.03] text-gray-300 hover:text-primary transition-all shadow-sm group"
          >
            <Settings size={32} className="group-hover:rotate-45 transition-transform duration-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <FFCard className="bg-white/60 backdrop-blur-md p-8 rounded-[48px] border border-white/50 shadow-inner group overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Star size={120} fill="currentColor" />
             </div>
             <div className="relative z-10 flex items-center justify-between">
               <div>
                  <p className="font-bold text-gray-400 uppercase tracking-[0.3em] mb-2" style={{ fontSize: `${12 * scale}px` }}>Engagement Index</p>
                  <p className="font-display font-black text-primary tracking-tighter leading-none" style={{ fontSize: `${48 * scale}px` }}>{familyScore}</p>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-2xl border border-success/10 transition-transform group-hover:scale-110">
                 <Star size={24} fill="currentColor" />
                 <span className="font-black" style={{ fontSize: `${20 * scale}px` }}>+5</span>
               </div>
             </div>
           </FFCard>

           <FFCard className="bg-primary border-none shadow-2xl shadow-primary/20 p-8 rounded-[48px] relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10 flex flex-col justify-center h-full">
                <p className="font-bold text-white/40 uppercase tracking-[0.3em] mb-2" style={{ fontSize: `${12 * scale}px` }}>Legacy Pulse</p>
                <div className="flex items-baseline gap-2">
                   <h3 className="font-display font-bold text-white leading-none" style={{ fontSize: `${32 * scale}px` }}>Flourishing</h3>
                   <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_12px_rgba(45,106,79,0.8)]" />
                </div>
              </div>
           </FFCard>
        </div>
      </header>

      <main className="px-8 lg:px-14 space-y-12">
        {/* Grandchildren Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold uppercase tracking-[0.3em] text-gray-400" style={{ fontSize: `${14 * scale}px` }}>
              Nurturing My Lineage
            </h3>
            <div className="h-0.5 flex-1 bg-black/[0.03] mx-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {grandchildren.map(child => (
              <FFCard 
                key={child.id} 
                className="p-8 hover:shadow-2xl transition-all cursor-pointer group rounded-[48px] border-black/[0.02]"
                onClick={() => navigate(`/elder/appreciate/${child.id}`)}
              >
                <div className="flex items-center gap-8 mb-8">
                  <div className="relative">
                    <FFAvatar name={child.name} size="xl" className="w-24 h-24 border-4 border-white shadow-2xl" />
                    <div className="absolute -top-2 -right-2 bg-white text-accent p-2 rounded-xl shadow-lg border border-black/[0.05]">
                       <Heart size={20} fill="currentColor" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-display font-bold text-primary group-hover:text-accent transition-colors" style={{ fontSize: `${28 * scale}px` }}>{child.name}</h4>
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-accent/10 group-hover:text-accent transition-all">
                        <ChevronRight size={24} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FFBadge variant={child.status === 'Needs Help' ? 'alert' : 'success'} className="px-3 border-none">
                         <span className="font-bold text-[10px] uppercase tracking-widest">{child.status}</span>
                      </FFBadge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50/50 rounded-3xl border border-black/[0.02] shadow-inner">
                   <div className="text-center">
                      <p className="font-numbers font-bold text-primary mb-1" style={{ fontSize: `${32 * scale}px` }}>{child.tasksCompleted}</p>
                      <p className="font-bold text-gray-400 uppercase tracking-widest" style={{ fontSize: `${10 * scale}px` }}>Unit Milestones</p>
                   </div>
                   <div className="w-px h-12 bg-black/[0.05] mx-auto" />
                   <div className="text-center">
                      <p className="font-numbers font-bold text-accent mb-1" style={{ fontSize: `${32 * scale}px` }}>94%</p>
                      <p className="font-bold text-gray-400 uppercase tracking-widest" style={{ fontSize: `${10 * scale}px` }}>Consistency</p>
                   </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-5 bg-accent text-primary rounded-[32px] font-bold flex items-center justify-center gap-3 shadow-xl shadow-accent/20 group/btn"
                >
                  <Heart size={24} fill="currentColor" className="group-hover/btn:scale-125 transition-transform" />
                  <span style={{ fontSize: `${18 * scale}px` }}>Send Blessing</span>
                </motion.button>
              </FFCard>
            ))}
          </div>
        </section>

        {/* Family Events Section */}
        <section className="space-y-8 pb-12">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold uppercase tracking-[0.3em] text-gray-400" style={{ fontSize: `${14 * scale}px` }}>
              Legacy Timeline
            </h3>
            <button onClick={() => navigate('/calendar')} className="text-accent font-bold flex items-center gap-2 hover:translate-x-1 transition-transform" style={{ fontSize: `${14 * scale}px` }}>
              Chronicle Archives <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map(event => (
              <FFCard key={event.id} className="p-8 flex items-center gap-8 hover:bg-white transition-colors cursor-pointer border-black/[0.02] rounded-[48px]">
                <div className="w-20 h-20 bg-primary/5 rounded-[24px] border border-primary/10 flex flex-col items-center justify-center text-primary shrink-0 shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <span className="font-bold uppercase tracking-widest opacity-60" style={{ fontSize: `${11 * scale}px` }}>
                    {new Date(event.startDateTime).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="font-display font-bold leading-none mt-1" style={{ fontSize: `${32 * scale}px` }}>
                    {new Date(event.startDateTime).getDate()}
                  </span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-primary group-hover:text-accent transition-colors" style={{ fontSize: `${22 * scale}px` }}>{event.title}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar size={14} className="text-gray-300" />
                    <p className="font-bold text-gray-400 uppercase tracking-widest" style={{ fontSize: `${12 * scale}px` }}>
                      {event.isAllDay ? 'All Day Protocol' : new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </FFCard>
            ))}
          </div>
        </section>
      </main>

      {/* Emergency Call Button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.location.href = 'tel:112'}
          className="px-10 py-6 bg-alert text-white rounded-full shadow-2xl shadow-alert/40 flex items-center justify-center gap-4 border-4 border-white ring-1 ring-alert/10"
        >
          <Phone size={32} fill="currentColor" />
          <span className="font-display font-bold text-xl tracking-tight">SOS SIGNAL</span>
        </motion.button>
      </div>
    </div>
  );
};

export default ElderHomeScreen;
