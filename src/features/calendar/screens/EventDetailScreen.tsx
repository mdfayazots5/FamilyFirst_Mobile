import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Clock, 
  MapPin, 
  Users, 
  Bell, 
  Repeat,
  Calendar as CalendarIcon,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, UserRole } from '../../../core/auth/AuthContext';
import { CalendarRepository, CalendarEvent } from '../repositories/CalendarRepository';
import { getEventColor } from '../widgets/CalendarEventTile';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';

const EventDetailScreen: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!user?.familyId || !eventId) return;
      try {
        const events = await CalendarRepository.getEvents(user.familyId, '', '');
        const detail = events.find(e => e.id === eventId);
        setEvent(detail || null);
      } catch (error) {
        console.error('Failed to fetch event detail', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [user?.familyId, eventId]);

  const handleDelete = async () => {
    if (!user?.familyId || !eventId) return;
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    setIsDeleting(true);
    try {
      await CalendarRepository.deleteEvent(user.familyId, eventId);
      navigate('/calendar');
    } catch (error) {
      console.error('Failed to delete event', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center text-gray-400">Loading event...</div>;
  if (!event) return <div className="p-6 text-center text-gray-400">Event not found.</div>;

  const config = getEventColor(event.type);
  const startDate = new Date(event.startDateTime);
  const endDate = new Date(event.endDateTime);

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">MISSION_DEBRIEF</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">COORDINATION_LOG_v1.2.0</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Operation Details
              </h1>
            </div>
          </div>

          {user?.role === UserRole.PARENT && (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate(`/calendar/edit/${event.id}`)}
                className="h-16 px-8 bg-primary/5 text-primary rounded-[24px] hover:bg-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest italic flex items-center gap-4"
              >
                <Edit2 size={20} /> EDIT_PARAMETERS
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-16 h-16 bg-alert/5 text-alert rounded-[24px] hover:bg-alert hover:text-white transition-all disabled:opacity-50 flex items-center justify-center group"
              >
                <Trash2 size={24} className="group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 lg:p-14 pt-16 space-y-24">
        <FFCard className={`p-12 lg:p-20 text-center space-y-8 border-4 shadow-3xl shadow-black/[0.01] rounded-[64px] relative overflow-hidden group ${config.border} ${config.bg}`}>
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
             {React.cloneElement(config.icon as React.ReactElement, { size: 240 })}
          </div>
          
          <div className={`w-32 h-32 bg-white rounded-[40px] flex items-center justify-center mx-auto shadow-3xl shadow-black/[0.02] border border-black/[0.01] relative z-10 transition-transform group-hover:rotate-12 ${config.text}`}>
            {React.cloneElement(config.icon as React.ReactElement, { size: 64 })}
          </div>
          <div className="relative z-10">
            <h2 className="text-5xl lg:text-7xl font-display font-black text-primary leading-none uppercase italic tracking-tighter mb-6">{event.title}</h2>
            <div className="flex items-center justify-center gap-4">
              <FFBadge variant="primary" size="lg" className="font-black px-6 py-2 uppercase italic tracking-widest italic rounded-xl">{event.type.replace(/([A-Z])/g, '_$1').toUpperCase()}</FFBadge>
              {event.isRecurring && <FFBadge variant="accent" size="lg" className="font-black px-6 py-2 uppercase italic tracking-widest italic rounded-xl">RECURRING_SYNC</FFBadge>}
            </div>
          </div>
        </FFCard>

        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <CalendarIcon size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">TEMPORAL_LOCUS</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          
          <FFCard className="p-12 sm:p-16 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] space-y-12 divide-y divide-black/[0.03]">
            <div className="flex items-start gap-10 pb-12">
              <div className="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center text-primary shrink-0 shadow-inner group transition-colors hover:bg-primary/5">
                <Clock size={32} className="group-hover:rotate-12 transition-transform" />
              </div>
              <div className="pt-2">
                <p className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-tight mb-2">
                  {startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </p>
                <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.4em] italic leading-none">
                     {event.isAllDay ? 'PROTOCOL_ALL_DAY' : `T_UNIT [ ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ]`}
                   </p>
                </div>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-10 pt-12">
                <div className="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center text-red-400 shrink-0 shadow-inner group transition-colors hover:bg-red-50">
                  <MapPin size={32} className="group-hover:translate-y-[-4px] transition-transform" />
                </div>
                <div className="pt-2">
                  <p className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-tight mb-2">{event.location.toUpperCase()}</p>
                  <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.4em] italic leading-none">COORDINATE_VECTOR</p>
                </div>
              </div>
            )}
          </FFCard>
        </section>

        {event.description && (
          <section className="space-y-12">
            <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                 <AlertCircle size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">BRIEFING_NOTES</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>
            <FFCard className="p-12 lg:p-16 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] relative overflow-hidden group">
               <div className="absolute right-0 bottom-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-[3000ms]">
                  <AlertCircle size={180} />
               </div>
               <p className="text-2xl text-primary font-display font-medium italic leading-relaxed relative z-10 first-letter:text-4xl first-letter:font-black first-letter:text-accent">
                {event.description}
               </p>
            </FFCard>
          </section>
        )}

        <section className="space-y-12">
          <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Bell size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">SIGNAL_PROTOCOLS</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>
          <FFCard className="p-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] divide-y divide-black/5">
            <div className="py-8 first:pt-0 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors hover:rotate-6 transition-transform">
                  <Users size={24} />
                </div>
                <div>
                   <span className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter">Visibility</span>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">GRID_DISTRIBUTION_ARRAY</p>
                </div>
              </div>
              <div className="flex gap-2">
                {event.visibilityScope.map(role => (
                  <FFBadge key={role} variant="gray" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none rounded-lg">{role}</FFBadge>
                ))}
              </div>
            </div>

            <div className="py-8 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-accent transition-colors hover:rotate-6 transition-transform">
                  <Bell size={24} />
                </div>
                <div>
                   <span className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter">Reminders</span>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">SYNC_ALERT_INTERVALS</p>
                </div>
              </div>
              <div className="flex gap-2">
                {event.reminders.map(rem => (
                  <FFBadge key={rem} variant="accent" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none rounded-lg italic">{rem.toUpperCase()}</FFBadge>
                ))}
              </div>
            </div>

            {event.isRecurring && (
              <div className="py-8 last:pb-0 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-primary transition-colors hover:rotate-6 transition-transform">
                    <Repeat size={24} />
                  </div>
                  <div>
                    <span className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-1">Recurrence</span>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic leading-none">AUTONOMO_SYNC_PATTERN</p>
                  </div>
                </div>
                <span className="text-2xl font-display font-black text-primary uppercase tracking-[0.2em] italic tabular-nums">
                  {event.recurrenceRule?.toUpperCase() || 'WEEKLY_SYNC'}
                </span>
              </div>
            )}
          </FFCard>
        </section>

        {event.type === 'Birthday' && (
          <div className="p-10 bg-amber-50/50 rounded-[40px] border border-amber-100 flex gap-8 items-start relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-[0.03] translate-x-4 translate-y-4 group-hover:scale-125 transition-transform duration-1000">
               <AlertCircle size={100} />
            </div>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-xl shrink-0">
               <AlertCircle size={28} />
            </div>
            <div className="space-y-4 relative z-10">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] italic leading-none">SYSTEM_LOCKED_RESOURCE</p>
              <p className="text-lg text-amber-900 font-display font-medium italic leading-relaxed">
                This is a system-generated birthday event. It cannot be edited or deleted to preserve station chronological integrity.
              </p>
            </div>
          </div>
        )}

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <CalendarIcon size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Strategic Debrief Matrix v4.4.2</p>
        </footer>
      </main>
    </div>
  );
};

export default EventDetailScreen;
