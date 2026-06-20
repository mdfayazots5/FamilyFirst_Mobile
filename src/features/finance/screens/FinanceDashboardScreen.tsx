import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, AlertTriangle, ChevronRight,
  Settings, List, PieChart, Calendar,
} from 'lucide-react';
import { FinanceProvider, useFinance } from '../providers/FinanceProvider';
import { FinanceTransaction } from '../repositories/FinanceRepository';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const CATEGORY_LABELS: Record<string, string> = {
  GroceriesKirana: '🛒 Groceries', FoodDining: '🍔 Food', Utilities: '💡 Utilities',
  MobileRecharge: '📱 Recharge', EducationSchool: '📚 School', MedicalHealth: '🏥 Medical',
  TravelTransport: '🚗 Travel', Shopping: '🛍 Shopping', InsuranceLIC: '🛡 Insurance',
  LoanEmi: '🏦 Loan EMI', DomesticHelp: '🏠 Help', Entertainment: '🎬 Entertainment',
  DonationsReligion: '🙏 Donations', ChitFundInvestment: '📈 Investment',
};

// Hex used inside SVG attributes — CSS token classes don't apply to SVG fill/stroke
const GAUGE_COLORS = { Green: '#2D6A4F', Amber: '#C8922A', Red: '#C1121F' };
const GAUGE_LABELS = { Green: 'Healthy', Amber: 'Watch Spend', Red: 'Overspending' };
const GAUGE_TEXT   = { Green: 'text-success', Amber: 'text-accent', Red: 'text-alert' };

const HealthGauge: React.FC<{ status: 'Green' | 'Amber' | 'Red'; rate: number }> = ({ status, rate }) => {
  const color = GAUGE_COLORS[status];
  const angle = Math.min(rate / 100 * 180, 180);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path d="M10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
          <path d="M10 60 A 50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * 157} 157`} />
        </svg>
      </div>
      <p className={`font-body text-xs font-semibold mt-1 ${GAUGE_TEXT[status]}`}>
        {GAUGE_LABELS[status]}
      </p>
    </div>
  );
};

