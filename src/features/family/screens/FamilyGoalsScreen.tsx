import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Target, 
  Trophy, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  Save,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyGoalRepository, FamilyGoal } from '../repositories/FamilyGoalRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';

const FamilyGoalsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [goals, setGoals] = useState<FamilyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<FamilyGoal>>({
    title: '',
    description: '',
    targetValue: 100,
    unit: 'Points',
    deadline: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    reward: ''
  });

  const fetchData = useCallback(async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await FamilyGoalRepository.getGoals(user.familyId);
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch family goals', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.familyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.familyId) return;
    try {
      const created = await FamilyGoalRepository.createGoal(user.familyId, newGoal);
      setGoals(prev => [...prev, created]);
      setIsAddingGoal(false);
    } catch (error) {
      console.error('Failed to create goal', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-32">
      {/* Header */}
      <header className="p-8 lg:p-14 space-y-12">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FFBadge variant="primary" size="sm" className="font-black">STRATEGIC OBJECTIVES</FFBadge>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pillar_Sync: Active</p>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
              Family Goals
            </h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-gray-300 hover:text-primary shadow-sm border border-black/[0.03] transition-all active:scale-95"
            >
              <ArrowLeft size={28} />
            </button>
            <button 
              onClick={() => setIsAddingGoal(true)}
              className="w-16 h-16 bg-primary text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={32} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FFCard className="p-8 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[40px]">
            <div className="flex items-center gap-4 mb-4 text-primary/20">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                 <Trophy size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">ACHIEVED_OPS</span>
            </div>
            <p className="text-4xl font-display font-black text-primary italic">12</p>
            <div className="h-1 w-12 bg-success mt-4 rounded-full" />
          </FFCard>

          <FFCard className="p-8 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[40px]">
             <div className="flex items-center gap-4 mb-4 text-accent">
              <div className="w-10 h-10 bg-accent/5 rounded-xl flex items-center justify-center">
                 <Activity size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">ACTIVE_DEPLOYMENT</span>
            </div>
            <p className="text-4xl font-display font-black text-primary italic">04</p>
            <div className="h-1 w-12 bg-accent mt-4 rounded-full" />
          </FFCard>

          <FFCard className="p-8 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[40px]">
             <div className="flex items-center gap-4 mb-4 text-primary/20">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                 <Layers size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">TOTAL_MODULES</span>
            </div>
            <p className="text-4xl font-display font-black text-primary italic">16</p>
            <div className="h-1 w-12 bg-primary mt-4 rounded-full" />
          </FFCard>

          <FFCard className="p-8 border-none shadow-2xl shadow-black/[0.01] bg-primary text-white rounded-[40px]">
             <div className="flex items-center gap-4 mb-4 text-white/40">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-accent">
                 <Zap size={20} fill="currentColor" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">UNIT_EFFICIENCY</span>
            </div>
            <p className="text-4xl font-display font-black italic">88%</p>
            <div className="h-1 w-12 bg-white mt-4 rounded-full" />
          </FFCard>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 lg:px-14 pb-32">
        {isLoading ? (
          <div className="text-center py-40">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
               className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full mx-auto mb-8 shadow-xl"
            />
            <p className="text-[12px] font-black uppercase tracking-[0.5em] text-gray-300 animate-pulse">DECRYPTING_OBJECTIVES...</p>
          </div>
        ) : (
          <section className="space-y-12">
            <div className="flex items-center gap-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">MISSION_PARAMETERS</h3>
              <div className="h-px flex-1 bg-primary/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {goals.map(goal => (
                <FFCard key={goal.id} className="p-12 border-none shadow-2xl shadow-black/[0.01] bg-white rounded-[56px] relative overflow-hidden group hover:bg-primary/[0.02] transition-all duration-700">
                  <div className="relative z-10 space-y-10">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter group-hover:text-accent transition-colors leading-none">
                            {goal.title}
                          </h4>
                          <AnimatePresence>
                            {goal.status === 'Completed' && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1 px-3 py-1 bg-success/10 text-success rounded-xl text-[10px] font-black uppercase tracking-widest"
                              >
                                <ShieldCheck size={12} />
                                VERIFIED
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed uppercase tracking-widest text-[10px] font-bold italic">{goal.description}</p>
                      </div>
                      <div className="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center text-primary shrink-0 shadow-inner border border-black/[0.01] group-hover:rotate-12 transition-transform">
                        <Target size={36} strokeWidth={1} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2 leading-none">CURRENT_SYNCHRONIZATION</p>
                          <span className="text-3xl font-display font-black text-primary italic">
                            {goal.currentValue} <span className="text-gray-300 text-xl font-normal opacity-40">/ {goal.targetValue} {goal.unit}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2 leading-none">PERCENTAGE</p>
                          <span className="text-3xl font-display font-black text-accent italic">
                            {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="h-5 bg-gray-50 rounded-full overflow-hidden border border-black/[0.01] p-1 shadow-inner relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
                          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-primary rounded-full relative"
                        >
                           <div className="absolute inset-x-0 h-1/2 top-0 bg-white/20 blur-[1px]" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-black/[0.03] grid grid-cols-2 gap-10">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-amber-50 rounded-[24px] flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/5 border border-amber-100/50 group-hover:scale-110 transition-transform">
                          <Trophy size={24} fill="currentColor" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1 leading-none">GRANT_PAYOUT</p>
                          <p className="text-lg font-display font-black text-primary uppercase italic tracking-tighter truncate max-w-[150px]">{goal.reward}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-50 rounded-[24px] flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/5 border border-blue-100/50 group-hover:scale-110 transition-transform">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1 leading-none">HARD_DEADLINE</p>
                          <p className="text-lg font-display font-black text-primary uppercase italic tracking-tighter">
                            {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-20 -bottom-20 text-primary/5 group-hover:text-accent/10 transition-all duration-1000 -rotate-12 group-hover:rotate-12 group-hover:scale-150 pointer-events-none">
                    <Target size={300} />
                  </div>
                </FFCard>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {isAddingGoal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingGoal(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-3xl"
            />
            <motion.div
              initial={{ y: '100%', scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 0.95 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-t-[56px] sm:rounded-[64px] p-10 md:p-16 h-[95vh] sm:h-auto overflow-y-auto shadow-2xl border border-black/5"
            >
              <div className="flex justify-between items-start mb-14">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <FFBadge variant="accent" size="sm" className="font-black">CORE_INITIALIZATION</FFBadge>
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">New Objective</h3>
                </div>
                <button 
                  onClick={() => setIsAddingGoal(false)} 
                  className="w-16 h-16 bg-gray-50 rounded-[28px] flex items-center justify-center text-gray-300 hover:text-primary transition-all hover:rotate-90 shadow-inner"
                >
                  <X size={32} />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2">GOAL_DESIGNATION</label>
                    <input 
                      type="text"
                      required
                      placeholder="ENTER TARGET TITLE..."
                      className="w-full px-10 h-20 bg-gray-50 border border-black/[0.03] rounded-[32px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-display font-black text-primary placeholder:opacity-20 uppercase italic text-2xl"
                      value={newGoal.title}
                      onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2">MISSION_BRIEFINGS</label>
                    <textarea 
                      rows={3}
                      placeholder="DEFINE SCOPE AND EXPECTED OUTCOMES..."
                      className="w-full px-10 py-8 bg-gray-50 border border-black/[0.03] rounded-[48px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-body font-bold text-lg text-primary resize-none placeholder:opacity-20 uppercase"
                      value={newGoal.description}
                      onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2">SUCCESS_THRESHOLD</label>
                    <div className="relative">
                      <input 
                        type="number"
                        required
                        className="w-full px-10 h-20 bg-gray-50 border border-black/[0.03] rounded-[32px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-display font-black text-primary text-3xl italic"
                        value={newGoal.targetValue}
                        onChange={e => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) })}
                      />
                      <Target size={28} className="absolute right-10 top-1/2 -translate-y-1/2 text-primary opacity-10" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2">METRIC_UNIT</label>
                    <input 
                      type="text"
                      required
                      placeholder="E.G. POINTS"
                      className="w-full px-10 h-20 bg-gray-50 border border-black/[0.03] rounded-[32px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-display font-black text-primary text-2xl italic uppercase placeholder:opacity-20"
                      value={newGoal.unit}
                      onChange={e => setNewGoal({ ...newGoal, unit: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2">GRANT_ALLOCATION</label>
                    <div className="relative">
                      <input 
                        type="text"
                        required
                        placeholder="DEFINE REWARD..."
                        className="w-full px-10 h-20 bg-gray-50 border border-black/[0.03] rounded-[32px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-display font-black text-primary text-2xl italic uppercase placeholder:opacity-20"
                        value={newGoal.reward}
                        onChange={e => setNewGoal({ ...newGoal, reward: e.target.value })}
                      />
                      <Trophy size={28} className="absolute right-10 top-1/2 -translate-y-1/2 text-amber-400 opacity-20" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2">HARD_DEADLINE</label>
                    <div className="relative">
                      <input 
                        type="date"
                        required
                        className="w-full px-10 h-20 bg-gray-50 border border-black/[0.03] rounded-[32px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-display font-black text-primary text-xl italic"
                        value={newGoal.deadline}
                        onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      />
                      <Calendar size={28} className="absolute right-10 top-1/2 -translate-y-1/2 text-primary opacity-10" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 pt-10">
                  <button 
                    type="button"
                    className="flex-1 h-24 rounded-[32px] bg-gray-50 text-gray-400 font-black text-lg uppercase tracking-[0.3em] hover:bg-gray-100 transition-all italic"
                    onClick={() => setIsAddingGoal(false)}
                  >
                    ABORT_OP
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] h-24 rounded-[32px] bg-primary text-white font-black text-2xl uppercase tracking-[0.4em] shadow-2xl shadow-primary/30 hover:bg-primary/95 transition-all active:scale-95 italic flex items-center justify-center gap-4"
                  >
                    DEPLOY_GOAL
                    <ArrowRight size={28} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="text-center space-y-4 py-20 px-8">
         <div className="flex items-center justify-center gap-4 text-primary/10">
            <div className="h-px w-12 bg-current" />
            <Target size={20} />
            <div className="h-px w-12 bg-current" />
         </div>
         <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.5em]">GOVERNANCE_ENGINE // FamilyFirst Strategic v1.0.0</p>
      </footer>
    </div>
  );
};

export default FamilyGoalsScreen;
