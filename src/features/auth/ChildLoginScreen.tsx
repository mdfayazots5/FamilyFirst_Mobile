import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Baby, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Shield } from 'lucide-react';
import FFButton from '../../shared/components/FFButton';
import FFCard from '../../shared/components/FFCard';
import FFBadge from '../../shared/components/FFBadge';
import PinPad from './components/PinPad';
import { AuthRepository } from '../../core/repositories/AuthRepository';
import { useAuth } from '../../core/auth/AuthContext';
import FFAvatar from '../../shared/components/FFAvatar';

type Step = 'JOIN_CODE' | 'NAME_PICKER' | 'PIN_PAD';

const ChildLoginScreen: React.FC = () => {
  const [step, setStep] = useState<Step>('JOIN_CODE');
  const [joinCode, setJoinCode] = useState('');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { handleAuthResponse } = useAuth();

  const handleVerifyJoinCode = async () => {
    if (joinCode.length < 4) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await AuthRepository.getChildrenByJoinCode(joinCode);
      setChildren(data);
      setStep('NAME_PICKER');
    } catch (err: any) {
      setError(err.message || 'Invalid sequence detected.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChild = (child: any) => {
    setSelectedChild(child);
    setStep('PIN_PAD');
  };

  const handlePinSubmit = async (finalPin: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthRepository.verifyPin(selectedChild.id, finalPin);
      handleAuthResponse(response);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication mismatch. Retry PIN.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const onPinChange = (newPin: string) => {
    setPin(newPin);
    if (newPin.length === 4) {
      handlePinSubmit(newPin);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
       {/* Background Tactical Elements */}
       <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
       <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent via-primary to-accent opacity-20" />

       <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full relative z-10"
      >
        <FFCard className="p-10 lg:p-14 shadow-3xl shadow-primary/5 min-h-[700px] flex flex-col rounded-[64px] border-none group bg-white/80 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-12">
            <button 
              onClick={() => step === 'JOIN_CODE' ? navigate('/phone-login') : setStep(step === 'PIN_PAD' ? 'NAME_PICKER' : 'JOIN_CODE')}
              className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 hover:text-primary hover:bg-white border border-black/[0.03] transition-all active:scale-95 shadow-sm group/back"
            >
              <ArrowLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
            </button>
            <div className="relative">
              <div className="w-20 h-20 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary shadow-inner border border-primary/5 group-hover:rotate-12 transition-transform duration-700">
                <Baby size={40} strokeWidth={1} />
              </div>
              <motion.div 
                 animate={{ opacity: [1, 0.4, 1] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-4 border-white" 
              />
            </div>
            <div className="w-14" />
          </div>

          <AnimatePresence mode="wait">
            {step === 'JOIN_CODE' && (
              <motion.div
                key="join-code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <header className="text-center mb-14">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none outline-dashed outline-1 outline-accent/40">LINK_PROTOCOL</FFBadge>
                  </div>
                  <h1 className="text-4xl font-display font-black text-primary mb-4 uppercase italic tracking-tighter leading-none">JOIN <span className="text-accent underline decoration-accent/10 underline-offset-4 decoration-4">Family</span></h1>
                  <p className="text-[13px] text-gray-400 font-bold leading-relaxed max-w-[280px] mx-auto uppercase tracking-wide opacity-60">
                    Input the synchronization sequence provided by your <span className="text-primary">Family_Head</span>
                  </p>
                </header>
                
                <div className="relative group/input">
                  <input
                    type="text"
                    placeholder="EX: ALPHA01"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-gray-50/50 border-2 border-transparent rounded-[32px] px-8 py-8 text-center text-5xl font-display font-black text-primary placeholder:text-gray-100 focus:outline-none focus:border-accent/10 focus:bg-white transition-all mb-12 tracking-widest italic shadow-sm"
                    autoFocus
                  />
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                     <p className="text-[9px] font-black text-accent uppercase tracking-[0.4em] italic">AWAITING_SEQUENCE_VALIDATION</p>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-4 text-alert bg-alert/5 p-5 rounded-[24px] text-[13px] font-black mb-10 border-2 border-alert/10 uppercase italic"
                  >
                    <AlertCircle size={20} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                <FFButton
                  onClick={handleVerifyJoinCode}
                  className="w-full mt-auto h-24 rounded-[32px] shadow-3xl shadow-primary/10 group/btn overflow-hidden relative"
                  isLoading={isLoading}
                  disabled={joinCode.length < 4}
                >
                  <div className="flex items-center justify-center gap-4 relative z-10 font-display font-black text-xl uppercase italic tracking-widest">
                    <span>Locate Profile</span>
                    <ArrowRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </FFButton>
              </motion.div>
            )}

            {step === 'NAME_PICKER' && (
              <motion.div
                key="name-picker"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <header className="text-center mb-14">
                  <FFBadge variant="accent" size="sm" className="mb-4 font-black uppercase italic tracking-widest">ENTITY_SELECTION</FFBadge>
                  <h1 className="text-4xl font-display font-black text-primary mb-4 uppercase italic tracking-tighter leading-none">Who is <span className="text-accent">ONLINE?</span></h1>
                  <p className="text-[13px] text-gray-400 font-bold uppercase tracking-wide opacity-60">Identify your operative status</p>
                </header>

                <div className="space-y-6">
                  {children.map((child, idx) => (
                    <motion.button
                      key={child.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleSelectChild(child)}
                      className="w-full flex items-center justify-between p-6 bg-gray-50/50 hover:bg-white hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5 rounded-[32px] border-2 border-transparent hover:border-accent/10 transition-all group/entity"
                    >
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <FFAvatar name={child.name} size="lg" className="shadow-xl ring-4 ring-white group-hover/entity:scale-110 transition-transform" />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white shadow-sm" />
                        </div>
                        <div className="text-left">
                           <span className="text-2xl font-display font-black text-primary uppercase italic tracking-tighter group-hover/entity:text-accent transition-colors block leading-none">{child.name}</span>
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic mt-2 block">ACTIVE_OPERATIVE</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-[18px] bg-white border border-black/[0.03] flex items-center justify-center text-gray-100 group-hover/entity:text-accent group-hover/entity:rotate-12 transition-all shadow-inner">
                        <CheckCircle2 size={28} strokeWidth={1} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'PIN_PAD' && (
              <motion.div
                key="pin-pad"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <header className="text-center mb-14">
                  <div className="inline-block relative mb-8">
                    <motion.div 
                      layoutId={`avatar-${selectedChild.id}`}
                      className="relative z-10"
                    >
                      <FFAvatar name={selectedChild.name} size="xl" className="shadow-2xl ring-[8px] ring-white" />
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -inset-6 bg-accent/20 rounded-full blur-xl pointer-events-none" 
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl z-20">
                      <ShieldCheck size={20} />
                    </div>
                  </div>
                  <h1 className="text-3xl font-display font-black text-primary mb-2 uppercase italic tracking-tighter">Hi, {selectedChild.name}</h1>
                  <div className="flex items-center justify-center gap-3">
                     <span className="text-[10px] font-black text-success uppercase tracking-[0.4em] italic">VERIFICATION_STATION</span>
                     <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
                  </div>
                </header>

                <div className="flex justify-center gap-6 mb-16">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{ 
                        scale: pin.length > i ? 1.2 : 1,
                        backgroundColor: pin.length > i ? '#FFAE00' : 'rgba(0,0,0,0.05)',
                        borderColor: pin.length > i ? '#FFAE00' : 'rgba(0,0,0,0.05)'
                      }}
                      className="w-5 h-5 rounded-full transition-all duration-300 border-2 shadow-sm"
                    />
                  ))}
                </div>

                {error && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-alert text-center text-[12px] font-black mb-10 bg-alert/5 p-4 rounded-[20px] border-2 border-alert/10 uppercase italic"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="mt-auto pb-6">
                  <PinPad pin={pin} onPinChange={onPinChange} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </FFCard>
        
        <footer className="mt-12 text-center space-y-3 opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[1em] text-primary italic leading-none">Junior Security Gateway v4.2.1</p>
          <div className="flex items-center justify-center gap-4">
             <Shield size={10} className="text-primary" />
             <p className="text-[8px] font-black uppercase tracking-[0.5em] text-primary/60 italic">ENCRYPTED_ENTRY_POINT</p>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

export default ChildLoginScreen;
