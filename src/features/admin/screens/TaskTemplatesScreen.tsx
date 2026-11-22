import { useRef, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { ClipboardList, Plus, Search } from 'lucide-react';
import { useApiResource } from '../../../core/hooks/useApiResource';
import type { ApiResponse } from '../../../core/network/apiTypes';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { PILLAR_TAG_OPTIONS } from '../../tasks/repositories/TaskRepository';
import { AdminRepository, type TaskTemplate } from '../repositories/AdminRepository';

const timeBlocks = [
  { value: 1, label: 'Morning' },
  { value: 3, label: 'Evening' },
  { value: 4, label: 'Night' },
] as const;
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const inputClass = 'mt-1 min-h-12 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm text-primary';

export default function TaskTemplatesScreen() {
  const templates = useApiResource(AdminRepository.getTaskTemplates, [], 'Could not load task templates.');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const query = search.trim().toLowerCase();
  const matchingTemplates = templates.data?.filter(template =>
    [template.taskName, template.category, template.ageGroup].some(value => value?.toLowerCase().includes(query)),
  ) ?? [];

  const openForm = () => {
    setNotice('');
    setShowForm(true);
  };

  const handleCreated = (template: TaskTemplate) => {
    setShowForm(false);
    setSearch('');
    setNotice(`${template.taskName} was added to the catalog.`);
    templates.reload();
  };

  return (
    <div className="pb-24">
      <FFPageHeader title="Task Templates" subtitle="Routine templates for families" showBack
        rightAction={
          <FFButton size="sm" variant="ghost" className="border border-white/25 text-white" disabled={showForm}
            icon={<Plus className="h-4 w-4" />} onClick={openForm}>New</FFButton>
        }
      />
      <main className="page-enter space-y-4 px-4 py-5">
        {showForm ? (
          <TemplateForm onCancel={() => setShowForm(false)} onCreated={handleCreated} />
        ) : (
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input type="search" aria-label="Search templates" placeholder="Search by name, category, or age group"
              className="min-h-12 w-full rounded-xl border border-primary/10 bg-white pl-11 pr-4 text-sm text-primary"
              value={search} onChange={event => setSearch(event.target.value)} />
          </div>
        )}
        {notice && <p role="status" className="rounded-xl bg-success/10 p-3 text-sm text-success">{notice}</p>}

        {templates.isLoading ? (
          <FFShimmer className="h-36 rounded-ff" />
        ) : templates.error ? (
          <FFErrorState message={templates.error} onRetry={templates.reload} />
        ) : matchingTemplates.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {matchingTemplates.map(template => (
              <FFCard key={template.templateId} className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary"><ClipboardList className="h-5 w-5" aria-hidden="true" /></div>
                  <div className="min-w-0">
                    <h2 className="break-words font-display text-sm font-semibold text-primary">{template.taskName}</h2>
                    <p className="break-words text-xs text-slate-600">{template.category} · {template.ageGroup ? `Age ${template.ageGroup}` : 'All ages'}</p>
                  </div>
                </div>
                {template.instructions && <p className="break-words text-sm text-slate-600">{template.instructions}</p>}
                <p className="border-t border-primary/10 pt-3 text-xs text-slate-600">
                  {timeBlocks.find(block => block.value === template.timeBlock)?.label} · {template.durationMinutes} min · {template.coinValue} coins
                  {template.isPhotoRequired && ' · Photo required'}
                </p>
              </FFCard>
            ))}
          </div>
        ) : !showForm && (
          <FFEmptyState icon={<ClipboardList className="h-8 w-8 text-gray-400" />}
            title={query ? 'No matching templates' : 'No templates'}
            message={query ? 'Try a different search.' : 'Add a task template to start the catalog.'}
            actionLabel={!query ? 'Add Template' : undefined}
            onAction={!query ? openForm : undefined} />
        )}
      </main>
    </div>
  );
}

function TemplateForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: (template: TaskTemplate) => void }) {
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurringDays, setRecurringDays] = useState(() => weekdays.map((_, index) => index + 1));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current) return;
    const fields = new FormData(event.currentTarget);
    const value = (name: string) => String(fields.get(name) ?? '').trim();
    const taskName = value('taskName');
    const category = value('category');
    if (taskName.length < 2 || !category || (isRecurring && recurringDays.length === 0)) {
      setError('Enter a name of at least two characters, a category, and at least one day for a repeating template.');
      return;
    }

    pending.current = true;
    setIsSaving(true);
    setError('');
    try {
      const created = await AdminRepository.createTaskTemplate({
        taskName,
        category,
        ageGroup: value('ageGroup') || undefined,
        instructions: value('instructions') || undefined,
        timeBlock: timeBlocks.find(block => String(block.value) === value('timeBlock'))?.value ?? 1,
        durationMinutes: Number(value('duration')),
        coinValue: Number(value('coins')),
        pillarTag: PILLAR_TAG_OPTIONS.find(tag => tag === value('pillar')),
        isPhotoRequired: fields.has('photo'),
        isRecurring,
        recurringDays: isRecurring ? [...recurringDays].sort((a, b) => a - b) : [],
        activeFromDate: value('activeFrom'),
      });
      onCreated(created);
    } catch (caught) {
      const response = isAxiosError<ApiResponse<unknown>>(caught) ? caught.response?.data : undefined;
      setError(response?.errors?.map(item => item.message).join(' ') || response?.message || 'Could not save the template. Please try again.');
    } finally {
      pending.current = false;
      setIsSaving(false);
    }
  };

  return (
    <FFCard className="p-4 sm:p-5">
      <form aria-label="New task template" onSubmit={save} className="space-y-4">
        <h2 className="font-display text-base font-semibold text-primary">New task template</h2>
        <fieldset disabled={isSaving} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-primary">
            Task name
            <input name="taskName" className={inputClass} required minLength={2} maxLength={200} autoFocus />
          </label>
          <label className="text-sm font-semibold text-primary">
            Category
            <input name="category" className={inputClass} required maxLength={50} />
          </label>
          <label className="text-sm font-semibold text-primary">
            Age group
            <input name="ageGroup" className={inputClass} placeholder="Optional, e.g. 10 or 8–12" maxLength={50} />
          </label>
          <label className="text-sm font-semibold text-primary">
            Time block
            <select name="timeBlock" className={inputClass}>
              {timeBlocks.map(block => <option key={block.value} value={block.value}>{block.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-primary">
            Duration (minutes)
            <input name="duration" type="number" className={inputClass} required min={5} max={120} defaultValue={15} />
          </label>
          <label className="text-sm font-semibold text-primary">
            Coins
            <input name="coins" type="number" className={inputClass} required min={5} max={200} defaultValue={10} />
          </label>
          <label className="text-sm font-semibold text-primary">
            Pillar
            <select name="pillar" className={inputClass}>
              <option value="">None</option>
              {PILLAR_TAG_OPTIONS.map(tag => <option key={tag} value={tag}>{tag === 'ScreenControl' ? 'Screen control' : tag}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-primary">
            Active from
            <input name="activeFrom" type="date" className={inputClass} required defaultValue={new Date().toISOString().slice(0, 10)} />
          </label>
          <label className="text-sm font-semibold text-primary sm:col-span-2">
            Instructions
            <textarea name="instructions" rows={3} maxLength={1000} className={`${inputClass} py-2`} placeholder="Optional" />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-primary">
            <input name="photo" type="checkbox" className="accent-primary" /> Require photo evidence
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-primary">
            <input type="checkbox" className="accent-primary" checked={isRecurring} onChange={event => setIsRecurring(event.target.checked)} /> Repeat weekly
          </label>
          {isRecurring && (
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm font-semibold text-primary">Repeat on</legend>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day, index) => {
                  const id = index + 1;
                  return (
                    <label key={day} className="flex items-center gap-2 rounded-xl border border-primary/15 px-3 py-2 text-sm text-primary">
                      <input type="checkbox" className="accent-primary" checked={recurringDays.includes(id)}
                        onChange={event => setRecurringDays(event.target.checked ? [...recurringDays, id] : recurringDays.filter(item => item !== id))} />
                      {day}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        </fieldset>
        {error && <p role="alert" className="text-sm text-alert">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <FFButton type="submit" isLoading={isSaving} aria-label="Save template">Save template</FFButton>
          <FFButton type="button" variant="outline" disabled={isSaving} onClick={onCancel}>Cancel</FFButton>
        </div>
      </form>
    </FFCard>
  );
}
