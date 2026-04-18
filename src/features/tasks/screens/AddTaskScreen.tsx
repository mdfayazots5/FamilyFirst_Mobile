import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Coins, 
  Camera, 
  Tag, 
  Repeat,
  Check,
  Library,
  Zap,
  Target,
  ShieldCheck,
  Settings,
  Layers,
  Sparkles,
  Search,
  ChevronDown
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { TaskRepository, TaskItem, TimeBlock, PillarTag, TaskTemplate } from '../repositories/TaskRepository';
import { FamilyRepository } from '../../family/repositories/FamilyRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import TaskTemplatePicker from '../widgets/TaskTemplatePicker';

const pillarTags: PillarTag[] = ['Study', 'Cleanliness', 'Discipline', 'ScreenControl', 'Responsibility'];
const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const AddTaskScreen: React.FC = () => {
  const { childId, taskId } = useParams<{ childId: string; taskId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [timeBlock, setTimeBlock] = useState<TimeBlock>((searchParams.get('block') as TimeBlock) || 'Morning');
  const [duration, setDuration] = useState(15);
  const [coinValue, setCoinValue] = useState(10);
  const [isPhotoRequired, setIsPhotoRequired] = useState(false);
  const [pillarTag, setPillarTag] = useState<PillarTag>('Discipline');
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurringDays, setRecurringDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [childAge, setChildAge] = useState(10);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.familyId || !childId) return;
      try {
        const members = await FamilyRepository.getMembers(user.familyId);
        const child = members.find(m => m.id === childId);
        if (child) {
          setChildAge(child.age || 10);
        }

        if (taskId) {
          const tasks = await TaskRepository.getTasks(user.familyId, childId);
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            setName(task.name);
            setTimeBlock(task.timeBlock);
            setDuration(task.duration);
            setCoinValue(task.coinValue);
            setIsPhotoRequired(task.isPhotoRequired);
            setPillarTag(task.pillarTag);
            setIsRecurring(task.isRecurring);
            setRecurringDays(task.recurringDays);
          }
        }
      } catch (error) {
        console.error('Failed to fetch initial task data', error);
      }
    };
    fetchInitialData();
  }, [user?.familyId, childId, taskId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.familyId || !childId) return;

    setIsLoading(true);
    const taskData: Partial<TaskItem> = {
      childProfileId: childId,
      name,
      timeBlock,
      duration,
      coinValue,
      isPhotoRequired,
      pillarTag,
      isRecurring,
      recurringDays
    };

    try {
      if (taskId) {
        await TaskRepository.updateTask(user.familyId, taskId, taskData);
      } else {
        await TaskRepository.createTask(user.familyId, taskData);
      }
      navigate(-1);
    } catch (error) {
      console.error('Failed to save task', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    const apiDay = dayIndex === 6 ? 0 : dayIndex + 1; // Convert to 0-6 (Sun-Sat)
    setRecurringDays(prev => 
      prev.includes(apiDay) ? prev.filter(d => d !== apiDay) : [...prev, apiDay]
    );
  };

  const handleTemplateSelect = (template: TaskTemplate) => {
    setName(template.name);
    setDuration(template.defaultDuration);
    setCoinValue(template.defaultCoinValue);
    setPillarTag(template.pillarTag);
    setIsTemplatePickerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-32">
      <header className="bg-white/80 backdrop-blur-md p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary shadow-inner">
              <Layers size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <FFBadge variant="primary" size="sm" className="font-black">ASSET PROVISIONING</FFBadge>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Deployment: Unit_Primary</p>
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-black text-primary tracking-tighter uppercase italic">
                {taskId ? 'Modify Asset' : 'New Assignment'}
              </h1>
            </div>
          </div>

          <div className="flex gap-4">
            {!taskId && (
              <FFButton 
                variant="outline"
                size="sm"
                onClick={() => setIsTemplatePickerOpen(true)}
                className="h-14 rounded-2xl border-black/5 bg-white shadow-sm px-8 uppercase tracking-widest text-[10px] font-black"
                icon={<Library size={18} />}
              >
                TEMPLATE_VAULT
              </FFButton>
            )}
            <button 
              onClick={() => navigate(-1)}
              className="w-14 h-14 bg-white rounded-2xl border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8 lg:p-14">
        <form onSubmit={handleSave} className="space-y-12">
          {/* Core Identification */}
          <section className="space-y-8">
             <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">MODULE_IDENTIFICATION</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>

            <FFCard className="p-10 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[48px]">
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Assignment Objective</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={24} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50/50 border border-black/[0.03] rounded-[32px] pl-16 pr-8 py-8 font-display font-black text-2xl text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 placeholder:text-gray-200 transition-all italic uppercase tracking-tighter"
                      placeholder="ENTER_PROTOCOL_NAME..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Operational Window</label>
                    <div className="relative">
                       <select
                        value={timeBlock}
                        onChange={(e) => setTimeBlock(e.target.value as TimeBlock)}
                        className="w-full bg-gray-50/50 border border-black/[0.03] rounded-[24px] px-8 py-6 font-display font-black text-primary text-xl uppercase italic focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="Morning">MORNING_OPS</option>
                        <option value="Evening">EVENING_OPS</option>
                        <option value="Night">NOCTURNAL_OPS</option>
                      </select>
                      <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Expected Duration (MIN)</label>
                    <div className="relative group">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary" size={20} />
                      <input
                        type="number"
                        required
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full bg-gray-50/50 border border-black/[0.03] rounded-[24px] pl-16 pr-8 py-6 font-display font-black text-xl text-primary focus:outline-none focus:ring-4 focus:ring-primary/5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FFCard>
          </section>

          {/* Incentive & Verification */}
          <section className="space-y-8">
             <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">INCENTIVE_VERIFICATION</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>

            <FFCard className="p-10 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[48px] space-y-12">
               <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">RESOURCE_ALLOCATION</label>
                       <p className="text-sm text-gray-300 font-medium">Credits issued upon synchronization.</p>
                    </div>
                    <div className="flex items-center gap-3 px-8 py-4 bg-amber-50 rounded-[28px] text-amber-600 border border-amber-100 shadow-xl shadow-amber-500/5">
                      <Coins size={24} fill="currentColor" />
                      <span className="text-3xl font-display font-black italic">{coinValue}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={coinValue}
                    onChange={(e) => setCoinValue(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-primary"
                  />
               </div>

               <div className="flex items-center justify-between p-10 bg-gray-50/50 rounded-[40px] border border-black/[0.02] group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center text-primary shadow-xl shadow-black/[0.02] border border-black/[0.01]">
                      <Camera size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-display font-black text-primary uppercase italic tracking-tighter">Visual Log Requirement</h4>
                      <p className="text-sm text-gray-400 font-medium mt-1">Binary proof required via optical sensor.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPhotoRequired(!isPhotoRequired)}
                    className={`w-20 h-10 rounded-[20px] transition-all relative p-1.5 ${isPhotoRequired ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-200'}`}
                  >
                    <motion.div 
                      animate={{ x: isPhotoRequired ? 40 : 0 }}
                      className="w-7 h-7 bg-white rounded-[14px] shadow-sm flex items-center justify-center"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${isPhotoRequired ? 'bg-primary' : 'bg-gray-300'}`} />
                    </motion.div>
                  </button>
               </div>
            </FFCard>
          </section>

          {/* Classification & Schedule */}
          <section className="space-y-8">
             <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">SYSTEM_CLASSIFICATION</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>

            <FFCard className="p-10 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[48px] space-y-12">
               <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Pillar Directive</label>
                  <div className="flex flex-wrap gap-3">
                    {pillarTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setPillarTag(tag)}
                        className={`px-8 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${pillarTag === tag ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-white border-black/[0.03] text-gray-400 hover:bg-gray-50'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="pt-10 border-t border-black/[0.03]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                         <Repeat size={20} />
                      </div>
                      <h4 className="text-xl font-display font-black text-primary uppercase italic tracking-tighter">Recurring Sequence</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`w-16 h-8 rounded-full transition-all relative ${isRecurring ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                      <motion.div 
                        animate={{ x: isRecurring ? 32 : 4 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isRecurring && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-between gap-2 overflow-x-auto no-scrollbar py-2"
                      >
                        {days.map((day, i) => {
                          const apiDay = i === 6 ? 0 : i + 1;
                          const isActive = recurringDays.includes(apiDay);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => toggleDay(i)}
                              className={`w-14 h-14 lg:w-20 lg:h-20 flex-shrink-0 rounded-2xl font-display font-black text-[10px] tracking-widest transition-all border-2 ${isActive ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-white border-black/[0.03] text-gray-200'}`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </FFCard>
          </section>

          <div className="pt-8">
            <FFButton 
              type="submit" 
              className="w-full h-24 rounded-[40px] text-xl font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-primary/20" 
              isLoading={isLoading}
              icon={<ShieldCheck size={28} />}
            >
              FINALIZE_ASSIGNMENT
            </FFButton>
          </div>
        </form>

        <footer className="text-center space-y-4 py-20">
           <div className="flex items-center justify-center gap-4 text-primary/10">
              <div className="h-px w-12 bg-current" />
              <Target size={20} />
              <div className="h-px w-12 bg-current" />
           </div>
           <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em]">PROTOCOL_ENGINE // FamilyFirst v1.0.0</p>
        </footer>
      </main>

      {/* Template Picker Overlay */}
      <AnimatePresence>
        {isTemplatePickerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTemplatePickerOpen(false)}
              className="fixed inset-0 bg-primary/10 z-50 backdrop-blur-3xl transition-all"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 40, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 h-[92vh] z-50 overflow-hidden rounded-t-[64px] shadow-2xl bg-white"
            >
              <TaskTemplatePicker 
                ageGroup={childAge} 
                onSelect={handleTemplateSelect} 
                onClose={() => setIsTemplatePickerOpen(false)} 
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddTaskScreen;
