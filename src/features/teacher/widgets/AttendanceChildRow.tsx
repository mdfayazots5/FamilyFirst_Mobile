import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, CheckCircle2, XCircle, Clock, LogOut, ShieldCheck, Activity } from 'lucide-react';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';
import { AttendanceStatus } from '../repositories/AttendanceRepository';

interface AttendanceChildRowProps {
  name: string;
  avatarUrl?: string;
  status: AttendanceStatus;
  comment?: string;
  onStatusToggle: () => void;
  onCommentClick: () => void;
  disabled?: boolean;
}

const AttendanceChildRow: React.FC<AttendanceChildRowProps> = ({
  name,
  avatarUrl,
  status,
  comment,
  onStatusToggle,
  onCommentClick,
  disabled
}) => {
  const getStatusConfig = (s: AttendanceStatus) => {
    switch (s) {
      case 'Present': return { icon: <CheckCircle2 size={18} />, color: 'success', label: 'PRESENT', sub: 'SYNC_STABLE' };
      case 'Absent': return { icon: <XCircle size={18} />, color: 'alert', label: 'ABSENT', sub: 'SIGNAL_LOST' };
      case 'Late': return { icon: <Clock size={18} />, color: 'accent', label: 'LATE', sub: 'DELAY_DETECTED' };
      case 'LeftEarly': return { icon: <LogOut size={18} />, color: 'primary', label: 'LEFT_EARLY', sub: 'EARLY_EXIT' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between p-6 bg-white rounded-[32px] border border-black/[0.03] transition-all relative overflow-hidden group ${disabled ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-primary/20 hover:bg-primary/[0.01] shadow-sm hover:shadow-xl hover:shadow-primary/5'}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-50 group-hover:bg-primary transition-colors" />
      
      <div className="flex items-center gap-6">
        <div className="relative">
           <FFAvatar name={name} size="md" src={avatarUrl} className="rounded-2xl border-4 border-white shadow-xl group-hover:scale-105 transition-transform" />
           <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-${config.color} border-2 border-white flex items-center justify-center text-white shadow-lg`}>
              <Activity size={10} strokeWidth={3} />
           </div>
        </div>
        <div>
          <h4 className="font-display font-black text-primary text-xl uppercase italic tracking-tighter leading-none mb-2">{name}</h4>
          <div className="flex items-center gap-3">
             <div className="h-4 w-px bg-gray-100" />
             {comment ? (
               <p className="text-[10px] text-accent font-black uppercase tracking-widest italic line-clamp-1">{comment}</p>
             ) : (
               <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.3em] italic">NO_OBSERVATIONS_LOGGED</p>
             )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onCommentClick}
          disabled={disabled}
          className={`w-14 h-14 rounded-2xl transition-all shadow-sm flex items-center justify-center relative overflow-hidden group/btn ${comment ? 'bg-accent text-white shadow-accent/20' : 'bg-gray-50 text-gray-300 hover:text-primary hover:bg-primary/5'}`}
        >
          <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 opacity-20" />
          <MessageSquare size={20} className="relative z-10" />
        </button>
        
        <motion.button
          whileTap={disabled ? {} : { scale: 0.95 }}
          onClick={onStatusToggle}
          disabled={disabled}
          className={`flex items-center gap-4 pl-5 pr-2 py-2 rounded-2xl font-black text-[10px] transition-all border-2 group/status relative overflow-hidden ${
            status === 'Present' ? 'bg-success/5 border-success/10 text-success' :
            status === 'Absent' ? 'bg-alert/5 border-alert/10 text-alert' :
            status === 'Late' ? 'bg-accent/5 border-accent/10 text-accent' :
            'bg-primary/5 border-primary/10 text-primary'
          }`}
        >
          <span className="uppercase tracking-[0.2em] italic">{config.label}</span>
          <div className={`w-10 h-10 rounded-xl bg-${config.color} flex items-center justify-center text-white shadow-lg group-hover/status:rotate-90 transition-transform`}>
             {config.icon}
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AttendanceChildRow;
