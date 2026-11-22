import { useRef, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Plus, ShoppingBag, Coins } from 'lucide-react';
import { useApiResource } from '../../../core/hooks/useApiResource';
import type { ApiResponse } from '../../../core/network/apiTypes';
import FFBadge from '../../../shared/components/FFBadge';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import RewardIcon from '../../../shared/components/RewardIcon';
import { AdminRepository, type RewardCatalogItem } from '../repositories/AdminRepository';

const categories: Record<string, string> = {
  FamilyActivity: 'Family activity',
  FoodTreat: 'Food treat',
  Outing: 'Outing',
  Purchase: 'Purchase',
  ScreenTime: 'Screen time',
};
const fieldClass = 'mt-1 min-h-12 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm text-primary';

export default function RewardCatalogScreen() {
  const catalog = useApiResource(AdminRepository.getRewardCatalog, [], 'Could not load the reward catalog. Please try again.');
  const [editor, setEditor] = useState<{ reward?: RewardCatalogItem } | null>(null);
  const [notice, setNotice] = useState('');
  const openEditor = (reward?: RewardCatalogItem) => {
    setNotice('');
    setEditor({ reward });
  };

  return (
    <div className="pb-24">
      <FFPageHeader title="Reward Catalog" subtitle="Global reward templates for families" showBack
        rightAction={
          <FFButton size="sm" variant="ghost" className="border border-white/25 text-white" disabled={editor !== null}
            icon={<Plus className="h-4 w-4" />} onClick={() => openEditor()}>Add</FFButton>
        }
      />

      <main className="page-enter space-y-4 px-4 py-5">
        {editor && <RewardForm reward={editor.reward} onCancel={() => setEditor(null)} onSaved={reward => {
          setNotice(`${reward.title} ${editor.reward ? 'updated' : 'added to the catalog'}.`);
          setEditor(null);
          catalog.reload();
        }} />}
        {notice && <p role="status" className="rounded-xl bg-success/10 p-3 text-sm text-success">{notice}</p>}

        {catalog.isLoading ? (
          <FFShimmer className="h-40 rounded-ff" />
        ) : catalog.error ? (
          <FFErrorState message={catalog.error} onRetry={catalog.reload} />
        ) : catalog.data?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {catalog.data.map(reward => (
              <FFCard key={reward.id} className="flex flex-col gap-3 p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="shrink-0 rounded-xl bg-accent/15 p-2 text-primary">
                    <RewardIcon code={reward.icon} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words font-display text-sm font-semibold text-primary">{reward.title}</h2>
                    <p className="text-xs text-slate-600">{categories[reward.category] ?? reward.category}</p>
                  </div>
                  <FFButton size="sm" variant="outline" disabled={editor !== null} aria-label={`Edit ${reward.title}`}
                    onClick={() => openEditor(reward)}>Edit</FFButton>
                </div>
                {reward.description && <p className="break-words text-sm text-slate-600">{reward.description}</p>}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-primary/10 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <Coins className="h-4 w-4 text-accent" aria-hidden="true" />
                    {reward.cost.toLocaleString('en-IN')} coins
                  </span>
                  <FFBadge variant={reward.isEnabled ? 'success' : 'gray'} size="sm">{reward.isEnabled ? 'Available' : 'Disabled'}</FFBadge>
                </div>
              </FFCard>
            ))}
          </div>
        ) : !editor && (
          <FFEmptyState icon={<ShoppingBag className="h-8 w-8 text-gray-400" />} title="No rewards yet"
            message="Add a reward template for families to use." actionLabel="Add first reward" onAction={() => openEditor()} />
        )}
      </main>
    </div>
  );
}

function RewardForm({ reward, onSaved, onCancel }: {
  reward?: RewardCatalogItem;
  onSaved: (saved: RewardCatalogItem) => void;
  onCancel: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current) return;
    const fields = new FormData(event.currentTarget);
    const rewardName = String(fields.get('name') ?? '').trim();
    if (rewardName.length < 2) {
      setError('Enter a name of at least two characters.');
      return;
    }
    const coinCost = Number(fields.get('cost'));
    pending.current = true;
    setIsSaving(true);
    setError('');
    try {
      const saved = reward
        ? await AdminRepository.updateCatalogReward(reward.id, { rewardName, coinCost, isEnabled: fields.has('enabled') })
        : await AdminRepository.createCatalogReward({
          rewardName,
          coinCost,
          category: String(fields.get('category') ?? ''),
          description: String(fields.get('description') ?? '').trim() || undefined,
        });
      onSaved(saved);
    } catch (caught) {
      const response = isAxiosError<ApiResponse<unknown>>(caught) ? caught.response?.data : undefined;
      setError(response?.errors?.map(item => item.message).join(' ') || response?.message || 'Could not save the reward. Please try again.');
    } finally {
      pending.current = false;
      setIsSaving(false);
    }
  };

  const title = reward ? 'Edit reward' : 'Add reward';
  return (
    <FFCard className="p-4 sm:p-5">
      <form aria-label={title} onSubmit={save} className="space-y-4">
        <h2 className="font-display text-base font-semibold text-primary">{title}</h2>
        <fieldset disabled={isSaving} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-primary">
            Reward name
            <input name="name" className={fieldClass} defaultValue={reward?.title} required minLength={2} maxLength={200} autoFocus />
          </label>
          <label className="text-sm font-semibold text-primary">
            Coin cost
            <input name="cost" type="number" className={fieldClass} defaultValue={reward?.cost} required min={10} max={9999} />
          </label>
          {reward ? (
            <label className="flex items-start gap-2 text-sm text-primary sm:col-span-2">
              <input name="enabled" type="checkbox" defaultChecked={reward.isEnabled} className="mt-1 accent-primary" />
              <span>Available for new family use
                <span className="block text-xs text-slate-600">Families that already added this reward keep their copy.</span>
              </span>
            </label>
          ) : (
            <>
              <label className="text-sm font-semibold text-primary">
                Category
                <select name="category" defaultValue="" required className={fieldClass}>
                  <option value="" disabled>Select a category</option>
                  {Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-primary sm:col-span-2">
                Description
                <textarea name="description" rows={3} maxLength={500} className={`${fieldClass} py-2`} placeholder="Optional" />
              </label>
            </>
          )}
        </fieldset>
        {error && <p role="alert" className="text-sm text-alert">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <FFButton type="submit" isLoading={isSaving} aria-label="Save reward">Save reward</FFButton>
          <FFButton type="button" variant="outline" disabled={isSaving} onClick={onCancel}>Cancel</FFButton>
        </div>
      </form>
    </FFCard>
  );
}
