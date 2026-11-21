import React, { useEffect, useState } from 'react';
import { Edit3, Save } from 'lucide-react';
import { FinanceProvider, useFinance } from '../providers/FinanceProvider';
import { FinanceRepository, FINANCE_CATEGORY_ICONS, FINANCE_DEFAULT_ICON } from '../repositories/FinanceRepository';
import FFErrorState from '../../../shared/components/FFErrorState';
import { useAuth } from '../../../core/auth/AuthContext';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';

const BudgetManagerContent: React.FC = () => {
  const { user } = useAuth();
  const { budgets, isLoading, error, loadBudgets, categoryLabel } = useFinance();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { loadBudgets(); }, [loadBudgets]);

  const startEdit = (category: string, currentAmount: number) => {
    setEditingCategory(category);
    setEditValue(currentAmount > 0 ? currentAmount.toString() : '');
  };

  const handleSave = async () => {
    if (!user?.familyId || !editingCategory) return;
    setSaving(true);
    setSaveError(null);
    try {
      await FinanceRepository.setBudget(user.familyId, {
        category: editingCategory,
        budgetAmount: parseFloat(editValue) || 0,
      });
      await loadBudgets();
      setEditingCategory(null);
    } catch {
      setSaveError('The budget could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Budget Manager"
        subtitle={new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        showBack
      />

      <div className="px-4 pt-4 pb-24 space-y-3">
        {saveError && <p role="alert" className="font-body text-sm text-alert">{saveError}</p>}
        {isLoading ? (
          [...Array(6)].map((_, i) => <FFShimmer key={i} className="h-20 rounded-ff" />)
        ) : error ? (
          <FFErrorState message={error} onRetry={() => void loadBudgets()} />
        ) : (
          budgets.map(budget => {
            const isEditing = editingCategory === budget.category;
            const statusColor =
              budget.status === 'Red'   ? 'bg-alert' :
              budget.status === 'Amber' ? 'bg-accent' : 'bg-success';

            return (
              <FFCard key={budget.category} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-body text-sm font-semibold text-primary">
                    {FINANCE_CATEGORY_ICONS[budget.category] ?? FINANCE_DEFAULT_ICON} {categoryLabel(budget.category)}
                  </p>
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(budget.category, budget.budgetAmount)}
                      className="p-1.5 rounded-lg hover:bg-black/5"
                      aria-label="Edit budget"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-numbers text-sm text-gray-500">₹</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      placeholder="Monthly budget"
                      className="flex-1 border border-black/5 rounded-xl px-3 py-1.5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                      autoFocus
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving || !editValue}
                      className="p-2 bg-primary rounded-xl text-white disabled:opacity-50"
                      aria-label="Save"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-2 rounded-xl hover:bg-black/5"
                    >
                      <span className="font-body text-xs text-gray-400">Cancel</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between font-numbers text-xs text-gray-400 mb-1.5">
                      <span>₹{budget.actualSpend.toLocaleString('en-IN')} spent</span>
                      <span>
                        {budget.budgetAmount > 0
                          ? `₹${budget.budgetAmount.toLocaleString('en-IN')} budget`
                          : 'No budget set'}
                      </span>
                    </div>
                    {budget.budgetAmount > 0 && (
                      <div className="bg-black/5 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${statusColor}`}
                          style={{ width: `${Math.min(budget.utilisationPct ?? 0, 100)}%` }}
                        />
                      </div>
                    )}
                    {budget.budgetAmount > 0 && (
                      <p className={`font-body text-xs mt-1 font-medium ${
                        budget.status === 'Red'   ? 'text-alert' :
                        budget.status === 'Amber' ? 'text-accent' : 'text-gray-400'
                      }`}>
                        {budget.status === 'Red'
                          ? `Over by ₹${Math.abs(budget.remaining).toLocaleString('en-IN')}`
                          : `₹${budget.remaining.toLocaleString('en-IN')} remaining`}
                        {budget.utilisationPct != null && ` · ${budget.utilisationPct.toFixed(0)}% used`}
                      </p>
                    )}
                  </>
                )}
              </FFCard>
            );
          })
        )}
      </div>
    </div>
  );
};

const BudgetManagerScreen: React.FC = () => (
  <FinanceProvider>
    <BudgetManagerContent />
  </FinanceProvider>
);

export default BudgetManagerScreen;
