import React, { useReducer } from 'react';
import { Baby, CheckCircle2, Heart, Plus, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { FamilyRepository } from '../repositories/FamilyRepository';

type ChildDraft = {
  id: string;
  name: string;
  grade: string;
};

type WizardStep = 1 | 2 | 3 | 4;

type WizardState = {
  step: WizardStep;
  familyName: string;
  city: string;
  childName: string;
  childGrade: string;
  children: ChildDraft[];
  elderName: string;
  elderPhone: string;
  isLoading: boolean;
  error: string | null;
  joinCode: string;
};

type WizardAction =
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'SET_FIELD'; field: 'familyName' | 'city' | 'childName' | 'childGrade' | 'elderName' | 'elderPhone'; value: string }
  | { type: 'ADD_CHILD' }
  | { type: 'REMOVE_CHILD'; id: string }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_JOIN_CODE'; joinCode: string };

const initialState: WizardState = {
  step: 1,
  familyName: '',
  city: '',
  childName: '',
  childGrade: '',
  children: [],
  elderName: '',
  elderPhone: '',
  isLoading: false,
  error: null,
  joinCode: '',
};

const reducer = (state: WizardState, action: WizardAction): WizardState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step, error: null };
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value, error: null };
    case 'ADD_CHILD':
      if (!state.childName.trim() || !state.childGrade.trim()) {
        return state;
      }
      return {
        ...state,
        children: [
          ...state.children,
          {
            id: `${state.childName.trim().toLowerCase()}-${state.children.length + 1}`,
            name: state.childName.trim(),
            grade: state.childGrade.trim(),
          },
        ],
        childName: '',
        childGrade: '',
      };
    case 'REMOVE_CHILD':
      return {
        ...state,
        children: state.children.filter((child) => child.id !== action.id),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_JOIN_CODE':
      return { ...state, joinCode: action.joinCode };
    default:
      return state;
  }
};

