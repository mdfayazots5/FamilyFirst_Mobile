import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  List,
  Filter,
  Search,
  MoreVertical,
  Clock,
  Sparkles,
  MapPin,
  Users,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../../core/auth/AuthContext';
import { CalendarRepository, CalendarEvent } from '../repositories/CalendarRepository';
import CalendarEventTile from '../widgets/CalendarEventTile';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const FamilyCalendarScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'list'>(user?.role === UserRole.ELDER ? 'list' : 'month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await CalendarRepository.getEvents(user.familyId, '', '');
      
      // Role-based filtering
      let filtered = data;
      if (user.role === UserRole.CHILD) {
        filtered = data.filter(e => e.visibilityScope.includes('Child'));
      } else if (user.role === UserRole.ELDER) {
        filtered = data.filter(e => e.visibilityScope.includes('Elder') || e.type === 'Birthday');
      }
      
      setEvents(filtered);
    } catch (error) {
      console.error('Failed to fetch calendar events', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId, user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-black/[0.03] bg-gray-50/20" />);
    }

    // Days of current month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.startDateTime.startsWith(dateStr));
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div 
          key={day} 
          className={`h-36 border-b border-r border-black/[0.03] p-4 relative group hover:bg-white transition-all cursor-pointer overflow-hidden`}
          onClick={() => {
            if (dayEvents.length > 0) setViewMode('list');
          }}
        >
          {isToday && (
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 rounded-bl-[24px] flex items-center justify-center text-primary">
               <Zap size={10} fill="currentColor" />
            </div>
          )}
          <div className="flex justify-between items-start relative z-10">
            <span className={`text-[13px] font-display font-black tracking-tighter tabular-nums ${isToday ? 'bg-primary text-white w-8 h-8 flex items-center justify-center rounded-xl shadow-xl shadow-primary/20' : 'text-primary/40'}`}>
              {day.toString().padStart(2, '0')}
            </span>
            {dayEvents.length > 0 && (
              <div className="w-2 h-2 rounded-full bg-accent shadow-glow transition-all group-hover:scale-150" />
            )}
          </div>
          
          <div className="mt-4 space-y-1.5 relative z-10">
            {dayEvents.slice(0, 2).map(event => (
              <div 
                key={event.id}
                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest truncate border shadow-sm ${getCategoryStyles(event.type)}`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[9px] font-black text-gray-300 pl-1 uppercase italic tracking-widest">+{dayEvents.length - 2} STATUS_NODES</div>
            )}
          </div>
          <div className="absolute inset-0 bg-primary/[0.02] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </div>
      );
    }

    return (
      <div className="bg-white/50 backdrop-blur-3xl rounded-[48px] border border-black/[0.03] overflow-hidden shadow-3xl shadow-primary/5 relative">
        {/* Massive Vertical Label */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gray-50 flex items-center justify-center border-r border-black/[0.03] z-10">
          <span className="writing-mode-vertical-rl rotate-180 text-[10px] font-black text-gray-300 uppercase tracking-[0.8em] italic">
            CYCLE_TIMELINE_v4.4.2
          </span>
        </div>

        <div className="pl-16">
          <div className="grid grid-cols-7 border-b border-black/[0.03] bg-white/50">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
              <div key={d} className="py-6 text-center text-[10px] font-black text-primary/30 tracking-[0.4em] italic">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 bg-white/20">
            {days}
          </div>
        </div>
      </div>
    );
  };

  const getCategoryStyles = (type: string) => {
    switch (type) {
      case 'DoctorAppointment': return 'bg-red-50 border-red-100 text-red-600';
      case 'SchoolEvent': return 'bg-blue-50 border-blue-100 text-blue-600';
      case 'Tuition': return 'bg-purple-50 border-purple-100 text-purple-600';
      case 'Birthday': return 'bg-amber-50 border-amber-100 text-amber-600';
      case 'Medicine': return 'bg-green-50 border-green-100 text-green-600';
      case 'Exam': return 'bg-orange-50 border-orange-100 text-orange-600';
      case 'FamilyTravel': return 'bg-teal-50 border-teal-100 text-teal-600';
      default: return 'bg-gray-50 border-gray-100 text-gray-600';
    }
  };

  const renderListView = () => {
    if (events.length === 0) {
      return (
        <FFEmptyState 
          title="Clear Horizons"
          message="No scheduled protocol or family events found for this cycle."
          icon={<CalendarIcon size={48} className="text-gray-200" />}
          actionLabel={user?.role === UserRole.PARENT ? "Dispatch Event" : undefined}
          onAction={user?.role === UserRole.PARENT ? () => navigate('/calendar/create') : undefined}
        />
      );
    }

    // Group events by date
    const grouped: { [key: string]: CalendarEvent[] } = {};
    events.forEach(event => {
      const date = event.startDateTime.split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(event);
    });

    const sortedDates = Object.keys(grouped).sort();

    return (
      <div className="space-y-16 max-w-4xl mx-auto">
        {sortedDates.map(date => (
          <div key={date} className="relative pl-32 sm:pl-48">
            {/* Timeline Marker */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent ml-[5rem] sm:ml-[8rem]" />
            
            <div className="absolute left-0 top-2 flex flex-col items-center w-24 sm:w-32">
              <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4 italic leading-none">
                {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
              </span>
              <span className="text-6xl sm:text-8xl font-display font-black text-primary leading-none italic tracking-tighter tabular-nums drop-shadow-sm">
                {new Date(date).getDate().toString().padStart(2, '0')}
              </span>
              <div className="mt-4 w-2 h-2 rounded-full bg-primary/20" />
            </div>

            <div className="space-y-6">
              {grouped[date].map(event => (
                <CalendarEventTile 
                  key={event.id} 
                  event={event} 
                  onClick={() => navigate(`/calendar/event/${event.id}`)} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary shadow-inner relative group overflow-hidden">
               <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <Sparkles size={36} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-3">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">STRATEGIC_TIMELINE</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">FAMILY_COORDINATION_ARRAY</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex bg-gray-50 p-2 rounded-3xl border border-black/[0.03] shadow-inner">
              <button 
                onClick={() => setViewMode('month')}
                className={`px-8 h-12 rounded-2xl transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic ${viewMode === 'month' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-400 hover:text-primary'}`}
              >
                <CalendarIcon size={14} /> GRID_ARRAY
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-8 h-12 rounded-2xl transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest italic ${viewMode === 'list' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-400 hover:text-primary'}`}
              >
                <List size={14} /> TACTICAL_FEED
              </button>
            </div>

            <div className="flex items-center p-2 bg-white rounded-3xl border border-black/5 shadow-sm">
              <button onClick={prevMonth} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-primary transition-all hover:scale-110 active:scale-90"><ChevronLeft size={24} /></button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="text-[11px] font-black text-primary uppercase tracking-[0.2em] px-6 border-x border-black/5 italic tabular-nums"
              >
                NOW_{new Date().getDate().toString().padStart(2, '0')}
              </button>
              <button onClick={nextMonth} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-primary transition-all hover:scale-110 active:scale-90"><ChevronRight size={24} /></button>
            </div>

            {user?.role === UserRole.PARENT && (
              <button 
                onClick={() => navigate('/calendar/create')}
                className="w-16 h-16 bg-primary text-white rounded-[24px] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
              >
                <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14">
        {isLoading ? (
          <div className="grid grid-cols-7 gap-px opacity-50 pointer-events-none grayscale animate-pulse">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode + currentDate.toISOString()}
              initial={{ opacity: 0, scale: 0.98, Filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, Filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, Filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {viewMode === 'month' ? renderMonthView() : renderListView()}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Category Legend */}
        <div className="mt-24 flex flex-wrap gap-12 justify-center opacity-40">
          {[
            { label: 'HEALTH_SIGNAL', color: 'bg-red-500' },
            { label: 'EDUCATION_ACQUISITION', color: 'bg-blue-500' },
            { label: 'MILESTONE_VERIFIED', color: 'bg-amber-500' },
            { label: 'FAMILY_COORDINATION', color: 'bg-teal-500' },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${c.color} shadow-lg shadow-current/20`} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">{c.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default FamilyCalendarScreen;
