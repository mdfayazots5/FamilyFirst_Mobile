import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Edit3, Save } from 'lucide-react';
import { FinanceProvider, useFinance } from '../providers/FinanceProvider';
import { FinanceRepository } from '../repositories/FinanceRepository';
import { useAuth } from '../../../core/auth/AuthContext';

const CATEGORY_LABELS: Record<string, string> = {
  GroceriesKirana: '🛒 Groceries & Kirana',
  FoodDining: '🍔 Food & Dining',
  Utilities: '💡 Utilities',
  MobileRecharge: '📱 Mobile Recharge',
  EducationSchool: '📚 Education & School',
  MedicalHealth: '🏥 Medical & Health',
  TravelTransport: '🚗 Travel & Transport',
  Shopping: '🛍 Shopping',
  InsuranceLIC: '🛡 Insurance & LIC',
  LoanEmi: '🏦 Loan EMI',
  DomesticHelp: '🏠 Domestic Help',
  Entertainment: '🎬 Entertainment',
  DonationsReligion: '🙏 Donations',
  ChitFundInvestment: '📈 Chit Fund / Investment',
};

const BudgetManagerContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { budgets, isLoading, loadBudgets } = useFinance();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadBudgets(); }, [loadBudgets]);

  const startEdit = (category: string, currentAmount: number) => {
    setEditingCategory(category);
    setEditValue(currentAmount > 0 ? currentAmount.toString() : '');
  };

  const handleSave = async () => {
    if (!user?.familyId || !editingCategory) return;
    setSaving(true);
    try {
      await FinanceRepository.setBudget(user.familyId, {
        category: editingCategory,
        budgetAmount: parseFloat(editValue) || 0,
      });
      await loadBudgets();
      setEditingCategory(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Budget Manager
            </h1>
            <p className="text-xs text-blue-200">
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button onClick={loadBudgets} className="p-2 rounded-xl bg-white/10">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : (
          budgets.map(budget => {
            const isEditing = editingCategory === budget.category;
            const statusColor = budget.status === 'Red' ? 'bg-red-500' : budget.status === 'Amber' ? 'bg-amber-400' : 'bg-[#2D6A4F]';

            return (
              <div key={budget.category} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-[#1A2E4A]">
                    {CATEGORY_LABELS[budget.category] ?? budget.category}
                  </p>
                  {!isEditing && (
                    <button onClick={() => startEdit(budget.category, budget.budgetAmount)}
                      className="p-1.5 rounded-lg hover:bg-gray-100">
                      <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-500">₹</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      placeholder="Monthly budget"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
                      autoFocus
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="p-2 bg-[#1A2E4A] rounded-xl text-white"
                    >
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setEditingCategory(null)} className="p-2 rounded-xl hover:bg-gray-100">
                      <span className="text-xs text-gray-400">Cancel</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span>₹{budget.actualSpend.toLocaleString('en-IN')} spent</span>
                      <span>{budget.budgetAmount > 0 ? `₹${budget.budgetAmount.toLocaleString('en-IN')} budget` : 'No budget set'}</span>
                    </div>
                    {budget.budgetAmount > 0 && (
                      <div className="bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${statusColor}`}
                          style={{ width: `${Math.min(budget.utilisationPct ?? 0, 100)}%` }}
                        />
                      </div>
                    )}
                    {budget.budgetAmount > 0 && (
                      <p className={`text-xs mt-1 font-medium ${
                        budget.status === 'Red' ? 'text-red-600' :
                        budget.status === 'Amber' ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        {budget.status === 'Red'
                          ? `Over by ₹${Math.abs(budget.remaining).toLocaleString('en-IN')}`
                          : `₹${budget.remaining.toLocaleString('en-IN')} remaining`
                        }
                        {budget.utilisationPct != null && ` · ${budget.utilisationPct.toFixed(0)}% used`}
                      </p>
                    )}
                  </>
                )}
              </div>
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
