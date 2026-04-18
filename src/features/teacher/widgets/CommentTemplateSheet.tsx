import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Check } from 'lucide-react';
import FFButton from '../../../shared/components/FFButton';
import { CommentTemplate } from '../repositories/AttendanceRepository';

interface CommentTemplateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  templates: CommentTemplate[];
  onSave: (comment: string) => void;
  initialComment?: string;
}

const CommentTemplateSheet: React.FC<CommentTemplateSheetProps> = ({
  isOpen,
  onClose,
  templates,
  onSave,
  initialComment = ''
}) => {
  const [comment, setComment] = useState(initialComment);

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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[40px] z-50 p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-primary">Add Comment</h3>
                <p className="text-sm text-gray-500 font-medium">Select a template or write your own.</p>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-primary transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Templates</label>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setComment(template.text)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all font-bold text-sm ${comment === template.text ? 'border-primary bg-primary/5 text-primary' : 'border-black/5 bg-white text-gray-500 hover:border-primary/10'}`}
                    >
                      {template.text}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Custom Comment</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-gray-300" size={20} />
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a specific note for the parent..."
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl pl-12 pr-4 py-4 font-bold text-primary focus:outline-none min-h-[120px]"
                  />
                </div>
              </div>

              <FFButton 
                className="w-full py-5" 
                icon={<Check size={20} />}
                onClick={() => {
                  onSave(comment);
                  onClose();
                }}
              >
                Save Comment
              </FFButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentTemplateSheet;
