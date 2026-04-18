import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import FFButton from '../../shared/components/FFButton';
import FFCard from '../../shared/components/FFCard';
import FFBadge from '../../shared/components/FFBadge';
import { AuthRepository } from '../../core/repositories/AuthRepository';
import { useAuth } from '../../core/auth/AuthContext';

const OtpVerifyScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleAuthResponse } = useAuth();
  const { phoneNumber, countryCode, otpToken } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!phoneNumber) {
      navigate('/phone-login');
    }
  }, [phoneNumber, navigate]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthRepository.verifyOtp(phoneNumber, otpToken, code);
      handleAuthResponse(response);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Verification rejected. Check logic.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.02] rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full relative z-10"
      >
        <FFCard className="p-10 lg:p-14 shadow-3xl shadow-primary/5 rounded-[64px] border-none group bg-white/80 backdrop-blur-xl">
          <button 
            onClick={() => navigate('/phone-login')}
            className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 hover:text-primary hover:bg-white border border-black/[0.03] transition-all active:scale-95 shadow-sm group/back mb-12"
          >
            <ArrowLeft size={24} className="group-hover/back:-translate-x-1 transition-transform" />
          </button>

          <div className="flex justify-center mb-10">
            <div className="relative">
              <div className="w-24 h-24 bg-accent/5 rounded-[32px] flex items-center justify-center text-accent shadow-inner border border-accent/5 -rotate-6">
                <ShieldCheck size={48} strokeWidth={1} />
              </div>
              <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute -inset-4 bg-accent/10 rounded-full blur-xl pointer-events-none" 
              />
            </div>
          </div>

          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
               <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none outline-dashed outline-1 outline-accent/40">VERIFICATION_LAYER</FFBadge>
            </div>
            <h1 className="text-4xl font-display font-black text-primary mb-4 uppercase italic tracking-tighter leading-none">Secure <span className="text-accent underline decoration-accent/10 underline-offset-4 decoration-4">Entry</span></h1>
            <p className="text-[13px] text-gray-400 font-bold leading-relaxed max-w-[280px] mx-auto uppercase tracking-wide opacity-60">
              Dispatched 6-digit cluster to <br/>
              <span className="text-primary font-black tracking-tight underline decoration-primary/10 decoration-2 underline-offset-4">({countryCode}) {phoneNumber}</span>
            </p>
          </header>

          <div className="flex justify-between gap-3 mb-12">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-full h-18 bg-gray-50/50 border-2 border-transparent rounded-[20px] text-center text-3xl font-display font-black text-primary focus:outline-none focus:border-accent/10 focus:bg-white transition-all shadow-sm italic placeholder:text-gray-100"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-4 text-alert bg-alert/5 p-5 rounded-[24px] text-[13px] font-black mb-10 border-2 border-alert/10 uppercase italic"
            >
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <FFButton
            onClick={() => handleVerify(otp.join(''))}
            className="w-full h-24 rounded-[32px] shadow-3xl shadow-primary/20 group/btn overflow-hidden relative"
            isLoading={isLoading}
            disabled={otp.some(d => !d)}
          >
            <div className="flex items-center justify-center gap-4 relative z-10 font-display font-black text-xl uppercase italic tracking-widest">
              <span>Validate Cluster</span>
              <ShieldCheck size={24} className="group-hover/btn:scale-110 transition-transform" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </FFButton>

          <div className="mt-14 text-center">
            <button className="flex flex-col items-center gap-4 mx-auto group">
               <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:text-accent group-hover:bg-accent/5 transition-all shadow-sm">
                  <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
               </div>
               <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] italic group-hover:text-primary transition-colors">Re-transmit Sequence</span>
            </button>
          </div>
        </FFCard>
        
        <footer className="mt-12 text-center space-y-3 opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[1em] text-primary italic leading-none">Biometric Fallback Protocol Active</p>
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-primary/60 italic">AUTHORIZATION_CHAMBER_v4.4.2</p>
        </footer>
      </motion.div>
    </div>
  );
};

export default OtpVerifyScreen;
