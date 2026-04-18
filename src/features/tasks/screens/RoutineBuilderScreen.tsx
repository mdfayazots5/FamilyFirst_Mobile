import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  Info,
  ChevronRight,
  Trash2,
  Edit3,
  Sparkles,
  Zap,
  Target,
  ShieldCheck,
  Settings,
  Layers,
  Cpu,
  Command,
  Activity,
  ZapOff,
  RefreshCcw,
  Fingerprint,
  Smartphone,
  Shield,
  Search
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { TaskRepository, TaskItem, TimeBlock } from '../repositories/TaskRepository';
import { FamilyRepository } from '../../family/repositories/FamilyRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';
import TaskChip from '../widgets/TaskChip';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeBlocks: { id: TimeBlock; label: string; time: string; color: string; icon: React.ReactNode }[] = [
  { id: 'Morning', label: 'Morning', time: '6-9 AM', color: 'bg-amber-500/10 text-amber-600', icon: <Sparkles size={16} /> },
  { id: 'School', label: 'School', time: '9-4 PM', color: 'bg-gray-400/10 text-gray-400', icon: <Target size={16} /> },
  { id: 'Evening', label: 'Evening', time: '4-7 PM', color: 'bg-indigo-500/10 text-indigo-600', icon: <Zap size={16} /> },
  { id: 'Night', label: 'Night', time: '7-10 PM', color: 'bg-blue-500/10 text-blue-600', icon: <Clock size={16} /> },
];

