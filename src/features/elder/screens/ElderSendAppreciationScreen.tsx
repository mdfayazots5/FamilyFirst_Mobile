import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Mic, 
  Send, 
  X, 
  CheckCircle2,
  Square,
  Play,
  Trash2,
  Heart,
  Star
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { ElderRepository, GrandchildStatus } from '../repositories/ElderRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFAvatar from '../../../shared/components/FFAvatar';

const ElderSendAppreciationScreen: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [child, setChild] = useState<GrandchildStatus | null>(null);
  const [message, setMessage] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Elder font size setting
  const fontSizeScale = localStorage.getItem('elderFontSize') || '1.3';
  const scale = parseFloat(fontSizeScale);

  useEffect(() => {
    const fetchChild = async () => {
      if (!user?.familyId || !childId) return;
      const children = await ElderRepository.getGrandchildren(user.familyId);
      const target = children.find(c => c.id === childId);
      setChild(target || null);
    };
    fetchChild();
  }, [user?.familyId, childId]);

  const stickers = [
    { emoji: '🙏', label: 'Blessings' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '🌟', label: 'Star' },
    { emoji: '👏', label: 'Bravo' },
    { emoji: '🎂', label: 'Birthday' },
    { emoji: '🎉', label: 'Party' },
  ];

  const handleSend = async () => {
    if (!user?.familyId || !childId) return;
    setIsSending(true);
    try {
      await ElderRepository.sendAppreciation(user.familyId, {
        childProfileId: childId,
        childName: child?.name || '',
        authorId: user.id,
        authorName: user.name || 'Elder',
        message: message || (selectedSticker ? `Sending you ${selectedSticker}!` : 'Thinking of you!'),
        sticker: selectedSticker || undefined,
        audioUrl: audioUrl || undefined
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/elder'), 2000);
    } catch (error) {
      console.error('Failed to send appreciation', error);
    } finally {
      setIsSending(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setIsRecording(false);
      setAudioUrl('demo_audio_url');
    }, 3000);
  };

  if (!child) return null;

  return (
    <div className="min-h-screen bg-bg-cream pb-32" style={{ fontSize: `${16 * scale}px` }}>
      <header className="p-8 lg:p-14">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <FFAvatar name={child.name} size="xl" className="border-4 border-white shadow-2xl" />
              <div className="absolute -bottom-2 -right-2 bg-accent text-white p-2 rounded-xl shadow-lg border-2 border-white">
                 <Heart size={20} fill="currentColor" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-black text-primary tracking-tight leading-tight" style={{ fontSize: `${36 * scale}px` }}>
                Bless <span className="text-accent">{child.name}</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Star size={14} className="text-gray-400" />
                <p className="font-bold text-gray-400 uppercase tracking-[0.2em]" style={{ fontSize: `${10 * scale}px` }}>
                  Legacy Appreciation Protocol
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="p-4 bg-white rounded-3xl border border-black/[0.03] text-gray-300 hover:text-primary transition-all shadow-sm group"
          >
            <ArrowLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="px-8 lg:px-14 space-y-12 pb-20 max-w-4xl mx-auto">
        {/* Sticker Picker */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="font-bold uppercase tracking-[0.3em] text-gray-400" style={{ fontSize: `${14 * scale}px` }}>
              Sacred Symbols
            </h3>
            <div className="h-0.5 flex-1 bg-black/[0.03] rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-6">
            {stickers.map(sticker => (
              <motion.button
                key={sticker.emoji}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSticker(sticker.emoji)}
                className={`p-10 rounded-[48px] text-6xl transition-all border-4 relative overflow-hidden group/s ${
                  selectedSticker === sticker.emoji 
                    ? 'bg-accent border-primary shadow-2xl shadow-accent/40' 
                    : 'bg-white border-black/[0.02] shadow-sm hover:border-accent/30'
                }`}
              >
                {selectedSticker === sticker.emoji && (
                  <motion.div 
                    layoutId="active-bg"
                    className="absolute inset-0 bg-white/10" 
                  />
                )}
                <span className="relative z-10 group-hover/s:scale-110 transition-transform block">{sticker.emoji}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Voice Note */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="font-bold uppercase tracking-[0.3em] text-gray-400" style={{ fontSize: `${14 * scale}px` }}>
              Vocal Blessing
            </h3>
            <div className="h-0.5 flex-1 bg-black/[0.03] rounded-full" />
          </div>
          <FFCard className="p-12 flex flex-col items-center text-center space-y-8 rounded-[64px] border-black/[0.02] bg-white hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            {audioUrl ? (
              <div className="w-full flex items-center gap-6 p-6 bg-primary/5 rounded-[32px] border border-primary/5">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <Play size={28} fill="currentColor" />
                </motion.button>
                <div className="flex-1 h-3 bg-primary/20 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-full h-full bg-primary" 
                  />
                </div>
                <button onClick={() => setAudioUrl(null)} className="text-alert/40 hover:text-alert p-3 transition-colors">
                  <Trash2 size={28} />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <AnimatePresence>
                    {isRecording && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0.1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="absolute inset-0 bg-alert rounded-full"
                      />
                    )}
                  </AnimatePresence>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRecording ? () => setIsRecording(false) : startRecording}
                    className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all relative z-10 ${
                      isRecording ? 'bg-alert text-white scale-110 shadow-alert/30' : 'bg-primary text-white shadow-primary/30'
                    }`}
                  >
                    {isRecording ? <Square size={48} fill="currentColor" /> : <Mic size={48} strokeWidth={1.5} />}
                  </motion.button>
                </div>
                <div>
                  <p className="font-display font-bold text-primary mb-2" style={{ fontSize: `${24 * scale}px` }}>
                    {isRecording ? 'Listening for your wisdom...' : 'Share your voice'}
                  </p>
                  <p className="text-[12px] font-bold text-gray-300 uppercase tracking-widest">
                    {isRecording ? 'Protocol Active' : 'Hold to capture message'}
                  </p>
                </div>
              </>
            )}
          </FFCard>
        </section>

        {/* Text Message */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="font-bold uppercase tracking-[0.3em] text-gray-400" style={{ fontSize: `${14 * scale}px` }}>
              Written Blessing
            </h3>
            <div className="h-0.5 flex-1 bg-black/[0.03] rounded-full" />
          </div>
          <div className="relative">
            <textarea
              rows={4}
              placeholder="Inscribe your thoughts here..."
              className="w-full p-10 bg-white border-2 border-black/[0.03] rounded-[64px] focus:outline-none focus:border-accent/30 transition-all font-medium shadow-sm hover:shadow-xl placeholder:text-gray-200"
              style={{ fontSize: `${22 * scale}px` }}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
        </section>

        <FFButton 
          className="w-full py-8 rounded-[48px] shadow-2xl shadow-primary/30 group" 
          size="lg"
          icon={<Send size={32} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          isLoading={isSending}
          onClick={handleSend}
          style={{ fontSize: `${22 * scale}px` }}
        >
          Dispatch to {child.name}
        </FFButton>
      </main>

      {/* Success Overlay */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-primary z-50 flex flex-col items-center justify-center text-white p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-32 h-32 bg-white/20 rounded-[40px] flex items-center justify-center mb-8"
            >
              <CheckCircle2 size={80} />
            </motion.div>
            <h2 className="font-display font-bold mb-4" style={{ fontSize: `${32 * scale}px` }}>Sent with Love!</h2>
            <p className="font-medium opacity-80" style={{ fontSize: `${18 * scale}px` }}>{child.name} will see your message on the Appreciation Wall.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElderSendAppreciationScreen;
