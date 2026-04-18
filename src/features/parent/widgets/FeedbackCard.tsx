import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, ThumbsUp, AlertCircle, Eye } from 'lucide-react';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import { Feedback } from '../repositories/ChildRepository';

interface FeedbackCardProps {
  feedback: Feedback;
  onAcknowledge: (id: string) => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, onAcknowledge }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Appreciation': return <ThumbsUp size={16} className="text-success" />;
      case 'Complaint': return <AlertCircle size={16} className="text-alert" />;
      case 'Observation': return <Eye size={16} className="text-primary" />;
      default: return <MessageSquare size={16} />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'Appreciation': return 'success';
      case 'Complaint': return 'alert';
      case 'Observation': return 'primary';
      default: return 'gray';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => !feedback.isRead && onAcknowledge(feedback.id)}
      className="cursor-pointer group"
    >
      <FFCard 
        className={`relative overflow-hidden transition-all p-6 ${!feedback.isRead ? 'border-accent/20 bg-accent/[0.02] shadow-xl shadow-accent/5' : 'opacity-60 grayscale-[0.5]'}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-black/[0.02] ${!feedback.isRead ? 'bg-white text-accent' : 'bg-gray-100 text-gray-400'}`}>
              {getTypeIcon(feedback.type)}
            </div>
            <div>
              <h4 className="font-display font-bold text-primary group-hover:text-accent transition-colors leading-none mb-1.5">
                {feedback.teacherName}
              </h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">{feedback.date} • FACULTY REVIEW</p>
            </div>
          </div>
          <FFBadge variant={getBadgeVariant(feedback.type) as any} size="sm" className="border-none">
            {feedback.type.toUpperCase()}
          </FFBadge>
        </div>
        
        <p className={`text-sm leading-relaxed font-body ${!feedback.isRead ? 'text-primary font-medium' : 'text-gray-500'}`}>
          "{feedback.message}"
        </p>

        {!feedback.isRead && (
          <div className="mt-5 flex items-center gap-3 py-3 border-t border-accent/10">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(200,146,162,0.8)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Awaiting Protocol Acknowledgement</span>
          </div>
        )}
      </FFCard>
    </motion.div>
  );
};

export default FeedbackCard;
