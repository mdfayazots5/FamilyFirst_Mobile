import React, { useEffect, useReducer } from 'react';
import { ArrowDownLeft, ArrowUpRight, Calendar, Coins, Download, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../../core/auth/AuthContext';
import { RewardRepository, CoinTransaction } from '../../parent/repositories/RewardRepository';
import { FamilyRepository, FamilyMember } from '../../family/repositories/FamilyRepository';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';

interface ExtendedTransaction extends CoinTransaction {
  childName: string;
}

type State = {
  transactions: ExtendedTransaction[];
  children: FamilyMember[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filterType: 'all' | 'Earned' | 'Spent';
};

type Action =
  | { type: 'SET_TRANSACTIONS'; transactions: ExtendedTransaction[] }
  | { type: 'SET_CHILDREN'; children: FamilyMember[] }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_SEARCH'; searchQuery: string }
  | { type: 'SET_FILTER'; filterType: 'all' | 'Earned' | 'Spent' };

const initialState: State = {
  transactions: [],
  children: [],
  isLoading: true,
  error: null,
  searchQuery: '',
  filterType: 'all',
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.transactions, error: null };
    case 'SET_CHILDREN':
      return { ...state, children: action.children };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.searchQuery };
    case 'SET_FILTER':
      return { ...state, filterType: action.filterType };
    default:
      return state;
  }
};

const FamilyLedgerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadLedger = async () => {
    if (!user?.familyId) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      dispatch({ type: 'SET_ERROR', error: 'Family membership is required to view the ledger.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const members = await FamilyRepository.getMembers(user.familyId);
      const children = members.filter((member) => member.role === 'CHILD');
      dispatch({ type: 'SET_CHILDREN', children });

      const history = await Promise.all(
        children.map(async (child) => {
          const items = await RewardRepository.getCoinHistory(child.id);
          return items.map((item) => ({ ...item, childName: child.name }));
        }),
      );

      const transactions = history
        .flat()
        .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

      dispatch({ type: 'SET_TRANSACTIONS', transactions });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'We could not load the family ledger.';
      dispatch({ type: 'SET_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  useEffect(() => {
    void loadLedger();
  }, [user?.familyId]);

  const filteredTransactions = state.transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      transaction.childName.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesFilter =
      state.filterType === 'all' || transaction.type === state.filterType;
    return matchesSearch && matchesFilter;
  });

  const totals = state.transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === 'Earned') {
        summary.earned += transaction.amount;
      } else {
        summary.spent += transaction.amount;
      }
      return summary;
    },
    { earned: 0, spent: 0 },
  );

  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader
        title="Family ledger"
        subtitle="A clear view of coins earned and spent"
        showBack
        onBack={() => navigate(-1)}
        rightAction={
          <FFButton variant="ghost" icon={<Download className="h-4 w-4" />}>
            Export
          </FFButton>
        }
      />

      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <FFCard variant="primary" className="space-y-3 p-6 text-white">
            <p className="font-display text-xl font-bold text-white">Family coin flow</p>
            <p className="text-sm text-white/75">
              Track the rewards children earn and what the family spends them on.
            </p>
          </FFCard>

          <div className="grid gap-3 sm:grid-cols-3">
            <FFCard className="p-4">
              <p className="text-xs font-semibold text-gray-500">Coins earned</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{totals.earned}</p>
            </FFCard>
            <FFCard className="p-4">
              <p className="text-xs font-semibold text-gray-500">Coins spent</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{totals.spent}</p>
            </FFCard>
            <FFCard className="p-4">
              <p className="text-xs font-semibold text-gray-500">Children tracked</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{state.children.length}</p>
            </FFCard>
          </div>

          <FFCard className="space-y-4 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<Filter />} title="Filter" />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={state.searchQuery}
                  onChange={(event) => dispatch({ type: 'SET_SEARCH', searchQuery: event.target.value })}
                  placeholder="Search by child or description"
                  className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-10 py-3 text-sm text-primary outline-none transition focus:border-accent"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'Earned', 'Spent'] as const).map((filterType) => (
                  <FFButton
                    key={filterType}
                    variant={state.filterType === filterType ? 'primary' : 'outline'}
                    onClick={() => dispatch({ type: 'SET_FILTER', filterType })}
                  >
                    {filterType}
                  </FFButton>
                ))}
              </div>
            </div>
          </FFCard>

          <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<Coins />} title="Transactions" />

            {state.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <FFShimmer key={index} height="6rem" borderRadius="1rem" className="shimmer" />
                ))}
              </div>
            ) : null}

            {!state.isLoading && state.error ? (
              <FFErrorState title="Ledger could not load" message={state.error} onRetry={() => void loadLedger()} />
            ) : null}

            {!state.isLoading && !state.error && filteredTransactions.length === 0 ? (
              <FFEmptyState
                title="No matching ledger entries"
                message="Try a different search or filter to see more of your family activity."
              />
            ) : null}

            {!state.isLoading && !state.error && filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <FFCard key={transaction.id} variant="warm" className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            transaction.type === 'Earned'
                              ? 'bg-success/10 text-success'
                              : 'bg-alert/10 text-alert'
                          }`}
                        >
                          {transaction.type === 'Earned' ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-semibold text-primary">
                            {transaction.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            <FFAvatar name={transaction.childName} size="sm" />
                            <span>{transaction.childName}</span>
                            <span className="text-gray-300">•</span>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p
                        className={`font-numbers text-lg ${
                          transaction.type === 'Earned' ? 'text-success' : 'text-alert'
                        }`}
                      >
                        {transaction.type === 'Earned' ? '+' : '-'}
                        {transaction.amount}
                      </p>
                    </div>
                  </FFCard>
                ))}
              </div>
            ) : null}
          </FFCard>
        </motion.div>
      </main>
    </div>
  );
};

export default FamilyLedgerScreen;
