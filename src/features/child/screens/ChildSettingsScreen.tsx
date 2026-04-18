import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  Lock, 
  Volume2, 
  Languages, 
  Gift, 
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Settings2,
  Cpu,
  Zap,
  ShieldCheck,
  Smartphone,
  Sparkles,
  RefreshCcw,
  Palette,
  Fingerprint,
  Mic2,
  BellRing,
  Trash2,
  ArrowRight,
  Box
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFBadge from '../../../shared/components/FFBadge';

const ChildSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_1');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const [showPinFlow, setShowPinFlow] = useState(false);
  const [pinStep, setPinStep] = useState(1); // 1: Old, 2: New, 3: Confirm
  const [pinValues, setPinValues] = useState({ old: '', new: '', confirm: '' });
  const [pinError, setPinError] = useState('');

  const [inputPin, setInputPin] = useState('');

  const avatars = Array.from({ length: 10 }, (_, i) => `avatar_${i + 1}`);

  const handlePinSubmit = (val: string) => {
    const currentInput = inputPin + val;
    setInputPin(currentInput);

    if (currentInput.length === 4) {
      if (pinStep === 1) {
        if (currentInput === '1234') { // Demo old PIN
          setPinStep(2);
          setPinValues({ ...pinValues, old: currentInput });
          setInputPin('');
          setPinError('');
        } else {
          setPinError('INVALID_SOURCE_PIN');
          setInputPin('');
        }
      } else if (pinStep === 2) {
        setPinStep(3);
        setPinValues({ ...pinValues, new: currentInput });
        setInputPin('');
      } else if (pinStep === 3) {
        if (currentInput === pinValues.new) {
          setShowPinFlow(false);
          setPinStep(1);
          setPinValues({ old: '', new: '', confirm: '' });
          setInputPin('');
        } else {
          setPinError('SYNC_MISMATCH_RETRY');
          setInputPin('');
        }
      }
    }
  };

  const handleSoundToggle = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* Environment Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/20 rotate-3 transform hover:rotate-0 transition-transform duration-500 relative overflow-hidden group">
               <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 animate-pulse" />
               <Settings2 size={40} className="relative z-10 group-hover:rotate-90 transition-transform duration-1000" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">CORE_CALIBRATION</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">UNIT_STATION_v2.1.0</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Environment
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

      <main className="max-w-5xl mx-auto p-12 lg:p-24 space-y-24 pt-16">
        {/* Identity Calibration */}
        <section className="space-y-12">
           <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Fingerprint size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">IDENTITY_CALIBRATION</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <FFCard className="p-16 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[72px] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none -rotate-12 translate-x-12 translate-y-[-20%]">
                <Palette size={400} strokeWidth={1} />
             </div>
             
             <div className="relative z-10 space-y-12">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-500">
                     <Palette size={24} />
                  </div>
                  <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">Visual_Mask_Selector</h4>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-5 gap-10">
                  {avatars.map((avatar, idx) => (
                    <motion.button
                      key={avatar}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative aspect-square rounded-[44px] overflow-hidden border-4 transition-all duration-500 shadow-2xl ${
                        selectedAvatar === avatar ? 'border-amber-400 shadow-amber-400/30 scale-110 z-10 p-1 bg-amber-400/5' : 'border-transparent grayscale opacity-40 hover:opacity-100 hover:grayscale-0'
                      }`}
                    >
                      <FFAvatar name={avatar} size="lg" className="w-full h-full rounded-[38px]" />
                      {selectedAvatar === avatar && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <motion.div 
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-amber-400 text-white rounded-full p-2 shadow-2xl"
                           >
                            <Check size={24} strokeWidth={4} />
                           </motion.div>
                        </div>
                      )}
                    </motion.button>
                  ))}
               </div>
             </div>
          </FFCard>
        </section>

        {/* System Protocols */}
        <section className="space-y-12">
           <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Cpu size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">SYSTEM_PROTOCOLS</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 gap-10">
            {/* PIN Phase */}
            <FFCard 
              className="group p-10 flex items-center justify-between cursor-pointer border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] overflow-hidden relative transition-all hover:bg-indigo-50/30"
              onClick={() => {
                setShowPinFlow(true);
                setPinStep(1);
                setPinError('');
                setInputPin('');
              }}
            >
              <div className="absolute right-0 bottom-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity translate-x-12 translate-y-12 group-hover:scale-110 duration-1000">
                 <ShieldCheck size={280} strokeWidth={1} />
              </div>
              <div className="flex items-center gap-10 relative z-10">
                <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-indigo-500 shadow-3xl shadow-black/[0.02] group-hover:bg-indigo-500 group-hover:text-white transition-all duration-700 transform group-hover:rotate-12 border border-black/[0.01]">
                   <Fingerprint size={40} />
                </div>
                <div>
                   <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-3">Neural Authorization</h4>
                   <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.3em] italic leading-none">RECALIBRATE_ACCESS_PIN_MATRIX</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-[24px] bg-gray-50 flex items-center justify-center text-gray-200 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <ChevronRight size={32} />
              </div>
            </FFCard>

            {/* Acoustic Logic */}
            <FFCard className="p-10 flex items-center justify-between border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] group transition-all hover:bg-gray-50/50">
              <div className="flex items-center gap-10">
                <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-3xl transition-all duration-700 ${soundEnabled ? 'bg-success/5 text-success' : 'bg-gray-100 text-gray-300'}`}>
                  <motion.div animate={soundEnabled ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
                    {soundEnabled ? <BellRing size={40} /> : <Volume2 size={40} />}
                  </motion.div>
                </div>
                <div>
                   <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-3">Signal Feedback</h4>
                   <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.3em] italic leading-none">{soundEnabled ? 'ACOUSTIC_STREAM_ENABLED' : 'SILENT_MODE_ENFORCED'}</p>
                </div>
              </div>
              <button 
                onClick={handleSoundToggle}
                className={`w-32 h-16 rounded-[32px] transition-all relative p-2 shadow-inner border-4 focus:outline-none ${soundEnabled ? 'bg-success border-success/10' : 'bg-gray-200 border-black/5'}`}
              >
                <motion.div 
                  animate={{ x: soundEnabled ? 64 : 0 }}
                  className="w-12 h-12 bg-white rounded-[26px] shadow-2xl flex items-center justify-center transform active:scale-95 transition-transform"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${soundEnabled ? 'bg-success flex' : 'hidden'}`} />
                  {!soundEnabled && <X size={16} className="text-gray-300" strokeWidth={3} />}
                </motion.div>
              </button>
            </FFCard>

            {/* Linguistic Matrix */}
            <FFCard className="p-10 flex items-center justify-between border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[56px] group transition-all hover:bg-gray-50/50">
              <div className="flex items-center gap-10">
                <div className="w-24 h-24 bg-accent/5 rounded-[32px] flex items-center justify-center text-accent shadow-3xl shadow-accent/5">
                  <Languages size={40} />
                </div>
                <div>
                   <h4 className="text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-none mb-3">Universal Translate</h4>
                   <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.3em] italic leading-none">{language.toUpperCase()}_MAPPING_v2.4_READY</p>
                </div>
              </div>
              <div className="relative group/select">
                 <select 
                   className="bg-gray-50 border border-black/[0.05] rounded-[28px] px-10 h-18 text-[12px] font-black text-primary uppercase tracking-[0.2em] focus:outline-none focus:ring-8 focus:ring-accent/5 cursor-pointer appearance-none min-w-[200px] pr-14 italic hover:bg-white transition-all shadow-inner"
                   value={language}
                   onChange={(e) => setLanguage(e.target.value)}
                 >
                   <option>English_US</option>
                   <option>Hindi_IN</option>
                   <option>Tamil_IN</option>
                   <option>Telugu_IN</option>
                   <option>Marathi_IN</option>
                 </select>
                 <ChevronRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-primary opacity-20 rotate-90 pointer-events-none" />
              </div>
            </FFCard>
          </div>
        </section>

        {/* Neural Proposals */}
        <section className="space-y-12">
           <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Sparkles size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic leading-none">NEURAL_PROPOSALS</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <FFCard 
            className="group p-12 flex items-center justify-between cursor-pointer border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[64px] hover:bg-primary/[0.01] transition-all relative overflow-hidden"
            onClick={() => navigate('/rewards')}
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none group-hover:scale-125 transition-transform duration-2000">
               <Gift size={240} strokeWidth={1} />
            </div>
            <div className="flex items-center gap-10 relative z-10">
              <div className="w-28 h-28 bg-amber-50 rounded-[40px] flex items-center justify-center text-amber-500 shadow-3xl shadow-amber-500/5 group-hover:bg-amber-400 group-hover:text-white transition-all duration-700 transform group-hover:rotate-12 border border-amber-100/20">
                <Sparkles size={48} />
              </div>
              <div className="space-y-3">
                 <h4 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter leading-none group-hover:text-accent transition-colors">Asset Proposal</h4>
                 <p className="text-[12px] text-gray-400 font-black uppercase tracking-[0.3em] italic leading-none">SUGGEST_NEW_EQUIPMENT_LOADOUTS</p>
              </div>
            </div>
            <div className="w-20 h-20 rounded-[32px] bg-primary text-white flex items-center justify-center shadow-3xl shadow-primary/30 transition-all active:scale-90 group-hover:translate-x-2">
               <ArrowRight size={36} strokeWidth={3} />
            </div>
          </FFCard>
        </section>
      </main>

      {/* PIN Decryption Overlay */}
      <AnimatePresence>
        {showPinFlow && (
          <>
             <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPinFlow(false)}
              className="fixed inset-0 bg-primary/40 transition-all backdrop-blur-2xl z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[80px] z-[70] p-16 lg:p-24 shadow-3xl border-t border-black/[0.03]"
            >
              <div className="max-w-xl mx-auto space-y-20 py-8">
                <div className="text-center space-y-8">
                   <div className="flex items-center justify-center gap-6">
                    <FFBadge variant="accent" size="sm" className="font-black px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl">AUTH_PILLAR</FFBadge>
                    <div className="h-px w-16 bg-gray-100" />
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] italic leading-none">{pinStep}_OF_3 VERIFIED</p>
                  </div>
                  <h3 className="text-6xl md:text-8xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">
                    {pinStep === 1 ? 'Decrypt_Source' : pinStep === 2 ? 'Upload_Init' : 'Verify_Pulse'}
                  </h3>
                </div>

                {pinError && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.9, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     className="bg-alert p-10 rounded-[44px] flex items-center gap-10 border-4 border-white shadow-3xl shadow-alert/30"
                  >
                    <div className="w-16 h-16 rounded-[20px] bg-white/20 flex items-center justify-center text-white shrink-0">
                       <ShieldCheck size={40} />
                    </div>
                    <p className="text-xl font-black text-white uppercase tracking-[0.1em] italic leading-tight">{pinError}</p>
                  </motion.div>
                )}

                <div className="flex justify-center gap-12">
                  {[1, 2, 3, 4].map(i => (
                    <motion.div 
                      key={i} 
                      animate={{ 
                        scale: i <= inputPin.length ? 1.8 : 1,
                        backgroundColor: i <= inputPin.length ? '#1A1A1A' : '#F3F4F6',
                        borderColor: i <= inputPin.length ? '#1A1A1A' : '#E5E7EB'
                      }}
                      className="w-8 h-8 rounded-full border-4 shadow-inner transition-all duration-300"
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-8 px-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'ABORT', 0, 'DEL'].map((num, i) => (
                    <button
                      key={i}
                      disabled={num === ''}
                      onClick={() => {
                        if (num === 'DEL') {
                           setInputPin(inputPin.slice(0, -1));
                           return;
                        }
                        if (num === 'ABORT') {
                           setShowPinFlow(false);
                           return;
                        }
                        handlePinSubmit(num.toString());
                      }}
                      className={`h-28 md:h-32 rounded-[48px] flex items-center justify-center text-5xl font-display font-black transition-all shadow-3xl shadow-black/[0.01] active:scale-90 relative overflow-hidden group/key ${
                        num === 'ABORT' ? 'bg-gray-50 text-[11px] text-gray-400 uppercase tracking-widest' :
                        num === 'DEL' ? 'bg-gray-50 text-alert' :
                        'bg-[#FDFCFB] text-primary border border-black/[0.02] hover:bg-white hover:text-accent active:bg-primary active:text-white'
                      }`}
                    >
                      {num === 'DEL' ? <Trash2 size={40} /> : num}
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-primary/10 opacity-0 group-hover/key:opacity-100" />
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center justify-center gap-6 text-[10px] font-black text-gray-200 uppercase tracking-[0.6em] italic">
                   <Lock size={14} />
                   SECURE_NEURAL_ENCRYPTION_v4.2.0_ENABLED
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

       <footer className="text-center space-y-8 pt-48 pb-20 px-8">
         <div className="flex items-center justify-center gap-6 text-primary/10">
            <div className="h-px w-24 bg-current" />
            <div className="p-4 rounded-3xl border-2 border-current">
               <Cpu size={32} />
            </div>
            <div className="h-px w-24 bg-current" />
         </div>
         <p className="text-[12px] text-gray-400 font-black uppercase tracking-[1em] italic leading-relaxed">ENVIRONMENT_STABLE // Station Oversight Interface v2.1.0</p>
      </footer>
    </div>
  );
};

export default ChildSettingsScreen;
