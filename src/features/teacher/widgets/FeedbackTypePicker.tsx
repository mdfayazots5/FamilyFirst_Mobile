import React from 'react';
import { motion } from 'motion/react';
import { Star, Flag, Eye, BookOpen, Bell, Calendar, Activity, ShieldCheck, Zap, Cpu, Layers } from 'lucide-react';
import { FeedbackType } from '../repositories/FeedbackRepository';

interface FeedbackTypePickerProps {
  selectedType: FeedbackType | null;
  onSelect: (type: FeedbackType) => void;
  disabledTypes?: FeedbackType[];
}

const feedbackTypes: { type: FeedbackType; label: string; icon: React.ReactNode; color: string; protocol: string }[] = [
  { type: 'Appreciation', label: 'Appreciation', icon: <Star size={24} />, color: 'bg-success', protocol: 'POSITIVE_SYNC' },
  { type: 'Complaint', label: 'Complaint', icon: <Flag size={24} />, color: 'bg-alert', protocol: 'REGULATION_LOG' },
  { type: 'Observation', label: 'Observation', icon: <Eye size={24} />, color: 'bg-primary', protocol: 'GENERAL_ASSESS' },
  { type: 'Homework', label: 'Homework', icon: <BookOpen size={24} />, color: 'bg-accent', protocol: 'CURRICULUM_DATA' },
  { type: 'Urgent', label: 'Urgent', icon: <Bell size={24} />, color: 'bg-red-600', protocol: 'PRIORITY_SIGNAL' },
  { type: 'WeeklySummary', label: 'Weekly Summary', icon: <Calendar size={24} />, color: 'bg-indigo-600', protocol: 'AGGREGATE_SHIFT' },
];

const FeedbackTypePicker: React.FC<FeedbackTypePickerProps> = ({ selectedType, onSelect, disabledTypes = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {feedbackTypes.map(({ type, label, icon, color, protocol }) => {
        const isDisabled = disabledTypes.includes(type);
        const isSelected = selectedType === type;

        return (
          <motion.button
            key={type}
            whileHover={isDisabled ? {} : { scale: 1.02, y: -4 }}
            whileTap={isDisabled ? {} : { scale: 0.98 }}
            disabled={isDisabled}
            onClick={() => onSelect(type)}
            className={`relative flex items-center p-8 rounded-[40px] border-2 transition-all text-left group ${
              isSelected 
                ? 'border-primary bg-white shadow-2xl shadow-primary/10' 
                : 'border-black/[0.03] bg-white hover:border-primary/10'
            } ${isDisabled ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white mr-6 shadow-xl ${color} group-hover:scale-110 transition-transform`}>
              {icon}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-1 italic group-hover:text-primary/40 transition-colors">PROTOCOL: {protocol}</p>
              <span className={`text-2xl font-display font-black uppercase italic tracking-tighter ${isSelected ? 'text-primary' : 'text-primary/60'}`}>
                {label}
              </span>
            </div>
            {isSelected && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute -top-3 -right-3 w-10 h-10 bg-primary text-white rounded-[14px] flex items-center justify-center shadow-2xl shadow-primary/30 border-4 border-[#FDFCFB]"
              >
                <ShieldCheck size={20} />
              </motion.div>
            )}
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-10 transition-opacity">
               <Zap size={48} strokeWidth={1} />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default FeedbackTypePicker;
