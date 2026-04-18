import React from 'react';
import { motion } from 'motion/react';
import { CalendarEvent, EventType } from '../repositories/CalendarRepository';
import { 
  Stethoscope, 
  School, 
  BookOpen, 
  Cake, 
  Pill, 
  FileText, 
  MapPin,
  Clock,
  ChevronRight
} from 'lucide-react';

interface CalendarEventTileProps {
  event: CalendarEvent;
  onClick: () => void;
  variant?: 'compact' | 'full';
}

export const getEventColor = (type: EventType) => {
  switch (type) {
    case 'DoctorAppointment': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: <Stethoscope size={16} /> };
    case 'SchoolEvent': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: <School size={16} /> };
    case 'Tuition': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', icon: <BookOpen size={16} /> };
    case 'Birthday': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: <Cake size={16} /> };
    case 'Medicine': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', icon: <Pill size={16} /> };
    case 'Exam': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: <FileText size={16} /> };
    case 'FamilyTravel': return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100', icon: <MapPin size={16} /> };
    default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100', icon: <Clock size={16} /> };
  }
};

const CalendarEventTile: React.FC<CalendarEventTileProps> = ({ event, onClick, variant = 'full' }) => {
  const config = getEventColor(event.type);
  const startTime = new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (variant === 'compact') {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`flex items-center gap-2 p-2 rounded-lg border ${config.bg} ${config.border} cursor-pointer`}
      >
        <div className={config.text}>{config.icon}</div>
        <span className={`text-[10px] font-bold truncate ${config.text}`}>{event.title}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ x: 8 }}
      onClick={onClick}
      className={`p-6 sm:p-8 rounded-[32px] border-2 ${config.bg} ${config.border} cursor-pointer group hover:shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
        {React.cloneElement(config.icon as React.ReactElement, { size: 100 })}
      </div>

      <div className="flex items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-[20px] bg-white shadow-3xl shadow-black/[0.02] flex items-center justify-center ${config.text} group-hover:scale-110 transition-transform duration-500`}>
            {React.cloneElement(config.icon as React.ReactElement, { size: 28 })}
          </div>
          <div>
            <h4 className="font-display font-black text-primary text-2xl uppercase italic tracking-tighter group-hover:text-accent transition-colors leading-none mb-3">{event.title}</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <Clock size={12} className="text-gray-300" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic tabular-nums leading-none">
                   {event.isAllDay ? 'PROTOCOL_ALL_DAY' : `T_SYNC_${startTime}`}
                 </span>
              </div>
              {event.isRecurring && (
                <>
                  <div className="w-1 h-1 rounded-full bg-gray-200" />
                  <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] italic leading-none">STATION_RECURRING</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {event.visibilityScope.map((role, i) => (
              <div 
                key={role} 
                className="w-10 h-10 rounded-[14px] bg-white border border-black/5 flex items-center justify-center text-[10px] font-black text-primary uppercase shadow-sm relative ring-4 ring-white group-hover:translate-x-1 transition-transform"
                title={role}
              >
                {role[0]}
              </div>
            ))}
          </div>
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-200 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
             <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarEventTile;