const TxRow: React.FC<{ tx: FinanceTransaction }> = ({ tx }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-black/5 last:border-0">
    <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center text-base flex-shrink-0">
      {(CATEGORY_LABELS[tx.category] ?? '💸').split(' ')[0]}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-body text-sm font-medium text-primary truncate">
        {tx.merchantName ?? (tx.isCategoryBlurred ? '••••' : CATEGORY_LABELS[tx.category] ?? tx.category)}
      </p>
      <p className="font-body text-xs text-gray-400">
        {tx.memberName} · {new Date(tx.parsedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
    <p className={`font-numbers text-sm font-semibold flex-shrink-0 ${tx.transactionType === 'Debit' ? 'text-primary' : 'text-success'}`}>
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
      <div className="min-h-screen bg-bg-cream">
        <FFPageHeader title="Family Finance" />
        <div className="px-4 pt-4 space-y-3">
          <FFShimmer className="h-28 rounded-ff" />
          <FFShimmer className="h-16 rounded-ff" />
          <FFShimmer className="h-40 rounded-ff" />
        </div>
      </div>
    );
  }

  const { healthScore, memberCards, todaysTransactions, alerts, upcomingCommitments } = dashboard;

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Family Finance"
        subtitle={new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        rightAction={
          <div className="flex gap-1">
            <button onClick={loadDashboard} className="p-2 rounded-xl bg-white/10" aria-label="Refresh">
              <TrendingUp className="w-4 h-4 text-white" />
            </button>
            <button onClick={() => navigate('/finance/settings')} className="p-2 rounded-xl bg-white/10" aria-label="Settings">
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
        }
      />

      {/* Health score strip — inside header */}
      <div className="bg-primary px-5 pb-5">
        <div className="bg-white/10 rounded-ff p-4 flex items-center gap-4">
          <HealthGauge status={healthScore.healthStatus} rate={healthScore.savingsRatePct} />
          <div className="flex-1 space-y-1">
            <div className="flex justify-between font-body text-xs">
              <span className="text-white/60">Spend MTD</span>
              <span className="text-white font-semibold">₹{healthScore.totalSpendMtd.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-body text-xs">
              <span className="text-white/60">Income MTD</span>
              <span className="text-white font-semibold">₹{healthScore.totalIncomeMtd.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-numbers text-xs">
              <span className="text-white/60">Savings</span>
              <span className="text-accent font-bold">
                {healthScore.savingsRatePct.toFixed(1)}%
                {healthScore.netSavingsMtd >= 0
                  ? <TrendingUp className="inline w-3 h-3 ml-0.5 text-success" />
                  : <TrendingDown className="inline w-3 h-3 ml-0.5 text-alert" />
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4 page-enter">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-ff px-4 py-3 border ${
                  a.severity === 'Critical' ? 'bg-alert/5 border-alert/20' :
                  a.severity === 'Warning'  ? 'bg-accent/10 border-accent/20' :
                  'bg-primary/5 border-primary/20'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  a.severity === 'Critical' ? 'text-alert' :
                  a.severity === 'Warning'  ? 'text-accent' : 'text-primary'
                }`} />
                <p className={`font-body text-xs font-medium flex-1 ${
                  a.severity === 'Critical' ? 'text-alert' :
                  a.severity === 'Warning'  ? 'text-accent' : 'text-primary'
                }`}>{a.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Nav */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: List,       label: 'Transactions', path: '/finance/transactions' },
            { icon: PieChart,   label: 'Categories',   path: '/finance/categories' },
            { icon: TrendingUp, label: 'Budget',       path: '/finance/budget' },
            { icon: Calendar,   label: 'Commitments',  path: '/finance/commitments' },
          ].map(({ icon: Icon, label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1.5 bg-white border border-black/5 rounded-ff p-3 shadow-card"
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="font-body text-xs text-gray-500">{label}</span>
            </button>
          ))}
        </div>

        {/* Member cards */}
        <div>
          <FFSectionHeader title="Member Spend" />
          <div className="flex gap-3 overflow-x-auto pb-1 mt-2">
            {memberCards.map(card => (
              <div key={card.memberId} className="flex-shrink-0 bg-white border border-black/5 rounded-ff p-4 shadow-card w-40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white font-numbers font-bold text-xs">
                    {card.memberName.charAt(0)}
                  </div>
                  <p className="font-body text-xs font-semibold text-primary truncate flex-1">{card.memberName}</p>
                  {card.isAboveThreshold && (
                    <AlertTriangle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  )}
                </div>
                {card.privacyTier === 3 ? (
                  <>
                    <p className="font-body text-xs text-gray-400">Month Total</p>
                    <p className="font-numbers text-base font-bold text-primary">
                      ₹{(card.monthTotal ?? 0).toLocaleString('en-IN')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-body text-xs text-gray-400">Today</p>
                    <p className="font-numbers text-sm font-bold text-primary">
                      ₹{(card.todaySpend ?? 0).toLocaleString('en-IN')}
                    </p>
                    <p className="font-body text-xs text-gray-400 mt-1">
                      Month: ₹{(card.monthSpend ?? 0).toLocaleString('en-IN')}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's transactions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FFSectionHeader title="Today's Activity" />
            <button onClick={() => navigate('/finance/transactions')}
              className="font-body text-xs text-accent font-medium flex items-center gap-0.5">
              All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <FFCard className="px-4">
            {todaysTransactions.length === 0 ? (
              <p className="font-body text-xs text-gray-400 py-4 text-center">No transactions today.</p>
            ) : (
              todaysTransactions.slice(0, 5).map(tx => <TxRow key={tx.transactionId} tx={tx} />)
            )}
          </FFCard>
        </div>

        {/* Upcoming commitments */}
        {upcomingCommitments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <FFSectionHeader title="Upcoming Commitments" />
              <button onClick={() => navigate('/finance/commitments')}
                className="font-body text-xs text-accent font-medium flex items-center gap-0.5">
                All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {upcomingCommitments.map(c => {
                const daysLeft = Math.round(
                  (new Date(c.nextDueDate).getTime() - Date.now()) / 86400000,
                );
                return (
                  <FFCard
                    key={c.commitmentId}
                    className={`flex items-center gap-3 p-4 ${c.status === 'Missed' ? 'border border-alert/20' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-semibold text-primary">{c.commitmentName}</p>
                      <p className="font-body text-xs text-gray-400">{c.memberName} · {c.frequencyType}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-numbers text-sm font-bold text-primary">
                        ₹{c.amount.toLocaleString('en-IN')}
                      </p>
                      <p className={`font-body text-xs font-medium ${
                        c.status === 'Missed' ? 'text-alert' :
                        daysLeft <= 3 ? 'text-accent' : 'text-gray-400'
                      }`}>
                        {c.status === 'Missed' ? 'Missed' : `Due in ${daysLeft}d`}
                      </p>
                    </div>
                  </FFCard>
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
