import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Edit3, Trash2, HelpCircle, Lightbulb, BookOpen, X, CheckCircle2 } from 'lucide-react';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFEmptyState from '../../../shared/components/FFEmptyState';

interface ContentItem {
  id: string;
  type: 'onboarding' | 'tip' | 'faq';
  title: string;
  content: string;
  status: 'active' | 'draft';
}

type ContentType = 'onboarding' | 'tip' | 'faq';

const TAB_CONFIG: { id: ContentType; label: string }[] = [
  { id: 'onboarding', label: 'Onboarding' },
  { id: 'tip',        label: 'Tips' },
  { id: 'faq',        label: 'FAQs' },
];

const getTabIcon = (type: ContentType, size = 'w-[18px] h-[18px]') => {
  switch (type) {
    case 'onboarding': return <BookOpen className={size} />;
    case 'tip':        return <Lightbulb className={size} />;
    case 'faq':        return <HelpCircle className={size} />;
  }
};

const ContentManagerScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentType>('onboarding');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const [items, setItems] = useState<ContentItem[]>([
    { id: '1', type: 'onboarding', title: 'Welcome to FamilyFirst', content: 'The all-in-one family coordination app.', status: 'active' },
    { id: '2', type: 'onboarding', title: 'Track Attendance',        content: 'Never miss a class with real-time tracking.', status: 'active' },
    { id: '3', type: 'tip',        title: 'Morning Routine',         content: 'Set tasks the night before to save time.', status: 'active' },
    { id: '4', type: 'faq',        title: 'How to redeem coins?',    content: 'Go to the Reward Shop in the child app.', status: 'active' },
  ]);

  const filteredItems = items.filter(item => item.type === activeTab);
  const activeLabel = TAB_CONFIG.find(t => t.id === activeTab)?.label ?? '';

  const handleSave = () => setSelectedItem(null);

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Content Manager"
        subtitle="Onboarding, tips, and FAQs"
        showBack
        rightAction={
          <FFButton size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => {}}>Add</FFButton>
        }
      />

      <main className="px-4 py-5 space-y-5 page-enter">

        {/* Summary hero */}
        <div className="rounded-ff-lg bg-gradient-to-br from-[#1A2E4A] to-[#243755] p-5">
          <p className="font-body text-white/70 text-xs">Content overview</p>
          <p className="font-display font-bold text-xl text-white mt-0.5">All content synced</p>
          <div className="flex items-center gap-6 mt-3">
            <div>
              <p className="font-numbers font-medium text-2xl text-white">{items.length}</p>
              <p className="font-body text-xs text-white/60">Total items</p>
            </div>
            <div>
              <p className="font-numbers font-medium text-2xl text-white">
                {items.filter(i => i.status === 'active').length}
              </p>
              <p className="font-body text-xs text-white/60">Published</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 font-body font-semibold text-xs transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-400 border border-black/5'
              }`}
            >
              {getTabIcon(tab.id, 'w-3.5 h-3.5')}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section */}
        <div className="space-y-3">
          <FFSectionHeader
            icon={getTabIcon(activeTab)}
            title={activeLabel}
            rightAction={
              <span className="font-body text-xs text-accent font-semibold">{filteredItems.length} items</span>
            }
          />

          {filteredItems.length === 0 ? (
            <FFEmptyState
              icon={getTabIcon(activeTab, 'w-8 h-8')}
              title="No Content Yet"
              message={`Add your first ${activeLabel.toLowerCase()} item.`}
              actionLabel="Add Item"
              onAction={() => {}}
            />
          ) : (
            <div className="space-y-3">
              {filteredItems.map(item => (
                <FFCard key={item.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-ff-sm bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                      {getTabIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-primary truncate">{item.title}</p>
                      <p className="font-body text-xs text-gray-400 mt-0.5 line-clamp-2">{item.content}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <FFBadge variant={item.status === 'active' ? 'success' : 'gray'}>
                        {item.status === 'active' ? 'Live' : 'Draft'}
                      </FFBadge>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-2 text-gray-300 hover:text-primary transition-colors"
                        aria-label="Edit item"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-300 hover:text-alert transition-colors"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </FFCard>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {selectedItem && (
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
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-ff-lg shadow-elevated overflow-hidden"
            >
              {/* Modal header */}
              <div className="p-5 border-b border-black/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-ff-sm bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                  {getTabIcon(activeTab)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-primary">
                    Edit {activeLabel}
                  </p>
                  <p className="font-body text-xs text-gray-400">ID: {selectedItem.id}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-primary transition-colors flex-shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                    defaultValue={selectedItem.title}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-body font-semibold text-xs text-gray-500 uppercase tracking-wider">
                    Content
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-white border border-black/5 rounded-xl font-body text-sm text-primary h-28 resize-none focus:outline-none focus:ring-1 focus:ring-primary/20"
                    defaultValue={selectedItem.content}
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="p-5 pt-0 flex gap-3">
                <FFButton variant="outline" className="flex-1" onClick={() => setSelectedItem(null)}>
                  Cancel
                </FFButton>
                <FFButton
                  className="flex-1"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={handleSave}
                >
                  Save
                </FFButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentManagerScreen;
