import React, { useEffect, useReducer } from 'react';
import { CreditCard, RefreshCw, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FamilyRepository, type FamilyLookupOption } from '../../family/repositories/FamilyRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import { FFCardSkeleton } from '../../../shared/components/FFShimmer';

type SubscriptionState =
  | { status: 'loading'; plans: FamilyLookupOption[]; error: null }
  | { status: 'ready'; plans: FamilyLookupOption[]; error: null }
  | { status: 'error'; plans: FamilyLookupOption[]; error: string };

type SubscriptionAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: FamilyLookupOption[] }
  | { type: 'LOAD_ERROR'; error: string };

const subscriptionReducer = (
  state: SubscriptionState,
  action: SubscriptionAction,
): SubscriptionState => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', plans: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', plans: state.plans, error: action.error };
    default:
      return state;
  }
};

const formatPlanCode = (code: string) =>
  code
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .trim();

const SubscriptionScreen: React.FC = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(subscriptionReducer, {
    status: 'loading',
    plans: [],
    error: null,
  });
  const [reloadToken, reload] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const loadPlans = async () => {
      dispatch({ type: 'LOAD_START' });

      try {
        const planOptions = await FamilyRepository.getPlanOptions();
        dispatch({ type: 'LOAD_SUCCESS', payload: planOptions });
      } catch {
        dispatch({
          type: 'LOAD_ERROR',
          error: 'The family plan catalog could not be loaded right now. Please try again.',
        });
      }
    };

    void loadPlans();
  }, [reloadToken]);

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader title="Subscription" subtitle="Family plan options" showBack />

      <main className="page-enter mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <FFCard variant="primary" className="space-y-3 p-5 sm:p-6">
          <p className="text-sm text-white/80">
            Review the live family plan options available in the current plan catalog.
          </p>
          <FFButton
            type="button"
            variant="ghost"
            size="sm"
            icon={<RefreshCw className={`h-4 w-4 ${state.status === 'loading' ? 'animate-spin' : ''}`} />}
            onClick={() => reload()}
          >
            Refresh catalog
          </FFButton>
        </FFCard>

        {state.status === 'loading' && state.plans.length === 0 ? (
          <div className="space-y-3">
            <FFCardSkeleton />
            <FFCardSkeleton />
            <FFCardSkeleton />
          </div>
        ) : null}

        {state.status === 'error' && state.plans.length === 0 ? (
          <FFErrorState message={state.error} onRetry={() => reload()} />
        ) : null}

        {state.plans.length > 0 ? (
          <>
            <section className="space-y-3">
              <FFSectionHeader icon={<CreditCard />} title="Available Plans" />
              <div className="space-y-3">
                {state.plans.map((plan) => (
                  <FFCard key={plan.id} className="space-y-3 p-4 shadow-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-display font-semibold text-primary">{plan.label}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          Plan code: {formatPlanCode(plan.code)}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-ff-sm bg-primary/5 text-primary">
                        <CreditCard className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="rounded-ff-sm bg-primary/5 p-3">
                      <p className="text-sm text-gray-600">
                        This screen uses the live plan catalog exposed by the family repository.
                        Pricing and billing history are not documented in the current family-side
                        mobile contract.
                      </p>
                    </div>
                  </FFCard>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <FFSectionHeader icon={<Shield />} title="Family Billing Notes" />
              <FFCard variant="warm" className="p-4 shadow-card">
                <p className="text-sm text-gray-600">
                  The current source documents the plan catalog for selection and filtering. A
                  dedicated family-side payment history flow is not documented for this mobile
                  screen yet.
                </p>
              </FFCard>
            </section>
          </>
        ) : null}

        {state.status !== 'loading' && state.plans.length === 0 ? (
          <FFEmptyState
            title="No plans available"
            message="The plan catalog is empty right now."
            actionLabel="Try again"
            onAction={() => reload()}
            icon={<CreditCard className="h-8 w-8" />}
          />
        ) : null}

        <FFButton type="button" variant="outline" className="w-full" onClick={() => navigate('/profile')}>
          Back to profile
        </FFButton>
      </main>
    </div>
  );
};

export default SubscriptionScreen;
