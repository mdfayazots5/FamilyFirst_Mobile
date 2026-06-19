import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Phone, ArrowRight, AlertCircle, Globe, ShieldCheck,
  Eye, EyeOff, Zap,
  Shield, Crown, Heart, Star, BookOpen, Users,
} from 'lucide-react';
import FFButton from '../../shared/components/FFButton';
import FFCard from '../../shared/components/FFCard';
import FFBadge from '../../shared/components/FFBadge';
import { AuthRepository } from '../../core/repositories/AuthRepository';
import { useAuth } from '../../core/auth/AuthContext';

// ─── DEV ONLY — REMOVE BEFORE PRODUCTION ─────────────────────────────────────
// One-tap role login for testing. Seeded accounts, password 123456.
// See memory: project_temp_dev_login.md
const DEV_ROLES = [
  { label: 'Super Admin',   phone: '9000000001', role: 1, icon: Shield,   bg: 'bg-purple-600',    text: 'text-white' },
  { label: 'Family Admin',  phone: '9000000002', role: 2, icon: Crown,    bg: 'bg-[#1A2E4A]',     text: 'text-white' },
  { label: 'Parent',        phone: '9000000003', role: 3, icon: Heart,    bg: 'bg-[#2D6A4F]',     text: 'text-white' },
  { label: 'Child',         phone: '9000000004', role: 4, icon: Star,     bg: 'bg-[#C8922A]',     text: 'text-white' },
  { label: 'Teacher',       phone: '9000000005', role: 5, icon: BookOpen, bg: 'bg-blue-600',      text: 'text-white' },
  { label: 'Elder',         phone: '9000000006', role: 6, icon: Users,    bg: 'bg-orange-500',    text: 'text-white' },
] as const;
// ─────────────────────────────────────────────────────────────────────────────

const PhoneLoginScreen: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devLoadingRole, setDevLoadingRole] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { handleAuthResponse } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError('Invalid phone number. 10 digits required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const authResponse = await AuthRepository.loginWithPassword(phoneNumber, countryCode, password);
      handleAuthResponse(authResponse);
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid phone number or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // DEV ONLY — one-tap role login
  const handleDevLogin = async (phone: string, roleInt: number) => {
    setDevLoadingRole(roleInt);
    setError(null);
    try {
      const authResponse = await AuthRepository.loginWithPassword(phone, '+91', '123456');
      handleAuthResponse(authResponse);
      navigate('/home', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Dev login failed.');
    } finally {
      setDevLoadingRole(null);
    }
  };

  const countries = [
    { code: '+91',  label: 'IN' },
    { code: '+971', label: 'AE' },
    { code: '+966', label: 'SA' },
    { code: '+1',   label: 'US' },
    { code: '+44',  label: 'GB' },
  ];

  return (
    <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.02] rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.02] rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-md w-full relative z-10 space-y-4"
      >
        {/* ── DEV ONLY — Quick Role Login ──────────────────────────────────── */}
        <div className="rounded-[32px] border-2 border-dashed border-amber-400/60 bg-amber-50/80 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-700">
              Dev Testing — Quick Login
            </span>
            <span className="ml-auto text-[9px] font-bold text-amber-400 uppercase tracking-widest">
              Remove before prod
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEV_ROLES.map(({ label, phone, role, icon: Icon, bg, text }) => (
              <button
                key={role}
                onClick={() => handleDevLogin(phone, role)}
                disabled={devLoadingRole !== null}
                className={`${bg} ${text} rounded-[16px] p-3 flex items-center gap-3 active:scale-95 transition-transform disabled:opacity-50 text-left`}
              >
                <div className="shrink-0 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  {devLoadingRole === role ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Icon size={16} strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wide leading-none">{label}</p>
                  <p className="text-[9px] font-mono opacity-70 mt-0.5">{phone} / 123456</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* ── END DEV ONLY ─────────────────────────────────────────────────── */}

        <FFCard className="p-10 lg:p-14 shadow-3xl shadow-primary/5 rounded-[64px] border-none">
          <div className="flex justify-center mb-12">
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary shadow-inner border border-primary/5"
              >
                <Phone size={44} strokeWidth={1} />
              </motion.div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>

          <header className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FFBadge variant="primary" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">
                IDENTITY_HUB
              </FFBadge>
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            </div>
            <h1 className="text-4xl font-display font-black text-primary mb-4 uppercase italic tracking-tighter leading-none">
              Identity <span className="text-accent underline decoration-accent/20 decoration-4 underline-offset-4">LINK</span>
            </h1>
            <p className="text-[13px] text-gray-400 font-bold leading-relaxed max-w-[280px] mx-auto uppercase tracking-wide opacity-60">
              Synchronize your device with the primary <span className="text-primary">Family_Node-01</span>
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Phone */}
            <div className="space-y-4">
              <label className="block px-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 italic">
                Phone Number
              </label>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-gray-50/50 border-2 border-transparent rounded-[24px] px-8 py-5 font-black text-primary focus:outline-none focus:border-accent/10 focus:bg-white transition-all cursor-pointer text-lg appearance-none shadow-sm"
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
                    ))}
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-primary/20">
                    <Globe size={18} />
                  </div>
                </div>
                <input
                  type="tel"
                  placeholder="000 000 0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-gray-50/50 border-2 border-transparent rounded-[24px] px-8 py-6 font-display font-black text-3xl text-primary placeholder:text-gray-100 tracking-tighter focus:outline-none focus:border-accent/10 focus:bg-white transition-all shadow-sm italic"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block px-2 text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 italic">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50/50 border-2 border-transparent rounded-[24px] px-8 py-5 font-black text-xl text-primary placeholder:text-gray-200 focus:outline-none focus:border-accent/10 focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30 hover:text-accent transition-colors p-2"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 text-alert bg-alert/5 p-5 rounded-[24px] text-[13px] font-black leading-relaxed border-2 border-alert/10 uppercase italic"
              >
                <AlertCircle size={20} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="pt-4">
              <FFButton
                type="submit"
                className="w-full h-24 rounded-[32px] shadow-3xl shadow-primary/20 group/btn overflow-hidden relative"
                isLoading={isLoading}
              >
                <div className="flex items-center justify-center gap-4 relative z-10 font-display font-black text-xl uppercase italic tracking-widest">
                  <span>Sign In</span>
                  <ArrowRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </FFButton>
            </div>
          </form>

          <div className="mt-14 pt-12 border-t border-black/[0.03] text-center space-y-6">
            <p className="text-[12px] text-gray-400 font-black uppercase tracking-widest italic">
              Child or Elder?
            </p>
            <button
              onClick={() => navigate('/child-login')}
              className="px-10 py-4 bg-gray-50 rounded-[20px] text-accent font-black text-[12px] uppercase italic tracking-[0.2em] hover:bg-accent hover:text-white transition-all shadow-sm active:scale-95"
            >
              Access via PIN_Protocol
            </button>
          </div>
        </FFCard>

        <footer className="mt-2 text-center space-y-2 opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[1em] text-primary italic leading-none">Secure Auth Gateway v4.4.2</p>
          <p className="text-[8px] font-black uppercase tracking-[0.5em] text-primary/60 italic">GLOBAL_PROTECTION_ENABLED</p>
        </footer>
      </motion.div>
    </div>
  );
};

export default PhoneLoginScreen;
