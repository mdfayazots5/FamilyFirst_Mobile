import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, ClipboardList, Star, Users } from 'lucide-react';
import { AdminRepository, TaskTemplate } from '../repositories/AdminRepository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';

const TaskTemplatesScreen: React.FC = () => {
  const [templates, setTemplates]   = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setTemplates(await AdminRepository.getTaskTemplates());
    } catch {
      setError('Could not load task templates.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const filteredTemplates = templates.filter(t =>
    t.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Task Templates"
        subtitle="Routine templates for families"
        showBack
        rightAction={
          <FFButton size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => {}}>New</FFButton>
        }
      />

      <main className="px-4 py-5 space-y-4 page-enter">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or category..."
            className="w-full h-12 pl-11 pr-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <FFShimmer key={i} className="h-36 rounded-ff" />)}
          </div>
        ) : error ? (
          <FFErrorState message={error} onRetry={fetchTemplates} />
        ) : filteredTemplates.length === 0 ? (
          <FFEmptyState
            icon={<ClipboardList className="w-8 h-8 text-gray-300" />}
            title={searchQuery ? 'No Matches' : 'No Templates'}
            message={searchQuery ? 'Try a different search.' : 'Add task templates for families to use.'}
            actionLabel={!searchQuery ? 'Add Template' : undefined}
            onAction={!searchQuery ? () => {} : undefined}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredTemplates.map(template => (
              <FFCard key={template.id} className="p-4 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-ff-sm bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex gap-0.5">
                    <button
                      className="p-1.5 text-gray-300 hover:text-primary transition-colors"
                      aria-label="Edit template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 text-gray-300 hover:text-alert transition-colors"
                      aria-label="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="font-display font-semibold text-sm text-primary truncate">
                  {template.taskName}
                </p>
                <p className="font-body text-xs text-gray-400 mt-0.5 truncate">{template.category}</p>

                <div className="mt-auto pt-3 border-t border-black/5 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-numbers font-medium text-xs text-primary">{template.coinValue}</span>
                    <span className="font-body text-xs text-gray-400">pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary/40 flex-shrink-0" />
                    <span className="font-body text-xs text-gray-400 truncate">Age {template.ageGroup}</span>
                  </div>
                </div>
              </FFCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TaskTemplatesScreen;
