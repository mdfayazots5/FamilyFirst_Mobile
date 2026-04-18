import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  Bell, 
  Repeat,
  MapPin,
  Type
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { CalendarRepository, CalendarEvent, EventType } from '../repositories/CalendarRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';

const CreateEventScreen: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'FamilyTravel',
    startDateTime: new Date().toISOString().slice(0, 16),
    endDateTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    isAllDay: false,
    visibilityScope: ['Family'],
    isRecurring: false,
    reminders: ['1hr'],
    description: '',
    location: ''
  });

  useEffect(() => {
    if (eventId && eventId !== 'create') {
      const fetchEvent = async () => {
        if (!user?.familyId) return;
        try {
          const events = await CalendarRepository.getEvents(user.familyId, '', '');
          const event = events.find(e => e.id === eventId);
          if (event) {
            setFormData({
              ...event,
              startDateTime: event.startDateTime.slice(0, 16),
              endDateTime: event.endDateTime.slice(0, 16)
            });
          }
        } catch (error) {
          console.error('Failed to fetch event', error);
        }
      };
      fetchEvent();
    }
  }, [eventId, user?.familyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      if (eventId && eventId !== 'create') {
        await CalendarRepository.updateEvent(user.familyId, eventId, formData);
      } else {
        await CalendarRepository.createEvent(user.familyId, formData);
      }
      navigate('/calendar');
    } catch (error) {
      console.error('Failed to save event', error);
    } finally {
      setIsLoading(false);
    }
  };

  const eventTypes: EventType[] = [
    'DoctorAppointment', 'SchoolEvent', 'Tuition', 'Birthday', 'Medicine', 'Exam', 'FamilyTravel'
  ];

  const roles = ['Family', 'Parent', 'Child', 'Elder', 'Caregiver'];
  const reminderOptions = ['5min', '15min', '30min', '1hr', '2hr', '1day', '3days'];

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
               <CalendarIcon size={40} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">MISSION_PLANNING</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">COORDINATION_ARRAY_INIT v4.4.2</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                {eventId && eventId !== 'create' ? 'Edit_Brief' : 'New_Operation'}
              </h1>
            </div>
          </div>

          <button 
            onClick={() => navigate(-1)}
            className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
          >
            <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 lg:p-14 pt-16 relative">
        <form onSubmit={handleSubmit} className="space-y-16 relative z-10">
          {/* Basic Info */}
          <section className="space-y-12">
            <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                 <Type size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">OBJECTIVE_PARAMETERS</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>
            <FFCard className="p-10 lg:p-16 space-y-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[64px]">
              <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1 flex items-center gap-2 italic">
                   OPERATION_DESIGNATION
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    placeholder="e.g. MEDICAL_SYNC_v1"
                    className="w-full h-20 bg-gray-50/50 border-2 border-transparent rounded-[28px] px-8 font-display font-black text-2xl text-primary placeholder:text-gray-200 focus:bg-white focus:border-primary/10 transition-all outline-none italic shadow-inner"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1 italic">STRATEGIC_CLASSIFICATION</label>
                <div className="flex flex-wrap gap-4">
                  {eventTypes.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic transition-all border-2 ${
                        formData.type === type 
                          ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' 
                          : 'bg-white text-gray-400 border-black/[0.03] hover:border-primary/20'
                      }`}
                    >
                      {type.replace(/([A-Z])/g, '_$1').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </FFCard>
          </section>

          {/* Time & Date */}
          <section className="space-y-12">
            <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                 <Clock size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">TEMPORAL_COORDINATES</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>
            <FFCard className="p-10 lg:p-16 space-y-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[64px]">
              <div className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[32px] border-2 border-transparent hover:border-success/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.isAllDay ? 'bg-success text-white shadow-lg shadow-success/20' : 'bg-white text-gray-300 border border-black/5'}`}>
                    <Clock size={28} />
                  </div>
                  <div>
                    <span className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter">Day-Long Ops</span>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic mt-1">NO_SPECIFIC_HOUR_LOCK</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAllDay: !formData.isAllDay })}
                  className={`w-20 h-10 rounded-full transition-all relative ${formData.isAllDay ? 'bg-success' : 'bg-gray-200'}`}
                >
                  <motion.div 
                    animate={{ x: formData.isAllDay ? 44 : 4 }}
                    className="absolute top-1 w-8 h-8 bg-white rounded-full shadow-2xl" 
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-1 italic">INITIATION_T_SYNC</label>
                  <input 
                    type="datetime-local"
                    required
                    className="w-full h-20 bg-gray-50/50 border-2 border-transparent rounded-[28px] px-8 font-display font-black text-2xl text-primary focus:bg-white focus:border-primary/10 transition-all outline-none italic shadow-inner tabular-nums"
                    value={formData.startDateTime}
                    onChange={e => setFormData({ ...formData, startDateTime: e.target.value })}
                  />
                </div>
                {!formData.isAllDay && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-1 italic">TERMINATION_T_SYNC</label>
                    <input 
                      type="datetime-local"
                      required
                      className="w-full h-20 bg-gray-50/50 border-2 border-transparent rounded-[28px] px-8 font-display font-black text-2xl text-primary focus:bg-white focus:border-primary/10 transition-all outline-none italic shadow-inner tabular-nums"
                      value={formData.endDateTime}
                      onChange={e => setFormData({ ...formData, endDateTime: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[32px] border-2 border-transparent hover:border-primary/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${formData.isRecurring ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-300 border border-black/5'}`}>
                    <Repeat size={28} />
                  </div>
                  <div>
                    <span className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter">Cycle Protocol</span>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic mt-1">AUTONOMOUS_RECURRENCE_ARRAY</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                  className={`w-20 h-10 rounded-full transition-all relative ${formData.isRecurring ? 'bg-primary' : 'bg-gray-200'}`}
                >
                  <motion.div 
                    animate={{ x: formData.isRecurring ? 44 : 4 }}
                    className="absolute top-1 w-8 h-8 bg-white rounded-full shadow-2xl" 
                  />
                </button>
              </div>
            </FFCard>
          </section>

          {/* Visibility & Reminders */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Visibility & Reminders</h3>
            <FFCard className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Users size={14} /> Who can see this?
                </label>
                <div className="flex flex-wrap gap-2">
                  {roles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        const current = formData.visibilityScope || [];
                        const next = current.includes(role) 
                          ? current.filter(r => r !== role) 
                          : [...current, role];
                        setFormData({ ...formData, visibilityScope: next });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        formData.visibilityScope?.includes(role) 
                          ? 'bg-accent text-primary shadow-md shadow-accent/20' 
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Bell size={14} /> Reminders
                </label>
                <div className="flex flex-wrap gap-2">
                  {reminderOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        const current = formData.reminders || [];
                        const next = current.includes(option) 
                          ? current.filter(r => r !== option) 
                          : [...current, option];
                        if (next.length <= 5) setFormData({ ...formData, reminders: next });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        formData.reminders?.includes(option) 
                          ? 'bg-primary text-white shadow-md shadow-primary/20' 
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <p className="text-[8px] text-gray-300 font-bold uppercase tracking-widest ml-1">Max 5 reminders</p>
              </div>
            </FFCard>
          </section>

          {/* Location & Description */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Additional Details</h3>
            <FFCard className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text"
                    placeholder="Add location"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows={3}
                  placeholder="Add notes or details..."
                  className="w-full px-4 py-3 bg-gray-50 border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </FFCard>
          </section>

          <button 
            type="submit" 
            disabled={isLoading || !formData.title}
            className="w-full h-28 rounded-[56px] bg-primary text-white font-black text-2xl uppercase tracking-[0.4em] flex items-center justify-center gap-6 shadow-3xl shadow-primary/30 hover:bg-black disabled:bg-gray-200 disabled:shadow-none transition-all duration-500 active:scale-95 italic group relative overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            <Save size={32} strokeWidth={3} className="text-accent group-hover:scale-110 transition-transform duration-500" />
            {isLoading ? 'EXECUTING_SYNC...' : (eventId && eventId !== 'create' ? 'UPDATE_DEPLOYMENT' : 'INITIALIZE_OPERATION')}
          </button>
        </form>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <CalendarIcon size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Strategic Coordination Array v4.4.2</p>
        </footer>
      </main>
    </div>
  );
};

export default CreateEventScreen;
