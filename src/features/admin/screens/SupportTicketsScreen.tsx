import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Check,
  AlertCircle,
  ChevronRight,
  Send,
  User,
  MoreVertical,
  X,
  LifeBuoy,
  Zap,
  Activity,
  ShieldAlert,
  Terminal,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';

interface Ticket {
  id: string;
  user: string;
  email: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastMessage: string;
}

const SupportTicketsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');

  const tickets: Ticket[] = [
    { 
      id: 'INC-1001', 
      user: 'Rahul Sharma', 
      email: 'rahul@example.com', 
      subject: 'AUTHENTICATION_FAILURE: ATTENDANCE', 
      status: 'open', 
      priority: 'high', 
      createdAt: '2h ago',
      lastMessage: 'The button is greyed out even during class hours.'
    },
    { 
      id: 'INC-1002', 
      user: 'Priya Patel', 
      email: 'priya@example.com', 
      subject: 'SUBSCRIPTION_SYNC_MISMATCH', 
      status: 'pending', 
      priority: 'medium', 
      createdAt: '5h ago',
      lastMessage: 'Payment went through but status not updated.'
    },
    { 
      id: 'INC-1003', 
      user: 'Amit Kumar', 
      email: 'amit@example.com', 
      subject: 'ENTITY_REGISTRATION_QUERY', 
      status: 'resolved', 
      priority: 'low', 
      createdAt: '1d ago',
      lastMessage: 'Thank you for the quick help!'
    },
  ];

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = t.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleReply = () => {
    if (!replyText.trim()) return;
    setReplyText('');
    setSelectedTicket(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* High-Command Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <LifeBuoy size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">INCIDENT_RESPONSE</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">RESOLUTION_STATION_ACTIVE</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Support Registry
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-2 p-2 bg-gray-50 rounded-3xl border border-black/[0.03] shadow-inner overflow-hidden">
               {['all', 'open', 'pending', 'resolved'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s as any)}
                    className={`px-6 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic ${
                      filter === s 
                        ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                        : 'text-gray-400 hover:text-primary transition-colors'
                    }`}
                  >
                    {s}
                  </button>
                ))}
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12">
           <div className="relative group max-w-2xl">
              <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="PROBE_INCIDENT_DATABASE..." 
                className="w-full pl-16 pr-8 py-6 bg-gray-50/50 border border-black/5 rounded-[28px] focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-display font-black text-primary placeholder:text-gray-300 uppercase italic tracking-widest text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 pt-16 space-y-8">
        {filteredTickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedTicket(ticket)}
          >
            <FFCard className="p-10 cursor-pointer border-none bg-white shadow-3xl shadow-black/[0.01] group hover:scale-[1.01] transition-all rounded-[48px] overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Terminal size={140} strokeWidth={1} />
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                <div className="flex items-center gap-8 flex-1">
                  <div className="relative">
                    <FFAvatar name={ticket.user} size="lg" className="ring-[6px] ring-primary/5 rounded-[28px]" />
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-[4px] border-white flex items-center justify-center ${
                      ticket.priority === 'high' ? 'bg-alert shadow-alert/30' : ticket.priority === 'medium' ? 'bg-accent shadow-accent/30' : 'bg-success shadow-success/30'
                    } shadow-lg transition-transform group-hover:scale-110`}>
                       <AlertCircle size={14} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic mb-1 leading-none">INCIDENT_ID: {ticket.id}</p>
                       <FFBadge 
                        variant={ticket.status === 'open' ? 'alert' : ticket.status === 'pending' ? 'accent' : 'success'}
                        size="sm"
                        className="font-black italic px-4 py-1 uppercase tracking-widest"
                      >
                        {ticket.status}
                      </FFBadge>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none mb-3">SOURCE: {ticket.user}</h4>
                      <h3 className="text-2xl lg:text-3xl font-display font-black text-primary uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-1">{ticket.subject}</h3>
                    </div>
                    
                    <div className="flex items-center gap-8 pt-2">
                       <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest italic group-hover:text-primary transition-colors">
                          <Clock size={14} /> {ticket.createdAt}
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest italic group-hover:text-primary transition-colors">
                          <Activity size={14} /> TELEMETRY_STABLE
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-10 lg:pl-12 lg:border-l border-black/[0.03]">
                   <div className="text-right hidden xl:block space-y-2">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none">Vulnerability</p>
                      <p className="text-lg font-black text-primary uppercase italic tracking-tighter leading-none">{ticket.priority === 'high' ? 'CRITICAL_RISK' : 'NOMINAL_BIAS'}</p>
                   </div>
                   <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center text-gray-200 group-hover:bg-primary group-hover:text-white group-hover:translate-x-1 transition-all shadow-sm">
                      <ChevronRight size={32} />
                   </div>
                </div>
              </div>
            </FFCard>
          </motion.div>
        ))}
      </main>

      {/* Ticket Detail Protocol Overlay */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/20 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 lg:p-20"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 100 }}
              className="bg-white w-full max-w-5xl rounded-[64px] shadow-3xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
            >
              {/* Modal Header */}
              <div className="p-10 lg:p-14 border-b border-black/[0.03] flex items-center justify-between bg-white relative">
                <div className="flex items-center gap-8">
                  <div className="relative">
                    <FFAvatar name={selectedTicket.user} size="xl" className="ring-[8px] ring-primary/5 rounded-[40px]" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-success border-[5px] border-white rounded-full flex items-center justify-center">
                       <Check size={16} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                       <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">INCIDENT_DEBRIEF</FFBadge>
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic italic">{selectedTicket.id} // SECURE_LINE</p>
                    </div>
                    <h3 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter leading-none">{selectedTicket.subject}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)} 
                  className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-300 hover:text-alert hover:bg-alert/5 transition-all group"
                >
                  <X size={32} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Chat Matrix */}
              <div className="flex-1 overflow-y-auto p-10 lg:p-14 space-y-12 bg-gray-50/30">
                <div className="flex gap-8 max-w-3xl">
                  <FFAvatar name={selectedTicket.user} size="md" className="rounded-2xl" />
                  <div className="space-y-4">
                    <div className="bg-white p-8 lg:p-10 rounded-[40px] rounded-tl-none border border-black/[0.03] shadow-3xl shadow-black/[0.01]">
                      <p className="text-lg text-primary font-medium leading-relaxed italic">{selectedTicket.lastMessage}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] italic ml-1">
                      {selectedTicket.user} // MSG_TIMESTAMP: {selectedTicket.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex gap-8 max-w-3xl ml-auto flex-row-reverse">
                  <div className="w-14 h-14 bg-primary rounded-[20px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative">
                     <Fingerprint size={24} />
                     <div className="absolute inset-0 bg-white/20 animate-pulse rounded-[20px]" />
                  </div>
                  <div className="space-y-4 text-right">
                    <div className="bg-primary text-white p-8 lg:p-10 rounded-[40px] rounded-tr-none shadow-3xl shadow-primary/20">
                      <p className="text-lg font-medium leading-relaxed italic opacity-90">Protocol established. Command center is investigating the grid discrepancy. Maintain standby status for resolution sync.</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] italic mr-1">
                      COMMAND_OPERATOR // DISPATCH_SYNC: 1H_AGO
                    </p>
                  </div>
                </div>
              </div>

              {/* Transmission Channel */}
              <div className="p-10 lg:p-14 border-t border-black/[0.03] bg-white">
                <div className="relative group">
                  <textarea 
                    placeholder="TRANSMIT_OFFICIAL_RESPONSE..." 
                    className="w-full p-8 pr-24 bg-gray-50/50 border border-black/5 rounded-[40px] text-lg font-black text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none h-48 placeholder:text-gray-300 uppercase italic tracking-widest"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button 
                    onClick={handleReply}
                    className="absolute bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-[24px] shadow-3xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                  >
                    <Send size={28} />
                  </button>
                </div>
                <div className="mt-8 flex items-center justify-center gap-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.6em] italic">
                   <div className="h-px w-20 bg-current opacity-20" />
                   SECURE_ENCRYPTION_ACTIVE
                   <div className="h-px w-20 bg-current opacity-20" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportTicketsScreen;