const FamilySetupWizard: React.FC = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);

  const nextStep = () => {
    if (state.step < 4) {
      dispatch({ type: 'SET_STEP', step: (state.step + 1) as WizardStep });
    }
  };

  const previousStep = () => {
    if (state.step > 1) {
      dispatch({ type: 'SET_STEP', step: (state.step - 1) as WizardStep });
    }
  };

  const handleCreateFamily = async () => {
    if (!state.familyName.trim() || !state.city.trim()) {
      dispatch({ type: 'SET_ERROR', error: 'Enter your family name and city to continue.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const family = await FamilyRepository.createFamily(state.familyName.trim(), state.city.trim());
      dispatch({ type: 'SET_JOIN_CODE', joinCode: family.joinCode });
      dispatch({ type: 'SET_STEP', step: 4 });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'We could not create your family right now.';
      dispatch({ type: 'SET_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader title="Family setup" subtitle={`Step ${state.step} of 4`} showBack onBack={state.step === 1 ? () => navigate(-1) : previousStep} />

      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <FFCard variant="primary" className="space-y-3 p-6 text-white">
            <p className="font-display text-xl font-bold text-white">Start your family space</p>
            <p className="text-sm text-white/75">
              Set up your home, add children, and keep the join code ready for other members.
            </p>
          </FFCard>

          {state.step === 1 ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<Users />} title="Family details" />
              <div className="space-y-2">
                <label htmlFor="familyName" className="block text-xs font-semibold text-gray-500">
                  Family name
                </label>
                <input
                  id="familyName"
                  type="text"
                  value={state.familyName}
                  onChange={(event) => dispatch({ type: 'SET_FIELD', field: 'familyName', value: event.target.value })}
                  placeholder="Example: Sharma Family"
                  className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="city" className="block text-xs font-semibold text-gray-500">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={state.city}
                  onChange={(event) => dispatch({ type: 'SET_FIELD', field: 'city', value: event.target.value })}
                  placeholder="Example: Bengaluru"
                  className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                />
              </div>
              <FFButton className="w-full" onClick={nextStep}>
                Continue
              </FFButton>
            </FFCard>
          ) : null}

          {state.step === 2 ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<Baby />} title="Children" />
              <p className="text-sm text-gray-500">
                Add the children you want to bring into your family dashboard first.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  value={state.childName}
                  onChange={(event) => dispatch({ type: 'SET_FIELD', field: 'childName', value: event.target.value })}
                  placeholder="Child name"
                  className="min-h-12 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                />
                <input
                  type="text"
                  value={state.childGrade}
                  onChange={(event) => dispatch({ type: 'SET_FIELD', field: 'childGrade', value: event.target.value })}
                  placeholder="Grade or age group"
                  className="min-h-12 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                />
              </div>
              <FFButton variant="outline" className="w-full" onClick={() => dispatch({ type: 'ADD_CHILD' })} icon={<Plus className="h-4 w-4" />}>
                Add child
              </FFButton>

              {state.children.length === 0 ? (
                <FFEmptyState
                  title="No children added yet"
                  message="Add at least one child now, or continue and invite them later."
                />
              ) : (
                <div className="space-y-3">
                  {state.children.map((child) => (
                    <FFCard key={child.id} variant="warm" className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-sm font-semibold text-primary">{child.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{child.grade}</p>
                        </div>
                        <FFButton variant="ghost" onClick={() => dispatch({ type: 'REMOVE_CHILD', id: child.id })} icon={<Trash2 className="h-4 w-4" />}>
                          Remove
                        </FFButton>
                      </div>
                    </FFCard>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <FFButton variant="outline" className="flex-1" onClick={previousStep}>
                  Back
                </FFButton>
                <FFButton className="flex-1" onClick={nextStep}>
                  Continue
                </FFButton>
              </div>
            </FFCard>
          ) : null}

          {state.step === 3 ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<Heart />} title="Elders" />
              <p className="text-sm text-gray-500">
                Add an elder contact now if you want them included from the first day.
              </p>
              <div className="space-y-2">
                <label htmlFor="elderName" className="block text-xs font-semibold text-gray-500">
                  Elder name
                </label>
                <input
                  id="elderName"
                  type="text"
                  value={state.elderName}
                  onChange={(event) => dispatch({ type: 'SET_FIELD', field: 'elderName', value: event.target.value })}
                  placeholder="Example: Savitri Sharma"
                  className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="elderPhone" className="block text-xs font-semibold text-gray-500">
                  Elder phone
                </label>
                <input
                  id="elderPhone"
                  type="tel"
                  value={state.elderPhone}
                  onChange={(event) => dispatch({ type: 'SET_FIELD', field: 'elderPhone', value: event.target.value })}
                  placeholder="+91 98765 43210"
                  className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                />
              </div>

              {state.isLoading ? (
                <div className="space-y-3">
                  <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
                  <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
                </div>
              ) : null}

              {state.error ? (
                <FFErrorState title="Setup could not continue" message={state.error} onRetry={() => dispatch({ type: 'SET_ERROR', error: null })} />
              ) : null}

              <div className="flex gap-3">
                <FFButton variant="outline" className="flex-1" onClick={previousStep}>
                  Back
                </FFButton>
                <FFButton className="flex-1" onClick={handleCreateFamily} isLoading={state.isLoading}>
                  Create family
                </FFButton>
              </div>
            </FFCard>
          ) : null}

          {state.step === 4 ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<CheckCircle2 />} title="Ready to invite" />
              <FFCard variant="warm" className="p-5 text-center">
                <p className="text-xs font-semibold text-gray-500">Your family join code</p>
                <p className="mt-3 font-display text-2xl font-bold text-primary">{state.joinCode}</p>
              </FFCard>
              <p className="text-sm text-gray-500">
                Share this code with parents, elders, teachers, and children so they can join your family.
              </p>
              <div className="flex gap-3">
                <FFButton variant="outline" className="flex-1" onClick={() => navigate('/parent/join-code')}>
                  View invite code
                </FFButton>
                <FFButton className="flex-1" onClick={() => navigate('/parent/members')}>
                  Open family members
                </FFButton>
              </div>
            </FFCard>
          ) : null}
        </motion.div>
      </main>
    </div>
  );
};

export default FamilySetupWizard;
