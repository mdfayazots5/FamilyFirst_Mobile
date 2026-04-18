import React from 'react';
import { motion } from 'motion/react';
import { Percent, BookCheck, Trophy, Target, Activity, ShieldCheck, Zap } from 'lucide-react';

interface WeeklySummaryData {
  attendanceRate: string;
  homeworkRate: string;
  standout: string;
  focusArea: string;
}

interface WeeklySummaryFormProps {
  data: WeeklySummaryData;
  onChange: (data: WeeklySummaryData) => void;
}

const WeeklySummaryForm: React.FC<WeeklySummaryFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof WeeklySummaryData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <label className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 italic ml-4 leading-none">ATTENDANCE_METRIC_v[n]</label>
          <div className="relative group">
            <Percent className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-success transition-colors" size={24} strokeWidth={1.5} />
            <input
              type="text"
              value={data.attendanceRate}
              onChange={(e) => handleChange('attendanceRate', e.target.value)}
              placeholder="e.g. 100%"
              className="w-full h-24 bg-white border-2 border-transparent rounded-[32px] pl-20 pr-8 font-display font-black text-3xl text-primary focus:outline-none focus:border-success/20 focus:bg-gray-50/20 transition-all placeholder:text-gray-100 shadow-inner italic"
            />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-success/20">
               <Activity size={24} className="animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <label className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 italic ml-4 leading-none">CURRICULUM_QUOTA_v[n]</label>
          <div className="relative group">
            <BookCheck className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-accent transition-colors" size={24} strokeWidth={1.5} />
            <input
              type="text"
              value={data.homeworkRate}
              onChange={(e) => handleChange('homeworkRate', e.target.value)}
              placeholder="e.g. 95%"
              className="w-full h-24 bg-white border-2 border-transparent rounded-[32px] pl-20 pr-8 font-display font-black text-3xl text-primary focus:outline-none focus:border-accent/20 focus:bg-gray-50/20 transition-all placeholder:text-gray-100 shadow-inner italic"
            />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-accent/20">
               <ShieldCheck size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <label className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 italic ml-6 leading-none flex items-center gap-4">
           <Trophy size={18} className="text-success" />
           STANDOUT_PERFORMANCE_TRANSCRIPT
        </label>
        <div className="relative group">
          <textarea
            value={data.standout}
            onChange={(e) => handleChange('standout', e.target.value)}
            placeholder="Document superlative contributions and behavioral wins..."
            className="w-full bg-white border border-black/[0.03] rounded-[56px] px-12 py-12 font-medium text-xl text-primary focus:outline-none focus:border-success/20 min-h-[200px] shadow-inner transition-all placeholder:text-gray-100 italic"
          />
          <div className="absolute right-12 bottom-12 opacity-[0.03] group-focus-within:opacity-10 transition-opacity pointer-events-none">
             <Trophy size={80} strokeWidth={1} />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <label className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 italic ml-6 leading-none flex items-center gap-4">
           <Target size={18} className="text-accent" />
           STRATEGIC_FOCUS_DIRECTIVE
        </label>
        <div className="relative group">
          <textarea
            value={data.focusArea}
            onChange={(e) => handleChange('focusArea', e.target.value)}
            placeholder="Assign corrective operational directives for the next cycle..."
            className="w-full bg-white border border-black/[0.03] rounded-[56px] px-12 py-12 font-medium text-xl text-primary focus:outline-none focus:border-accent/20 min-h-[200px] shadow-inner transition-all placeholder:text-gray-100 italic"
          />
          <div className="absolute right-12 bottom-12 opacity-[0.03] group-focus-within:opacity-10 transition-opacity pointer-events-none">
             <Target size={80} strokeWidth={1} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryForm;
