import React from 'react';
import { Calendar, Stethoscope, BookOpen, Users, Clock, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '../repositories/DashboardRepository';
import FFCard from '../../../shared/components/FFCard';

interface EventsPreviewProps {
  events: CalendarEvent[];
}

const EventsPreview: React.FC<EventsPreviewProps> = ({ events }) => {
  const getIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'MEDICAL': return <Stethoscope size={16} />;
      case 'EDUCATION': return <BookOpen size={16} />;
      case 'SOCIAL': return <Users size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  return (
    <FFCard 
      title="Today's Ops" 
      icon={<Calendar size={20} />}
      className="p-8"
    >
      <div className="space-y-6">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 opacity-30">
            <Clock size={32} strokeWidth={1} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-center">No active protocols</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-black/[0.02]">
                  {getIcon(event.type)}
                </div>
                <div>
                  <h4 className="text-base font-display font-bold text-primary mb-1 group-hover:text-accent transition-colors">{event.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-numbers tracking-tight">
                    <Clock size={12} className="text-accent" />
                    <span className="font-bold uppercase tracking-widest opacity-60">Schedule:</span>
                    <span className="text-primary font-medium">{event.time}</span>
                  </div>
                </div>
              </div>
              <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:bg-primary/5 hover:text-accent transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </FFCard>
  );
};

export default EventsPreview;
