import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Flag, MessageSquare } from 'lucide-react';
import FFButton from '../../../shared/components/FFButton';

interface PhotoReviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  taskTitle: string;
  onApprove: () => void;
  onFlag: (reason: string, note: string) => void;
}

const PhotoReviewSheet: React.FC<PhotoReviewSheetProps> = ({
  isOpen,
  onClose,
  photoUrl,
  taskTitle,
  onApprove,
  onFlag
}) => {
  const [isFlagging, setIsFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('Not done properly');
  const [flagNote, setFlagNote] = useState('');

  const reasons = ['Not done properly', 'Photo unclear', 'Task not completed'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[48px] z-50 p-8 md:p-12 max-h-[92vh] overflow-y-auto shadow-[0_-20px_40px_rgba(0,0,0,0.1)] border-t border-black/[0.03]"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-display font-bold text-primary tracking-tight mb-2">{taskTitle}</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">VERIFICATION REQ-04</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-2xl text-gray-300 hover:text-primary transition-all hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>

            {!isFlagging ? (
              <div className="space-y-10">
                <div className="aspect-[4/3] rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative group bg-gray-50 ring-1 ring-black/5">
                  <img 
                    src={photoUrl} 
                    alt={taskTitle} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                <div className="flex gap-4">
                  <FFButton 
                    variant="outline" 
                    className="flex-1 py-6 rounded-2xl border-2 border-alert/10 text-alert hover:bg-alert/5" 
                    icon={<Flag size={20} />}
                    onClick={() => setIsFlagging(true)}
                  >
                    FLAG PROTOCOL
                  </FFButton>
                  <FFButton 
                    variant="primary" 
                    className="flex-1 py-6 rounded-2xl shadow-xl shadow-success/10 bg-success hover:bg-success/90 border-none" 
                    icon={<Check size={20} />}
                    onClick={onApprove}
                  >
                    VERIFY & APPROVE
                  </FFButton>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="space-y-5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">REASON FOR INTERVENTION</label>
                  <div className="grid grid-cols-1 gap-3">
                    {reasons.map(reason => (
                      <button
                        key={reason}
                        onClick={() => setFlagReason(reason)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all font-display font-bold text-sm ${flagReason === reason ? 'border-accent bg-accent/[0.02] text-accent' : 'border-black/[0.03] bg-white text-gray-400 hover:border-black/10'}`}
                      >
                        {reason.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">OPERATIONAL LOG (OPTIONAL)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-5 top-5 text-gray-300" size={20} strokeWidth={1.5} />
                    <textarea
                      value={flagNote}
                      onChange={(e) => setFlagNote(e.target.value)}
                      placeholder="Add specific observations regarding this protocol..."
                      className="w-full bg-gray-50 border border-black/[0.03] rounded-[32px] pl-14 pr-6 py-5 font-body font-medium text-primary focus:outline-none focus:ring-2 focus:ring-accent/10 focus:bg-white transition-all min-h-[140px]"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <FFButton 
                    variant="outline" 
                    className="flex-1 rounded-2xl" 
                    onClick={() => setIsFlagging(false)}
                  >
                    BACK
                  </FFButton>
                  <FFButton 
                    variant="alert" 
                    className="flex-1 rounded-2xl shadow-xl shadow-alert/10" 
                    onClick={() => onFlag(flagReason, flagNote)}
                  >
                    CONFIRM FLAG
                  </FFButton>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PhotoReviewSheet;
