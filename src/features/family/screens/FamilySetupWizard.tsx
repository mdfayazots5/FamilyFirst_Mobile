import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Baby, 
  Heart, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Plus,
  Trash2,
  Share2,
  ChevronRight,
  GraduationCap,
  Zap,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';
import { FamilyRepository } from '../repositories/FamilyRepository';
import { useAuth, UserRole } from '../../../core/auth/AuthContext';

const AVATARS = [
  'avatar_01', 'avatar_02', 'avatar_03', 'avatar_04', 'avatar_05',
  'avatar_06', 'avatar_07', 'avatar_08', 'avatar_09', 'avatar_10'
];

const FamilySetupWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState('');
  const [city, setCity] = useState('');
  const [children, setChildren] = useState<{ name: string; age: string; grade: string; avatar: string }[]>([]);
  const [elder, setElder] = useState({ name: '', phone: '', linkType: 'Grandmother' });
  const [weekTemplate, setWeekTemplate] = useState('Standard School Week');
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1A2E4A', '#C8922A', '#2D6A4F']
    });
    setJoinCode('X-RAY-01');
    nextStep();
  };

  const addChild = () => {
    if (children.length >= 4) {
      alert('REACHED_QUOTA: Upgrade to Premium for expanded personnel array.');
      return;
    }
    setChildren([...children, { name: '', age: '', grade: '', avatar: AVATARS[0] }]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: string, value: string) => {
    const newChildren = [...children];
    (newChildren[index] as any)[field] = value;
    setChildren(newChildren);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center p-8 md:p-12 lg:p-24 overflow-x-hidden relative">
      {/* Background Tactical Grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-accent opacity-20" />

      <div className="max-w-3xl w-full relative z-10">
        {/* Cinematic Progress Interface */}
        <div className="mb-24">
          <div className="flex justify-between items-end mb-6 px-1">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-[0.3em] outline-dashed outline-1 outline-primary/30">SYSTEM_INIT</FFBadge>
                 <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              </div>
              <h4 className="text-2xl font-display font-black text-primary tracking-tighter uppercase italic">CALIBRATION_PHASE {step} <span className="text-gray-200">/ 05</span></h4>
            </div>
            <div className="text-right space-y-1">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent italic">Sync_Status</span>
               <p className="text-xl font-display font-black text-primary tabular-nums italic leading-none">{Math.round((step / 5) * 100)}%</p>
            </div>
          </div>
          <div className="h-4 bg-gray-50 rounded-full overflow-hidden shadow-inner p-1 border border-black/[0.03] relative group">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              className="h-full bg-primary rounded-full shadow-lg shadow-primary/20 relative"
            >
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </motion.div>
          </div>
          <div className="flex justify-between mt-4 px-1">
             {[1,2,3,4,5].map(i => (
               <div key={i} className={`h-1 flex-1 mx-0.5 rounded-full transition-colors duration-500 ${i <= step ? 'bg-primary/20' : 'bg-gray-100'}`} />
             ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-14"
            >
              <div className="text-center space-y-6">
                <div className="w-28 h-28 bg-primary/5 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-primary shadow-inner border border-primary/10 rotate-3 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Users size={48} strokeWidth={1} className="relative z-10" />
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-black text-primary tracking-tighter leading-none uppercase italic">Identity <span className="text-accent underline decoration-accent/10 underline-offset-8 decoration-8">MATRIX</span></h1>
                <p className="text-gray-400 font-black uppercase italic tracking-widest opacity-60 max-w-sm mx-auto text-[13px]">Define the core organizational parameters for your family unit.</p>
              </div>

              <FFCard className="p-12 space-y-10 shadow-3xl shadow-black/[0.01] bg-white/80 backdrop-blur-xl rounded-[56px] border-none group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 italic">Family_Designation [SURNAME]</label>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
                  </div>
                  <input
                    type="text"
                    placeholder="EX: THE_SHARMA_NETWORK"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value.toUpperCase())}
                    className="w-full bg-gray-50/50 border-2 border-transparent rounded-[32px] px-10 py-8 font-display font-black text-3xl text-primary focus:bg-white focus:border-accent/10 focus:ring-8 focus:ring-accent/5 transition-all outline-none italic placeholder:text-gray-100 shadow-sm"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 italic">Operational_Base [CITY]</label>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="EX: MUMBAI_SECTOR"
                      value={city}
                      onChange={(e) => setCity(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50/50 border-2 border-transparent rounded-[32px] px-10 py-8 font-display font-black text-3xl text-primary focus:bg-white focus:border-accent/10 focus:ring-8 focus:ring-accent/5 transition-all outline-none italic placeholder:text-gray-100 shadow-sm"
                    />
                  </div>
                </div>
              </FFCard>

              <FFButton 
                className="w-full h-28 rounded-[40px] font-display font-black uppercase tracking-[0.4em] text-xl shadow-3xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 italic group/btn overflow-hidden relative" 
                disabled={!familyName || !city}
                onClick={nextStep}
              >
                <div className="flex items-center justify-center gap-6 relative z-10">
                   <span>Execute Step_02</span>
                   <ArrowRight size={28} className="group-hover/btn:translate-x-2 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </FFButton>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-14"
            >
              <div className="text-center space-y-6">
                <div className="w-28 h-28 bg-accent/5 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-accent shadow-inner border border-accent/10 -rotate-3 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Baby size={48} strokeWidth={1} className="relative z-10" />
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-black text-primary tracking-tighter leading-none uppercase italic">Gen <span className="text-accent">ALPHA</span></h1>
                <p className="text-gray-400 font-black uppercase italic tracking-widest opacity-60 max-w-sm mx-auto text-[13px]">Register the primary operative units of the generation.</p>
              </div>

              <div className="space-y-10">
                {children.map((child, index) => (
                  <FFCard key={index} className="relative p-12 space-y-12 border-none shadow-3xl shadow-black/[0.01] bg-white/80 backdrop-blur-xl rounded-[56px] group overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 bg-accent h-full opacity-20" />
                    <button 
                      onClick={() => removeChild(index)}
                      className="absolute top-8 right-8 w-12 h-12 bg-gray-50 rounded-2xl text-gray-300 hover:text-alert hover:bg-alert/5 transition-all shadow-sm border border-black/[0.03] flex items-center justify-center active:scale-90"
                    >
                      <Trash2 size={24} strokeWidth={1} />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 italic ml-1">Operative_Codename</label>
                        <input
                          type="text"
                          value={child.name}
                          onChange={(e) => updateChild(index, 'name', e.target.value.toUpperCase())}
                          className="w-full bg-gray-50/50 border-2 border-transparent rounded-[24px] px-8 py-6 font-display font-black text-2xl text-primary focus:bg-white focus:border-accent/10 transition-all outline-none italic placeholder:text-gray-100 shadow-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 italic ml-1">Chronos</label>
                          <input
                            type="number"
                            value={child.age}
                            onChange={(e) => updateChild(index, 'age', e.target.value)}
                            className="w-full bg-gray-50/50 border-2 border-transparent rounded-[24px] px-8 py-6 font-display font-black text-2xl text-primary focus:bg-white focus:border-accent/10 transition-all outline-none italic tabular-nums shadow-sm"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 italic ml-1">Tier</label>
                          <input
                            type="text"
                            value={child.grade}
                            onChange={(e) => updateChild(index, 'grade', e.target.value.toUpperCase())}
                            className="w-full bg-gray-50/50 border-2 border-transparent rounded-[24px] px-8 py-6 font-display font-black text-2xl text-primary focus:bg-white focus:border-accent/10 transition-all outline-none italic shadow-sm"
                            placeholder="GRADE"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 italic">Biometric_Interface_Avatar</label>
                        <span className="text-[9px] font-black bg-accent/10 text-accent px-2 py-0.5 rounded-full italic tracking-widest">ENCRYPTED</span>
                      </div>
                      <div className="flex gap-4 pb-4 overflow-x-auto no-scrollbar scroll-smooth px-1">
                        {AVATARS.map(avatar => (
                          <button
                            key={avatar}
                            onClick={() => updateChild(index, 'avatar', avatar)}
                            className={`shrink-0 rounded-[28px] border-4 transition-all p-1.5 shadow-sm group/avatar ${child.avatar === avatar ? 'border-accent scale-110 bg-accent/5 ring-8 ring-accent/5' : 'border-black/[0.03] opacity-40 hover:opacity-100 bg-white hover:scale-105'}`}
                          >
                            <FFAvatar name={avatar} size="lg" className="shadow-xl" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </FFCard>
                ))}

                <button 
                  onClick={addChild}
                  className="w-full h-32 border-4 border-dashed border-primary/10 rounded-[56px] flex flex-col items-center justify-center gap-2 text-primary/40 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all group shadow-sm active:scale-[0.98]"
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-[20px] flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-inner border border-black/[0.03]">
                    <Plus size={28} strokeWidth={3} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] mt-3 italic">Deploy_New_Operative_Link</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <FFButton variant="outline" className="flex-1 h-24 rounded-[32px] font-display font-black uppercase tracking-[0.3em] text-sm italic hover:bg-primary/5 border-primary/10" onClick={prevStep}>Roll_Back</FFButton>
                <FFButton className="flex-2 h-24 rounded-[32px] font-display font-black uppercase tracking-[0.3em] text-lg shadow-2xl shadow-primary/20 italic group/btn overflow-hidden relative" onClick={nextStep}>
                   <div className="flex items-center justify-center gap-4 relative z-10">
                      <span>Commit_Units</span>
                      <ArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </FFButton>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-14"
            >
              <div className="text-center space-y-6">
                <div className="w-28 h-28 bg-success/5 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-success shadow-inner border border-success/10 rotate-12 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-success/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Heart size={48} strokeWidth={1} className="relative z-10" />
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-black text-primary tracking-tighter leading-none uppercase italic">The <span className="text-success">ELDERS</span></h1>
                <p className="text-gray-400 font-black uppercase italic tracking-widest opacity-60 max-w-sm mx-auto text-[13px]">Establish wisdom nodes for multi-generational synchronization.</p>
              </div>

              <FFCard className="p-12 space-y-10 shadow-3xl shadow-black/[0.01] bg-white/80 backdrop-blur-xl rounded-[56px] border-none group">
                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 italic ml-1">Personnel_Designation [FULL_NAME]</label>
                  <input
                    type="text"
                    value={elder.name}
                    onChange={(e) => setElder({ ...elder, name: e.target.value.toUpperCase() })}
                    className="w-full bg-gray-50/50 border-2 border-transparent rounded-[32px] px-10 py-8 font-display font-black text-3xl text-primary focus:bg-white focus:border-success/10 focus:ring-8 focus:ring-success/5 transition-all outline-none italic placeholder:text-gray-100 shadow-sm"
                    placeholder="EX: NANNA_OPERATIVE"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 italic ml-1">Comms_Vector [PHONE]</label>
                    <input
                      type="tel"
                      value={elder.phone}
                      onChange={(e) => setElder({ ...elder, phone: e.target.value })}
                      className="w-full bg-gray-50/50 border-2 border-transparent rounded-[24px] px-8 py-6 font-display font-black text-2xl text-primary focus:bg-white focus:border-success/10 transition-all outline-none italic tabular-nums shadow-sm"
                      placeholder="+91_000_000"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/40 italic ml-1">Nexus_Role [RELATION]</label>
                    <div className="relative group/select">
                      <select
                        value={elder.linkType}
                        onChange={(e) => setElder({ ...elder, linkType: e.target.value })}
                        className="w-full bg-gray-50/50 border-2 border-transparent rounded-[24px] px-8 py-6 font-display font-black text-2xl text-primary focus:bg-white focus:border-success/10 transition-all outline-none appearance-none italic cursor-pointer shadow-sm"
                      >
                        <option>Grandfather</option>
                        <option>Grandmother</option>
                        <option>Caregiver</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/20 rotate-90 pointer-events-none group-hover/select:text-success transition-colors">
                        <ChevronRight size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </FFCard>

              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <FFButton variant="outline" className="flex-1 h-24 rounded-[32px] font-display font-black uppercase tracking-[0.3em] text-sm italic hover:bg-success/5 border-success/10 text-success" onClick={prevStep}>Roll_Back</FFButton>
                <FFButton className="flex-2 h-24 rounded-[32px] font-display font-black uppercase tracking-[0.3em] text-lg shadow-2xl shadow-success/10 bg-success border-success hover:bg-success/90 italic group/btn overflow-hidden relative" onClick={nextStep}>
                   <div className="flex items-center justify-center gap-4 relative z-10">
                      <span>Integrate_Wisdom</span>
                      <ArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-r from-success via-success-dark to-success opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </FFButton>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-14"
            >
              <div className="text-center space-y-6">
                <div className="w-28 h-28 bg-primary/5 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-primary shadow-inner border border-primary/10 -rotate-12 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Calendar size={48} strokeWidth={1} className="relative z-10" />
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-black text-primary tracking-tighter leading-none uppercase italic">Routine <span className="text-accent underline decoration-accent/10 decoration-8 underline-offset-8">PROTOCOLS</span></h1>
                <p className="text-gray-400 font-black uppercase italic tracking-widest opacity-60 max-w-sm mx-auto text-[13px]">Deploy the baseline temporal routine for the entire unit.</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {[
                  { id: 'Standard School Week', desc: 'MON-FRI academic focus, strictly managed weekends for unit bonding and tactical physical activity.', icon: <GraduationCap size={24} /> },
                  { id: 'Custom Routine', desc: 'A blank slate approach. Build your own proprietary family operational protocol from the ground up.', icon: <Zap size={24} /> }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setWeekTemplate(item.id)}
                    className={`p-10 rounded-[56px] border-4 text-left transition-all relative overflow-hidden group hover:scale-[1.02] shadow-3xl shadow-black/[0.01] ${weekTemplate === item.id ? 'border-accent bg-accent/5 ring-8 ring-accent/5' : 'border-transparent bg-white hover:border-accent/20'}`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${weekTemplate === item.id ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'bg-gray-50 text-gray-300'}`}>
                            {item.icon}
                         </div>
                         <h3 className="font-display font-black text-2xl text-primary tracking-tighter uppercase italic">{item.id}</h3>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${weekTemplate === item.id ? 'bg-accent text-white rotate-0' : 'bg-gray-100 text-gray-200 rotate-45 group-hover:rotate-0'}`}>
                        {weekTemplate === item.id ? <CheckCircle2 size={24} /> : <Plus size={24} />}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 font-bold italic leading-relaxed uppercase tracking-wider opacity-80">{item.desc}</p>
                    {weekTemplate === item.id && (
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent opacity-5 rotate-12" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-6">
                <FFButton variant="outline" className="flex-1 h-24 rounded-[32px] font-display font-black uppercase tracking-[0.3em] text-sm italic hover:bg-primary/5 border-primary/10" onClick={prevStep}>Roll_Back</FFButton>
                <FFButton className="flex-2 h-24 rounded-[32px] font-display font-black uppercase tracking-[0.3em] text-lg shadow-3xl shadow-success/20 bg-success border-success hover:bg-success/90 italic group/btn overflow-hidden relative" onClick={handleComplete}>
                   <div className="flex items-center justify-center gap-6 relative z-10">
                      <span>Commit_Routine</span>
                      <CheckCircle2 size={28} className="group-hover/btn:scale-110 transition-transform" />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-r from-success via-success-dark to-success opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </FFButton>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="space-y-16 text-center"
            >
              <div className="relative inline-block mx-auto">
                 <div className="absolute inset-0 bg-success/20 rounded-full blur-[60px] animate-pulse" />
                 <div className="w-32 h-32 bg-success rounded-[48px] flex items-center justify-center relative z-10 text-white shadow-3xl shadow-success/40 rotate-12 animate-bounce-slow">
                    <CheckCircle2 size={64} strokeWidth={3} />
                 </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl md:text-8xl font-display font-black text-primary tracking-tighter leading-none italic uppercase">Network <span className="text-success">PRIME</span></h1>
                <p className="text-gray-400 font-black uppercase italic tracking-[0.3em] max-w-sm mx-auto text-[14px] leading-relaxed">System synchronization finalized. Your family nexus is now online.</p>
              </div>

              <FFCard className="p-14 space-y-12 shadow-3xl shadow-black/[0.01] bg-white/80 backdrop-blur-xl rounded-[64px] border-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                   <Share2 size={200} />
                </div>
                
                <div className="space-y-4 relative z-10">
                  <span className="text-[12px] font-black uppercase tracking-[0.5em] text-primary/40 italic">ACCESS_GLYPH_PROTOCOL</span>
                  <div className="text-7xl font-display font-black text-primary tracking-[0.3em] italic underline decoration-success/20 underline-offset-8 decoration-8">{joinCode}</div>
                </div>

                <div className="flex justify-center p-12 bg-white rounded-[56px] border-2 border-dashed border-primary/5 w-fit mx-auto shadow-inner group/qr relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                  <div className="transition-transform group-hover/qr:scale-110 duration-700 relative z-10">
                    <QRCodeSVG value={`familyfirst://join?code=${joinCode}`} size={220} includeMargin={true} />
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <FFButton 
                    variant="accent" 
                    className="w-full h-24 rounded-[32px] font-display font-black uppercase tracking-[0.3em] shadow-3xl shadow-accent/20 italic group/share"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Join FamilyFirst Nexus',
                          text: `Synchronize with our family circle on FamilyFirst. Entry Protocol: ${joinCode}`,
                          url: window.location.origin
                        });
                      }
                    }}
                  >
                    <div className="flex items-center justify-center gap-6">
                       <span>Broadcast_Invite</span>
                       <Share2 size={24} className="group-hover/share:rotate-12 transition-transform" />
                    </div>
                  </FFButton>
                  
                  <button 
                    onClick={() => navigate('/parent')}
                    className="text-[11px] font-black text-primary/40 uppercase tracking-[0.6em] italic hover:text-primary transition-colors flex items-center justify-center gap-4 mx-auto group/enter py-4"
                  >
                     INITIALIZE_DASHBOARD_PROTOCOL
                     <ArrowRight size={14} className="group-hover/enter:translate-x-2 transition-transform" />
                  </button>
                </div>
              </FFCard>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-32 text-center space-y-4 opacity-20">
           <div className="flex items-center justify-center gap-4">
              <ShieldCheck size={16} />
              <p className="text-[10px] font-black uppercase tracking-[1em] text-primary italic leading-none">Onboarding Protocol v1.4.2 // Encrypted_Channel_Secure</p>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default FamilySetupWizard;
