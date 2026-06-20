import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Search, MessageSquare, Clock, AlertCircle,
  ChevronRight, Send, X, LifeBuoy, User,
} from 'lucide-react';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFEmptyState from '../../../shared/components/FFEmptyState';

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

const TICKETS: Ticket[] = [
  {
    id: 'TKT-1001',
    user: 'Rahul Sharma',
    email: 'rahul@example.com',
    subject: 'Attendance button not working',
    status: 'open',
    priority: 'high',
    createdAt: '2h ago',
    lastMessage: 'The button is greyed out even during class hours.',
  },
  {
    id: 'TKT-1002',
    user: 'Priya Patel',
    email: 'priya@example.com',
    subject: 'Child profile not showing tasks',
    status: 'pending',
    priority: 'medium',
    createdAt: '5h ago',
    lastMessage: 'My son cannot see any tasks assigned to him.',
  },
  {
    id: 'TKT-1003',
    user: 'Amit Kumar',
    email: 'amit@example.com',
    subject: 'How do I add a second child?',
    status: 'resolved',
    priority: 'low',
    createdAt: '1d ago',
    lastMessage: 'Thank you for the quick help!',
  },
];

type FilterType = 'all' | 'open' | 'pending' | 'resolved';

const getStatusVariant = (status: string): 'success' | 'accent' | 'alert' | 'gray' => {
  switch (status) {
    case 'open':     return 'alert';
    case 'pending':  return 'accent';
    case 'resolved': return 'success';
    default:         return 'gray';
  }
};

const getPriorityDot = (priority: string) => {
  switch (priority) {
    case 'high':   return 'bg-alert';
    case 'medium': return 'bg-accent';
    default:       return 'bg-success';
  }
};

const SupportTicketsScreen: React.FC = () => {
  const [filter, setFilter]             = useState<FilterType>('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText]       = useState('');

  const filteredTickets = TICKETS.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch =
      t.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleReply = () => {
    if (!replyText.trim()) return;
    setReplyText('');
    setSelectedTicket(null);
  };

  const statuses: FilterType[] = ['all', 'open', 'pending', 'resolved'];

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader title="Support Tickets" subtitle="Help desk and user requests" showBack />

      <main className="px-4 py-5 space-y-4 page-enter">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full h-12 pl-11 pr-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex-shrink-0 h-8 px-4 rounded-full font-body font-semibold text-xs transition-all capitalize ${
                filter === s
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-400 border border-black/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        {filteredTickets.length === 0 ? (
          <FFEmptyState
            icon={<LifeBuoy className="w-8 h-8 text-gray-300" />}
            title="No Tickets Found"
            message={searchQuery ? 'Try a different search.' : 'No tickets match the selected filter.'}
          />
        ) : (
          <div className="space-y-3">
            <FFSectionHeader
              icon={<MessageSquare className="w-[18px] h-[18px]" />}
              title="Tickets"
              rightAction={
                <span className="font-body text-xs text-accent font-semibold">
                  {filteredTickets.length} found
                </span>
              }
            />

            {filteredTickets.map(ticket => (
              <FFCard
                key={ticket.id}
                hoverable
                onClick={() => setSelectedTicket(ticket)}
                className="p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <FFAvatar name={ticket.user} size="sm" />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getPriorityDot(ticket.priority)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-semibold text-sm text-primary truncate">{ticket.subject}</p>
                      <FFBadge variant={getStatusVariant(ticket.status)} size="sm">{ticket.status}</FFBadge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="font-body text-xs text-gray-400">{ticket.user}</span>
                      <span className="font-body text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ticket.createdAt}
                      </span>
                      <span className="font-body text-xs text-gray-400">{ticket.id}</span>
                    </div>
                    <p className="font-body text-xs text-gray-400 mt-1 truncate">{ticket.lastMessage}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>
              </FFCard>
            ))}
          </div>
        )}
      </main>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-ff-lg shadow-elevated overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal header */}
              <div className="p-5 border-b border-black/5 flex items-center gap-3">
                <FFAvatar name={selectedTicket.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-primary truncate">
                    {selectedTicket.subject}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-body text-xs text-gray-400">{selectedTicket.id}</span>
                    <FFBadge variant={getStatusVariant(selectedTicket.status)} size="sm">
                      {selectedTicket.status}
                    </FFBadge>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-primary transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-bg-cream">
                {/* User message */}
                <div className="flex gap-3 max-w-[90%]">
                  <FFAvatar name={selectedTicket.user} size="sm" />
                  <div>
                    <div className="bg-white rounded-ff p-3 shadow-card">
                      <p className="font-body text-sm text-primary leading-relaxed">
                        {selectedTicket.lastMessage}
                      </p>
                    </div>
                    <p className="font-body text-xs text-gray-400 mt-1">
                      {selectedTicket.user} · {selectedTicket.createdAt}
                    </p>
                  </div>
                </div>

                {/* Support reply */}
                <div className="flex gap-3 max-w-[90%] ml-auto flex-row-reverse">
                  <div className="w-8 h-8 bg-primary rounded-ff-sm flex items-center justify-center text-white flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="bg-primary rounded-ff p-3 shadow-card">
                      <p className="font-body text-sm text-white leading-relaxed">
                        We're looking into this for you. We'll update you shortly.
                      </p>
                    </div>
                    <p className="font-body text-xs text-gray-400 mt-1 text-right">
                      Support Team · 1h ago
                    </p>
                  </div>
                </div>
              </div>

              {/* Reply input */}
              <div className="p-5 border-t border-black/5 bg-white">
                <div className="flex gap-3 items-end">
                  <textarea
                    placeholder="Type your reply..."
                    className="flex-1 p-3 bg-bg-cream border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none h-20 placeholder:text-gray-300"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <FFButton
                    icon={<Send className="w-4 h-4" />}
                    onClick={handleReply}
                    className="flex-shrink-0"
                  >
                    Send
                  </FFButton>
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
