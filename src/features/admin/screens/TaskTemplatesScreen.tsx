import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Star,
  Tag,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminRepository, TaskTemplate } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFBadge from '../../../shared/components/FFBadge';

const TaskTemplatesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await AdminRepository.getTaskTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to fetch templates', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(t => 
    t.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-cream pb-32">
      <header className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-black text-primary tracking-tight mb-1">Task Library</h1>
            <p className="text-sm text-gray-400 font-medium">Global routine templates for families</p>
          </div>
          <div className="flex items-center gap-3">
            <FFButton 
              size="sm" 
              onClick={() => {}} 
              className="shadow-lg shadow-primary/20"
              icon={<Plus size={20} />}
            >
              Add New
            </FFButton>
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-white rounded-2xl border border-black/5 text-gray-400 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search templates by name or category..."
            className="w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary placeholder:text-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="px-6 space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading templates...</div>
        ) : (
          filteredTemplates.map(template => (
            <FFCard key={template.id} className="p-6 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                  <Star size={24} />
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-gray-300 hover:text-primary transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-2 text-gray-300 hover:text-alert transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-primary mb-1">{template.taskName}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{template.category}</p>

              <div className="mt-auto pt-4 border-t border-black/5 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-50 rounded flex items-center justify-center text-amber-500">
                    <Star size={12} fill="currentColor" />
                  </div>
                  <span className="text-xs font-bold text-primary">{template.coinValue} Coins</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center text-blue-500">
                    <Users size={12} />
                  </div>
                  <span className="text-xs font-bold text-primary">Age {template.ageGroup}</span>
                </div>
              </div>
            </FFCard>
          ))
        )}
      </div>
    </main>
  </div>
);
};

export default TaskTemplatesScreen;
