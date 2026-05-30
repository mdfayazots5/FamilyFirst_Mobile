import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, AlertTriangle, ChevronRight,
  RefreshCw, Settings, List, PieChart, Calendar,
} from 'lucide-react';
import { FinanceProvider, useFinance } from '../providers/FinanceProvider';
import { FinanceTransaction } from '../repositories/FinanceRepository';

const CATEGORY_LABELS: Record<string, string> = {
  GroceriesKirana: '🛒 Groceries', FoodDining: '🍔 Food', Utilities: '💡 Utilities',
  MobileRecharge: '📱 Recharge', EducationSchool: '📚 School', MedicalHealth: '🏥 Medical',
  TravelTransport: '🚗 Travel', Shopping: '🛍 Shopping', InsuranceLIC: '🛡 Insurance',
  LoanEmi: '🏦 Loan EMI', DomesticHelp: '🏠 Help', Entertainment: '🎬 Entertainment',
  DonationsReligion: '🙏 Donations', ChitFundInvestment: '📈 Investment',
};

const HealthGauge: React.FC<{ status: 'Green' | 'Amber' | 'Red'; rate: number }> = ({ status, rate }) => {
  const color = status === 'Green' ? '#2D6A4F' : status === 'Amber' ? '#C8922A' : '#C1121F';
  const angle = Math.min(rate / 100 * 180, 180);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path d="M10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
          <path
            d="M10 60 A 50 50 0 0 1 110 60"
            fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * 157} 157`}
          />
        </svg>
      </div>
      <p className="text-xs font-semibold mt-1" style={{ color }}>
        {status === 'Green' ? 'Healthy' : status === 'Amber' ? 'Watch Spend' : 'Overspending'}
      </p>
    </div>
  );
};

const TxRow: React.FC<{ tx: FinanceTransaction }> = ({ tx }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
      {(CATEGORY_LABELS[tx.category] ?? '💸').split(' ')[0]}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-[#1A2E4A] truncate">
        {tx.merchantName ?? (tx.isCategoryBlurred ? '••••' : CATEGORY_LABELS[tx.category] ?? tx.category)}
      </p>
      <p className="text-xs text-gray-400">{tx.memberName} · {new Date(tx.parsedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
    <p className={`text-sm font-bold flex-shrink-0 ${tx.transactionType === 'Debit' ? 'text-[#1A2E4A]' : 'text-[#2D6A4F]'}`}>
      {tx.transactionType === 'Credit' ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN')}
    </p>
  </div>
);

const FinanceDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { dashboard, isLoading, loadDashboard } = useFinance();

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  if (isLoading || !dashboard) {
    return (
      <div className="flex justify-center py-16">
        <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
      </div>
    );
  }

  const { healthScore, memberCards, todaysTransactions, alerts, upcomingCommitments } = dashboard;

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Header */}
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Family Finance
            </h1>
            <p className="text-xs text-blue-200 mt-0.5">
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadDashboard} className="p-2 rounded-xl bg-white/10">
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => navigate('/finance/settings')} className="p-2 rounded-xl bg-white/10">
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Family Health Score */}
        <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
          <HealthGauge status={healthScore.healthStatus} rate={healthScore.savingsRatePct} />
          <div className="flex-1 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-blue-200">Spend MTD</span>
              <span className="text-white font-semibold">₹{healthScore.totalSpendMtd.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-blue-200">Income MTD</span>
              <span className="text-white font-semibold">₹{healthScore.totalIncomeMtd.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-blue-200">Savings</span>
              <span className="text-[#C8922A] font-bold">
                {healthScore.savingsRatePct.toFixed(1)}%
                {healthScore.netSavingsMtd >= 0 ? (
                  <TrendingUp className="inline w-3 h-3 ml-0.5 text-[#2D6A4F]" />
                ) : (
                  <TrendingDown className="inline w-3 h-3 ml-0.5 text-red-400" />
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 rounded-2xl px-4 py-3 ${
                  a.severity === 'Critical' ? 'bg-red-50 border border-red-100' :
                  a.severity === 'Warning'  ? 'bg-amber-50 border border-amber-100' :
                  'bg-blue-50 border border-blue-100'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  a.severity === 'Critical' ? 'text-red-600' :
                  a.severity === 'Warning'  ? 'text-amber-600' : 'text-blue-600'
                }`} />
                <p className={`text-xs font-medium flex-1 ${
                  a.severity === 'Critical' ? 'text-red-700' :
                  a.severity === 'Warning'  ? 'text-amber-700' : 'text-blue-700'
                }`}>{a.message}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Nav */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: List,     label: 'Transactions', path: '/finance/transactions' },
            { icon: PieChart, label: 'Categories',   path: '/finance/categories' },
            { icon: TrendingUp, label: 'Budget',     path: '/finance/budget' },
            { icon: Calendar, label: 'Commitments',  path: '/finance/commitments' },
          ].map(({ icon: Icon, label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1.5 bg-white rounded-2xl p-3 shadow-sm"
            >
              <Icon className="w-5 h-5 text-[#1A2E4A]" />
              <span className="text-xs text-gray-500">{label}</span>
            </button>
          ))}
        </div>

        {/* Member cards */}
        <div>
          <h2 className="text-sm font-bold text-[#1A2E4A] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Member Spend
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {memberCards.map(card => (
              <div key={card.memberId} className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm w-40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-[#1A2E4A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {card.memberName.charAt(0)}
                  </div>
                  <p className="text-xs font-semibold text-[#1A2E4A] truncate flex-1">{card.memberName}</p>
                  {card.isAboveThreshold && (
                    <span className="text-xs text-amber-600">⚠</span>
                  )}
                </div>
                {card.privacyTier === 3 ? (
                  <>
                    <p className="text-xs text-gray-400">Month Total</p>
                    <p className="text-base font-bold text-[#1A2E4A]">
                      ₹{(card.monthTotal ?? 0).toLocaleString('en-IN')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-400">Today</p>
                    <p className="text-sm font-bold text-[#1A2E4A]">
                      ₹{(card.todaySpend ?? 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Month: ₹{(card.monthSpend ?? 0).toLocaleString('en-IN')}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's transactions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Today's Activity
            </h2>
            <button onClick={() => navigate('/finance/transactions')}
              className="text-xs text-[#C8922A] font-medium flex items-center gap-0.5">
              All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-white rounded-2xl px-4 shadow-sm">
            {todaysTransactions.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No transactions today.</p>
            ) : (
              todaysTransactions.slice(0, 5).map(tx => <TxRow key={tx.transactionId} tx={tx} />)
            )}
          </div>
        </div>

        {/* Upcoming commitments */}
        {upcomingCommitments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Upcoming Commitments
              </h2>
              <button onClick={() => navigate('/finance/commitments')}
                className="text-xs text-[#C8922A] font-medium flex items-center gap-0.5">
                All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {upcomingCommitments.map(c => {
                const daysLeft = Math.round(
                  (new Date(c.nextDueDate).getTime() - Date.now()) / 86400000
                );
                return (
                  <div key={c.commitmentId} className={`flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border ${
                    c.status === 'Missed' ? 'border-red-200' : 'border-transparent'
                  }`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A2E4A]">{c.commitmentName}</p>
                      <p className="text-xs text-gray-400">{c.memberName} · {c.frequencyType}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#1A2E4A]">
                        ₹{c.amount.toLocaleString('en-IN')}
                      </p>
                      <p className={`text-xs font-medium ${
                        c.status === 'Missed' ? 'text-red-600' :
                        daysLeft <= 3 ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        {c.status === 'Missed' ? 'Missed' : `Due in ${daysLeft}d`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FinanceDashboardScreen: React.FC = () => (
  <FinanceProvider>
    <FinanceDashboardContent />
  </FinanceProvider>
);

export default FinanceDashboardScreen;
