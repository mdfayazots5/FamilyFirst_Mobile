import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Check } from 'lucide-react';
import { TaskRepository, TaskTemplate } from '../repositories/TaskRepository';

interface TaskTemplatePickerProps {
  ageGroup: number;
  onSelect: (template: TaskTemplate) => void;
  onClose: () => void;
}

const categories = ['All', 'Morning', 'Study', 'Evening', 'Chores', 'Self-care'];

const TaskTemplatePicker: React.FC<TaskTemplatePickerProps> = ({ ageGroup, onSelect, onClose }) => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await TaskRepository.getTemplates(ageGroup);
        setTemplates(data);
      } catch (error) {
        console.error('Failed to fetch templates', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, [ageGroup]);

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-t-[40px]">
      <div className="p-6 border-b border-black/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-display font-bold text-primary">Task Library</h3>
            <p className="text-sm text-gray-500 font-medium">Age-appropriate tasks for your child</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-primary transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full bg-gray-50 border border-black/5 rounded-2xl pl-12 pr-4 py-4 font-bold text-primary focus:outline-none focus:border-primary/20"
          />
        </div>

        <div className="flex flex-wrap gap-2 pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all border-2 ${selectedCategory === cat ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-black/5 text-gray-400 hover:border-primary/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading templates...</div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No templates found</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredTemplates.map(template => (
              <motion.button
                key={template.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(template)}
                className="flex items-center justify-between p-4 bg-white rounded-3xl border border-black/5 hover:border-primary/10 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-white transition-colors">
                    {template.icon}
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-primary">{template.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>{template.category}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200" />
                      <span>{template.defaultCoinValue} Coins</span>
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Check size={16} />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTemplatePicker;
