import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Layout, 
  HelpCircle, 
  Lightbulb,
  ChevronRight,
  X,
  Image as ImageIcon,
  Database,
  Radio,
  FileCode,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

interface ContentItem {
  id: string;
  type: 'onboarding' | 'tip' | 'faq';
  title: string;
  content: string;
  status: 'active' | 'draft';
}

const ContentManagerScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'onboarding' | 'tip' | 'faq'>('onboarding');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const [items, setItems] = useState<ContentItem[]>([
    { id: '1', type: 'onboarding', title: 'Welcome to FamilyFirst', content: 'The all-in-one family coordination app.', status: 'active' },
    { id: '2', type: 'onboarding', title: 'Track Attendance', content: 'Never miss a class with real-time tracking.', status: 'active' },
    { id: '3', type: 'tip', title: 'Morning Routine', content: 'Set tasks the night before to save time.', status: 'active' },
    { id: '4', type: 'faq', title: 'How to redeem coins?', content: 'Go to the Reward Shop in the child app.', status: 'active' },
  ]);

  const filteredItems = items.filter(item => item.type === activeTab);

  const handleSave = () => {
    setSelectedItem(null);
  };

  const tabs = [
    { id: 'onboarding', icon: <Globe size={20} />, label: 'Onboarding_Vectors' },
    { id: 'tip', icon: <Zap size={20} />, label: 'Protocol_Tips' },
    { id: 'faq', icon: <HelpCircle size={20} />, label: 'Intelligence_Bank' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-48">
      {/* High-Command Header */}
      <header className="bg-white/95 backdrop-blur-2xl p-8 lg:p-14 border-b border-black/[0.03] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="flex items-center gap-10">
            <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30 relative group overflow-hidden">
               <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
               <Database size={40} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">PROTOCOL_ASSETS</FFBadge>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none whitespace-nowrap">CONTENT_REPOSITORY_v2.0</p>
                </div>
              </div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-primary tracking-tighter uppercase italic leading-none">
                Asset Archive
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <FFButton 
              size="lg" 
              icon={<Plus size={24} />} 
              onClick={() => {}}
              className="px-10 h-16 rounded-[24px] shadow-2xl shadow-primary/20"
            >
              INITIALIZE_ASSET
            </FFButton>
            <button 
              onClick={() => navigate(-1)}
              className="w-16 h-16 bg-white rounded-[24px] border border-black/5 text-gray-300 hover:text-primary transition-all shadow-sm flex items-center justify-center group active:scale-90"
            >
              <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 overflow-x-auto no-scrollbar pb-2 px-1">
          <div className="flex gap-4 p-2 bg-gray-50 rounded-[32px] border border-black/[0.03] shadow-inner max-w-2xl">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[160px] h-16 rounded-[24px] flex items-center justify-center gap-3 transition-all border-2 italic ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white border-transparent shadow-xl shadow-primary/20 scale-[1.02]' 
                    : 'bg-white border-transparent text-gray-400 hover:text-primary hover:border-primary/10'
                }`}
              >
                <div className="shrink-0">{tab.icon}</div>
                <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 lg:p-14 pt-16 space-y-24">
        {/* Status Snapshot */}
        <section className="bg-primary p-12 lg:p-20 rounded-[56px] text-white overflow-hidden relative shadow-3xl shadow-primary/30 group">
           <div className="absolute top-0 right-0 p-20 opacity-[0.05] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-[3000ms]">
            <Radio size={400} />
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="space-y-6 max-w-lg">
              <FFBadge variant="accent" size="sm" className="font-black px-6 py-2 uppercase italic tracking-widest text-[12px] rounded-xl">ASSET_OPERATIONS</FFBadge>
              <h2 className="text-4xl lg:text-6xl font-display font-black italic tracking-tighter leading-tight drop-shadow-2xl uppercase">Global_Transmission_Safe</h2>
              <p className="text-white/40 text-lg italic leading-relaxed font-medium">Telemetry indicates all platform assets are synchronized across the secure family grid. Deploying updates requires level-4 authorization.</p>
            </div>
            
            <div className="flex gap-12 lg:gap-32">
               <div className="text-center group/stat">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 mb-3 italic group-hover:text-accent transition-colors">TOTAL_ASSETS</p>
                  <h4 className="text-6xl font-display font-black italic tabular-nums">{items.length.toString().padStart(2, '0')}</h4>
               </div>
               <div className="text-center group/stat">
                  <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 mb-3 italic group-hover:text-accent transition-colors">SYNC_STATUS</p>
                  <h4 className="text-6xl font-display font-black italic text-success">STABLE</h4>
               </div>
            </div>
          </div>
        </section>

        {/* Content Table */}
        <section className="space-y-12">
           <div className="flex items-center gap-8 px-4">
            <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center text-primary">
               <Layers size={24} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-display font-black uppercase tracking-widest text-primary italic">{activeTab}_DATA_STREAM</h3>
            <div className="h-px flex-1 bg-primary/10" />
          </div>

          <div className="grid grid-cols-1 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FFCard className="p-10 flex items-center justify-between group cursor-default border-none shadow-3xl shadow-black/[0.01] bg-white rounded-[48px] overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <FileCode size={120} strokeWidth={1} />
                  </div>
                  
                  <div className="flex items-center gap-8 relative z-10 flex-1">
                    <div className="w-20 h-20 bg-primary/5 rounded-[28px] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-black/[0.02]">
                      {activeTab === 'onboarding' ? <Globe size={28} /> : activeTab === 'tip' ? <Zap size={28} /> : <HelpCircle size={28} />}
                    </div>
                    <div className="min-w-0 flex-1">
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic leading-none mb-3">ASSET_IDENTIFIER: {item.id}</p>
                       <h4 className="text-2xl lg:text-3xl font-display font-black text-primary uppercase italic tracking-tighter mb-4 leading-none group-hover:text-success transition-colors">{item.title}</h4>
                       <p className="text-gray-400 font-medium leading-relaxed italic text-lg line-clamp-1">{item.content}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pl-10 border-l border-black/[0.03] relative z-10">
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-300 hover:text-primary hover:bg-primary/5 transition-all shadow-sm group/btn active:scale-90"
                    >
                      <Edit3 size={24} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-300 hover:text-alert hover:bg-alert/5 transition-all shadow-sm group/btn active:scale-90">
                      <Trash2 size={24} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </FFCard>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="text-center py-24 space-y-6">
           <div className="flex items-center justify-center gap-10 text-primary/10">
              <div className="h-px w-32 bg-current" />
              <ShieldCheck size={40} />
              <div className="h-px w-32 bg-current" />
           </div>
           <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.8em] italic opacity-40 leading-relaxed">STATION_ENGINE // Protocol Assets v4.4.2</p>
        </footer>
      </main>

      {/* Protocol Editor Modal */}
      <AnimatePresence>
        {selectedItem && (
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
              className="bg-white w-full max-w-4xl rounded-[64px] shadow-3xl overflow-hidden shadow-2xl relative border border-white/20 flex flex-col"
            >
              <div className="p-12 lg:p-14 border-b border-black/[0.03] flex items-center justify-between bg-white relative">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                    {activeTab === 'onboarding' ? <Globe size={32} /> : activeTab === 'tip' ? <Zap size={32} /> : <HelpCircle size={32} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                       <FFBadge variant="accent" size="sm" className="font-black px-4 py-1.5 uppercase italic tracking-widest leading-none">PROTOCOL_MODIFICATION</FFBadge>
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] italic mb-1">ASSET_ID: {selectedItem.id}</p>
                    </div>
                    <h3 className="text-4xl font-display font-black text-primary uppercase italic tracking-tighter">Edit {activeTab}</h3>
                  </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-300 hover:text-alert transition-all group">
                  <X size={32} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="p-10 lg:p-16 space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic ml-1 leading-none">ASSET_TITLE_STRING</label>
                  <input 
                    type="text" 
                    className="w-full px-8 py-6 bg-gray-50 border border-black/5 rounded-[28px] font-black text-primary text-xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all uppercase italic tracking-tight"
                    defaultValue={selectedItem.title}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic ml-1 leading-none">PROTOCOL_TELEMETRY_DATA</label>
                  <textarea 
                    className="w-full px-8 py-6 bg-gray-50 border border-black/5 rounded-[28px] text-lg font-medium text-primary h-48 resize-none focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all italic leading-relaxed"
                    defaultValue={selectedItem.content}
                  />
                </div>
                {activeTab === 'onboarding' && (
                  <div className="p-16 border-[4px] border-dashed border-gray-100 rounded-[40px] flex flex-col items-center gap-6 text-gray-300 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group">
                    <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                       <ImageIcon size={40} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-center italic leading-none">REPLACE_ILLUSTRATION_VECTOR</span>
                  </div>
                )}
              </div>

              <div className="p-14 pt-0">
                <FFButton fullWidth size="lg" onClick={handleSave} className="py-8 shadow-3xl shadow-primary/30 text-xl font-black italic tracking-widest uppercase">COMMIT_ASSET_DEPLOY</FFButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentManagerScreen;

