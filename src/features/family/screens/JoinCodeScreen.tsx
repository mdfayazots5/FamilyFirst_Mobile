import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  QrCode, 
  Share2, 
  RefreshCw, 
  ArrowLeft,
  Copy,
  Check,
  Users,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import { FamilyRepository } from '../repositories/FamilyRepository';
import { useAuth } from '../../../core/auth/AuthContext';

const JoinCodeScreen: React.FC = () => {
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCode = async () => {
      if (!user?.familyId) return;
      try {
        const data = await FamilyRepository.getJoinCode(user.familyId);
        setJoinCode(data.joinCode);
      } catch (error) {
        console.error('Failed to fetch join code', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCode();
  }, [user?.familyId]);

  const handleRegenerate = async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await FamilyRepository.regenerateJoinCode(user.familyId);
      setJoinCode(data.joinCode);
    } catch (error) {
      console.error('Failed to regenerate code', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(joinCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join FamilyFirst Nexus',
        text: `Synchronize with our family circle on FamilyFirst. Entry Protocol: ${joinCode}`,
        url: window.location.origin
      });
    }
  };

  if (isLoading && !joinCode) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFCFB]">
        <RefreshCw size={40} className="text-primary animate-spin mb-6" />
        <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em] italic">FETCHING_AUTHORIZATION_GLYPH...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] p-8 md:p-12 lg:p-24 relative overflow-hidden">
      {/* Background Tactical Elements */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '60px 60px' }} />

      <header className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
          >
            <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
               <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none outline-dashed outline-1 outline-accent/40">SECURITY_MODULE</FFBadge>
               <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
              Access Authorization
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-12">
        <FFCard className="relative p-12 md:p-16 space-y-12 border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[64px] group overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
             <Shield size={200} />
          </div>

          <div className="text-center space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 italic">FAMILY_JOIN_GLYPH</span>
            <div className="flex items-center justify-center gap-6">
              <div className="text-6xl md:text-7xl font-display font-black text-primary tracking-[0.3em] italic underline decoration-accent/10 underline-offset-[12px] decoration-8">{joinCode}</div>
              <button 
                onClick={handleCopy}
                className={`w-14 h-14 rounded-2xl transition-all border flex items-center justify-center shadow-sm active:scale-90 ${isCopied ? 'bg-success/5 border-success/20 text-success' : 'bg-gray-50 border-black/[0.03] text-gray-300 hover:text-primary'}`}
              >
                {isCopied ? <Check size={24} /> : <Copy size={24} />}
              </button>
            </div>
          </div>

          <div className="flex justify-center p-10 bg-white rounded-[48px] border-2 border-dashed border-primary/5 shadow-inner relative overflow-hidden group/qr">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/qr:opacity-100 transition-opacity" />
            <div className="relative z-10 transition-transform group-hover/qr:scale-110 duration-700">
              <QRCodeSVG value={`familyfirst://join?code=${joinCode}`} size={220} includeMargin={true} />
            </div>
          </div>

          <div className="flex gap-6">
            <FFButton 
              variant="accent" 
              className="flex-3 h-20 rounded-[28px] font-display font-black uppercase tracking-[0.3em] italic shadow-2xl shadow-accent/20 group/share" 
              icon={<Share2 size={24} className="group-hover/share:rotate-12 transition-transform" />}
              onClick={handleShare}
            >
              Broadcast_Protocol
            </FFButton>
            <button 
              className={`flex-1 h-20 rounded-[28px] border-2 border-primary/10 bg-white transition-all flex items-center justify-center shadow-sm active:scale-95 group/regen ${isLoading ? 'opacity-50' : 'hover:border-primary hover:bg-primary/5'}`}
              onClick={handleRegenerate}
              disabled={isLoading}
            >
              <RefreshCw size={24} className={`text-primary/40 group-hover/regen:text-primary transition-colors ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </FFCard>

        <section className="bg-white/60 backdrop-blur-xl rounded-[56px] p-12 border-none shadow-3xl shadow-black/[0.01] space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-accent/20" />
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                <ShieldCheck size={20} strokeWidth={2.5} />
             </div>
             <h3 className="font-display font-black text-2xl text-primary uppercase italic tracking-tighter">Security_Directives</h3>
          </div>
          <ul className="space-y-6">
            {[
              { icon: <Users size={20} />, text: 'Distribute this glyph only to authorized personnel within your family nexus.' },
              { icon: <QrCode size={20} />, text: ' operatives can scan the QR glyph or input the sequence manually during initialization.' },
              { icon: <Shield size={20} />, text: 'Regenerating the glyph will immediately invalidate the previous node for enhanced security.' }
            ].map((item, i) => (
              <li key={i} className="flex gap-6 text-[13px] text-gray-500 font-bold italic uppercase tracking-wider leading-relaxed">
                <div className="mt-1 text-accent shrink-0">{item.icon}</div>
                <span className="opacity-80">{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className="text-center opacity-30 pt-10">
           <p className="text-[10px] font-black uppercase tracking-[0.8em] text-primary italic leading-none">Security Authorization v1.4.2 // Encrypted_Data_Stream</p>
        </footer>
      </div>
    </div>
  );
};

export default JoinCodeScreen;