const RoutineBuilderScreen: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [isLoading, setIsLoading] = useState(true);
  const [isExamModeModalOpen, setIsExamModeModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [childName, setChildName] = useState('');

  const fetchData = useCallback(async () => {
    if (!user?.familyId || !childId) return;
    setIsLoading(true);
    try {
      const [taskList, members] = await Promise.all([
        TaskRepository.getTasks(user.familyId, childId),
        FamilyRepository.getMembers(user.familyId)
      ]);
      setTasks(taskList);
      const child = members.find(m => m.id === childId);
      if (child) setChildName(child.name);
    } catch (error) {
      console.error('Failed to fetch routine data', error);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  }, [user?.familyId, childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteTask = async () => {
    if (!user?.familyId || !selectedTask) return;
    try {
      await TaskRepository.deleteTask(user.familyId, selectedTask.id);
      setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleExamMode = async () => {
    if (!user?.familyId || !childId) return;
    try {
      await TaskRepository.applyExamSeasonMode(user.familyId, childId);
      await fetchData(); // Refresh tasks
      setIsExamModeModalOpen(false);
    } catch (error) {
      console.error('Failed to apply exam mode', error);
    }
  };

  const getTasksForBlock = (blockId: TimeBlock, dayIndex: number) => {
    return tasks.filter(t => t.timeBlock === blockId && t.recurringDays.includes(dayIndex + 1 === 7 ? 0 : dayIndex + 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary mb-8 relative group">
           <div className="absolute inset-0 bg-primary/10 rounded-[32px] animate-ping opacity-20" />
           <Cpu size={40} className="animate-pulse" />
        </div>
        <div className="text-center space-y-3">
           <p className="text-[12px] font-black text-primary uppercase tracking-[0.5em] animate-pulse italic">RECONSTRUCTING_PROTOCOLS...</p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">Architectural Engine Primary Sync</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Policy Architect Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
               <Layers size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">PROTOCOL_ARCHITECT</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">LIFECYCLE_CONFIG: {childName.toUpperCase()}</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Routine Build
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <FFButton 
              variant="accent"
              size="sm"
              onClick={() => setIsExamModeModalOpen(true)}
              className="px-10 rounded-[20px] h-16 text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-accent/30 italic group"
              icon={<Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
            >
              EXAM_PROTOCOL
            </FFButton>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 space-y-24 pt-16">
        {/* Temporal Selection Feed */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 px-4">
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                     <Calendar size={20} />
                  </div>
                  <h2 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">Temporal Matrix</h2>
               </div>
               <p className="text-gray-400 font-medium italic max-w-xl text-lg leading-relaxed">
                 Adjust recurring protocols across the weekly timeline. Changes affect global synchronization instantly across all connected unit arrays.
               </p>
            </div>
            
            <div className="flex gap-4 p-3 bg-white border border-black/[0.03] rounded-[36px] shadow-3xl shadow-black/[0.01] overflow-x-auto no-scrollbar scroll-smooth">
              {days.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(i)}
                  className={`flex flex-col items-center justify-center min-w-[96px] h-28 rounded-[24px] transition-all duration-500 group relative ${selectedDay === i ? 'bg-primary text-white shadow-3xl shadow-primary/30 scale-105 active:scale-95' : 'text-gray-300 hover:bg-gray-50'}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 leading-none italic ${selectedDay === i ? 'text-white/50' : 'text-gray-300'}`}>{day}</span>
                  <span className="text-3xl font-display font-black leading-none italic tabular-nums">{i + 1}</span>
                  {selectedDay === i && (
                     <motion.div layoutId="day-indicator" className="absolute -bottom-1 w-12 h-1 bg-white/40 rounded-full" />
                  )}
                </button>
              ))}
            </div>
        </div>

        <div className="space-y-16">
           <div className="flex items-center gap-8 px-4">
              <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
                 <Activity size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">{fullDays[selectedDay].toUpperCase()}_PROTOCOL_STACK</h3>
              <div className="h-px flex-1 bg-primary/10 hidden md:block" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {timeBlocks.map((block) => {
               const blockTasks = getTasksForBlock(block.id, selectedDay);
               const isLocked = block.id === 'School';

               return (
                 <motion.div 
                   key={block.id} 
                   whileHover={!isLocked ? { y: -8 } : {}}
                   className={`group relative ${isLocked ? 'opacity-40 grayscale-[0.5] decoration-gray-400' : ''}`}
                 >
                   <div className="flex items-center justify-between mb-6 px-4">
                     <div className="flex items-center gap-6">
                        <div className={`px-6 py-2.5 rounded-[14px] ${block.color} text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2 italic leading-none shadow-sm`}>
                          {block.icon}
                          {block.label.toUpperCase()}
                        </div>
                        <span className="text-[11px] text-gray-300 font-black tracking-[0.2em] italic tabular-nums leading-none">{block.time}</span>
                     </div>
                     {!isLocked && (
                        <button 
                         onClick={() => navigate(`/parent/routine/${childId}/add?block=${block.id}&day=${selectedDay}`)}
                         className="w-12 h-12 bg-white border border-black/[0.05] rounded-[18px] flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white hover:rotate-90 transition-all duration-500 active:scale-90"
                       >
                         <Plus size={24} />
                       </button>
                     )}
                   </div>

                   <FFCard className={`p-10 min-h-[220px] flex flex-col justify-center border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] transition-all duration-700 relative overflow-hidden group/card ${!isLocked && 'hover:bg-gray-50/50'}`}>
                     <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none translate-x-12 translate-y-[-10%] group-hover/card:scale-105 transition-transform duration-1000">
                        <Cpu size={240} strokeWidth={1} />
                     </div>

                     {isLocked ? (
                       <div className="flex flex-col items-center gap-6 relative z-10 text-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center text-gray-200">
                            <Shield size={40} />
                          </div>
                          <div className="space-y-1">
                             <p className="text-[12px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none">SCHOOL_OPS_LOCKED</p>
                             <p className="text-[10px] text-gray-200 font-bold uppercase tracking-widest italic">Immutable System Block</p>
                          </div>
                       </div>
                     ) : blockTasks.length === 0 ? (
                        <div className="text-center relative z-10 py-8">
                           <div className="w-16 h-16 border-2 border-dashed border-gray-100 rounded-full flex items-center justify-center text-gray-200 mx-auto mb-6">
                              <ZapOff size={24} />
                           </div>
                           <p className="text-[12px] font-black text-gray-200 uppercase tracking-[0.5em] italic leading-none">NO_ASSETS_ASSIGNED</p>
                        </div>
                     ) : (
                       <div className="grid grid-cols-1 gap-5 relative z-10">
                         {blockTasks.map((task, idx) => (
                           <TaskChip 
                             key={task.id} 
                             task={task} 
                             onClick={() => navigate(`/parent/routine/${childId}/edit/${task.id}`)}
                             onLongPress={() => {
                               setSelectedTask(task);
                               setIsDeleteModalOpen(true);
                             }}
                           />
                         ))}
                       </div>
                     )}
                   </FFCard>
                 </motion.div>
               );
             })}
           </div>
        </div>

        <footer className="text-center space-y-12 py-40 px-8 border-t border-black/[0.03]">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <div className="space-y-4">
              <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.8em] italic leading-relaxed">STATION_ENGINE // Strategic Routine Architect Matrix v4.4.2</p>
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] italic opacity-40">Changes affect global synchronization instantly across all connected units</p>
           </div>
        </footer>
      </main>

      {/* Strategic Build FAB */}
      <div className="fixed bottom-28 right-12 flex flex-col items-end gap-6 pointer-events-none z-40">
        <motion.button
          whileHover={{ scale: 1.15, y: -8 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(`/parent/routine/${childId}/add?day=${selectedDay}`)}
          className="pointer-events-auto w-24 h-24 bg-primary text-white rounded-[40px] shadow-3xl shadow-primary/40 flex items-center justify-center transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-accent/40 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
          <Plus size={40} className="relative z-10 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-500" />
        </motion.button>
      </div>

      {/* Strategic Overrides: Exam Protocol */}
      <AnimatePresence>
        {isExamModeModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExamModeModalOpen(false)}
              className="fixed inset-0 bg-primary/20 z-[60] backdrop-blur-2xl"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[72px] z-[70] p-12 lg:p-24 shadow-3xl"
            >
              <div className="max-w-xl mx-auto text-center space-y-12">
                <div className="w-32 h-32 bg-accent/5 rounded-[48px] flex items-center justify-center mx-auto text-accent shadow-inner relative group overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-1 bg-accent/20 animate-pulse" />
                  <Sparkles size={64} className="group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div>
                   <div className="flex items-center justify-center gap-4 mb-6">
                    <FFBadge variant="accent" size="sm" className="font-black px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl leading-none">CORE_SYSTEM_OVERRIDE</FFBadge>
                  </div>
                  <h3 className="text-5xl lg:text-6xl font-display font-black text-primary uppercase italic tracking-tighter leading-tight">SEASON: EXAMS</h3>
                  <p className="text-gray-400 mt-8 leading-relaxed font-medium italic text-lg">
                    "This protocol will overwrite all <span className="text-primary font-black uppercase">Evening</span> and <span className="text-primary font-black uppercase">Night</span> blocks with study-optimized templates for the 14-day cycle. Tactical efficiency: <span className="text-success font-black">+45%</span>"
                  </p>
                </div>
                <div className="flex gap-6 pt-6">
                  <button onClick={() => setIsExamModeModalOpen(false)} className="flex-1 h-24 rounded-[32px] font-black uppercase tracking-[0.4em] border-2 border-black/5 text-gray-400 hover:bg-gray-50 transition-all italic text-sm">ABORT_CMD</button>
                  <button onClick={handleExamMode} className="flex-1 h-24 rounded-[32px] font-black uppercase tracking-[0.4em] bg-primary text-white shadow-3xl shadow-primary/30 hover:bg-black transition-all italic text-sm">INJECT_PROTOCOL</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Protocol Disposal: Asset Purge */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-alert/20 z-[60] backdrop-blur-2xl"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[72px] z-[70] p-12 lg:p-24 shadow-3xl"
            >
              <div className="max-w-xl mx-auto text-center space-y-12">
                <div className="w-32 h-32 bg-alert/10 rounded-[48px] flex items-center justify-center mx-auto text-alert shadow-inner relative group overflow-hidden">
                   <div className="absolute inset-x-0 bottom-0 h-1 bg-alert/20 animate-pulse" />
                   <Trash2 size={64} className="group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div>
                   <div className="flex items-center justify-center gap-4 mb-6">
                    <FFBadge variant="alert" size="sm" className="font-black px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl leading-none">DATA_PURGE_AUTHORIZED</FFBadge>
                  </div>
                  <h3 className="text-5xl lg:text-6xl font-display font-black text-primary uppercase italic tracking-tighter leading-tight whitespace-nowrap">DISPOSE ASSET?</h3>
                  <p className="text-gray-400 mt-8 leading-relaxed font-medium italic text-lg text-balance">
                    "Are you sure you want to terminate the <span className="text-primary font-black uppercase">"{selectedTask?.title}"</span> protocol? This action is synchronizing and cannot be undone."
                  </p>
                </div>
                <div className="flex gap-6 pt-6">
                   <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-24 rounded-[32px] font-black uppercase tracking-[0.4em] border-2 border-black/5 text-gray-400 hover:bg-gray-50 transition-all italic text-sm">CANCEL_PURGE</button>
                   <button onClick={handleDeleteTask} className="flex-1 h-24 rounded-[32px] font-black uppercase tracking-[0.4em] bg-alert text-white shadow-3xl shadow-alert/30 hover:bg-dark-alert transition-all italic text-sm">TERMINATE_ASSET</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoutineBuilderScreen;
