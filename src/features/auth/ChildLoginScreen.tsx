import React, { useReducer } from 'react';
import { Baby, Heart, KeyRound, Search, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import FFButton from '../../shared/components/FFButton';
import FFAvatar from '../../shared/components/FFAvatar';
import FFCard from '../../shared/components/FFCard';
import FFEmptyState from '../../shared/components/FFEmptyState';
import FFErrorState from '../../shared/components/FFErrorState';
import FFPageHeader from '../../shared/components/FFPageHeader';
import FFSectionHeader from '../../shared/components/FFSectionHeader';
import FFShimmer from '../../shared/components/FFShimmer';
import { AuthRepository } from '../../core/repositories/AuthRepository';
import { useAuth } from '../../core/auth/AuthContext';

type Step = 'JOIN_CODE' | 'NAME_PICKER' | 'PIN_PAD';

type JoinCodeChild = {
  id: string;
  name: string;
  age: number;
};

type ChildLoginState = {
  step: Step;
  joinCode: string;
  children: JoinCodeChild[];
  selectedChild: JoinCodeChild | null;
  pin: string;
  isLoading: boolean;
  error: string | null;
};

type ChildLoginAction =
  | { type: 'SET_STEP'; step: Step }
  | { type: 'SET_JOIN_CODE'; joinCode: string }
  | { type: 'SET_CHILDREN'; children: JoinCodeChild[] }
  | { type: 'SET_SELECTED_CHILD'; child: JoinCodeChild | null }
  | { type: 'SET_PIN'; pin: string }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET_PIN' };

const initialState: ChildLoginState = {
  step: 'JOIN_CODE',
  joinCode: '',
  children: [],
  selectedChild: null,
  pin: '',
  isLoading: false,
  error: null,
};

const reducer = (state: ChildLoginState, action: ChildLoginAction): ChildLoginState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step, error: null };
    case 'SET_JOIN_CODE':
      return { ...state, joinCode: action.joinCode, error: null };
    case 'SET_CHILDREN':
      return { ...state, children: action.children, error: null };
    case 'SET_SELECTED_CHILD':
      return { ...state, selectedChild: action.child, error: null };
    case 'SET_PIN':
      return { ...state, pin: action.pin, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'RESET_PIN':
      return { ...state, pin: '' };
    default:
      return state;
  }
};

const pinNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'] as const;

const ChildLoginScreen: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const { handleAuthResponse } = useAuth();

  const handleBack = () => {
    if (state.step === 'JOIN_CODE') {
      navigate('/login');
      return;
    }

    if (state.step === 'PIN_PAD') {
      dispatch({ type: 'RESET_PIN' });
      dispatch({ type: 'SET_STEP', step: 'NAME_PICKER' });
      return;
    }

    dispatch({ type: 'SET_STEP', step: 'JOIN_CODE' });
  };

  const handleVerifyJoinCode = async () => {
    if (state.joinCode.trim().length < 4) {
      dispatch({ type: 'SET_ERROR', error: 'Enter the family join code to continue.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const children = await AuthRepository.getChildrenByJoinCode(state.joinCode.trim().toUpperCase());
      dispatch({ type: 'SET_CHILDREN', children });
      dispatch({ type: 'SET_STEP', step: 'NAME_PICKER' });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'We could not find that family right now.';
      dispatch({ type: 'SET_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  const handleSelectChild = (child: JoinCodeChild) => {
    dispatch({ type: 'SET_SELECTED_CHILD', child });
    dispatch({ type: 'SET_PIN', pin: '' });
    dispatch({ type: 'SET_STEP', step: 'PIN_PAD' });
  };

  const handlePinSubmit = async (finalPin: string) => {
    if (!state.selectedChild || finalPin.length !== 4) {
      return;
    }

    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const response = await AuthRepository.verifyPin(state.selectedChild.id, finalPin);
      handleAuthResponse(response);
      navigate('/', { replace: true });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'That PIN did not match. Try again.';
      dispatch({ type: 'SET_ERROR', error: message });
      dispatch({ type: 'RESET_PIN' });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  const handlePinChange = (nextDigit: string) => {
    if (state.pin.length >= 4) {
      return;
    }

    const nextPin = `${state.pin}${nextDigit}`;
    dispatch({ type: 'SET_PIN', pin: nextPin });

    if (nextPin.length === 4) {
      void handlePinSubmit(nextPin);
    }
  };

  const handleDelete = () => {
    dispatch({ type: 'SET_PIN', pin: state.pin.slice(0, -1) });
  };

  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader
        title="Family PIN sign in"
        subtitle={state.step === 'PIN_PAD' ? 'Enter your 4-digit PIN' : 'For children and elders'}
        showBack
        onBack={handleBack}
      />

      <main className="mx-auto max-w-lg px-4 py-6 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <FFCard variant="primary" className="space-y-3 p-6 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-ff bg-white/12">
              <Baby className="h-7 w-7 text-accent" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-white">A simple family sign in</p>
              <p className="mt-1 text-sm text-white/75">
                Pick a family profile, then enter the PIN linked to that member.
              </p>
            </div>
          </FFCard>

          {state.step === 'JOIN_CODE' ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<Search />} title="Find your family" />
              <p className="text-sm text-gray-500">
                Enter the join code shared by your parent or family admin.
              </p>

              <div className="space-y-2">
                <label htmlFor="joinCode" className="block text-xs font-semibold text-gray-500">
                  Family join code
                </label>
                <input
                  id="joinCode"
                  type="text"
                  autoFocus
                  value={state.joinCode}
                  onChange={(event) =>
                    dispatch({
                      type: 'SET_JOIN_CODE',
                      joinCode: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10),
                    })
                  }
                  placeholder="Example: TEST01"
                  className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-center text-lg font-bold tracking-wide text-primary outline-none transition focus:border-accent"
                />
              </div>

              <FFButton
                className="w-full"
                onClick={handleVerifyJoinCode}
                isLoading={state.isLoading}
                disabled={state.joinCode.trim().length < 4}
              >
                Find profiles
              </FFButton>

              {state.isLoading ? (
                <div className="space-y-3">
                  <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
                  <FFShimmer height="5rem" borderRadius="1rem" className="shimmer" />
                  <FFShimmer height="5rem" borderRadius="1rem" className="shimmer" />
                </div>
              ) : null}

              {state.error ? (
                <FFErrorState
                  title="Join code not found"
                  message={state.error}
                  onRetry={() => dispatch({ type: 'SET_ERROR', error: null })}
                />
              ) : null}
            </FFCard>
          ) : null}

          {state.step === 'NAME_PICKER' ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<UserRound />} title="Choose your profile" />
              <p className="text-sm text-gray-500">
                Tap your name to continue with your family PIN.
              </p>

              {state.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <FFShimmer key={index} height="5.5rem" borderRadius="1rem" className="shimmer" />
                  ))}
                </div>
              ) : null}

              {!state.isLoading && state.error ? (
                <FFErrorState
                  title="Could not load profiles"
                  message={state.error}
                  onRetry={() => dispatch({ type: 'SET_ERROR', error: null })}
                />
              ) : null}

              {!state.isLoading && !state.error && state.children.length === 0 ? (
                <FFEmptyState
                  title="No profiles found"
                  message="Ask your family admin to confirm the join code and try again."
                  actionLabel="Enter code again"
                  onAction={() => dispatch({ type: 'SET_STEP', step: 'JOIN_CODE' })}
                />
              ) : null}

              {!state.isLoading && !state.error && state.children.length > 0 ? (
                <div className="space-y-3">
                  {state.children.map((child) => (
                    <FFCard
                      key={child.id}
                      hoverable
                      onClick={() => handleSelectChild(child)}
                      className="p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <FFAvatar name={child.name} size="md" />
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-semibold text-primary">
                              {child.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {child.age} years old
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-accent">Continue</span>
                      </div>
                    </FFCard>
                  ))}
                </div>
              ) : null}
            </FFCard>
          ) : null}

          {state.step === 'PIN_PAD' && state.selectedChild ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<KeyRound />} title="Enter your PIN" />
              <div className="flex items-center gap-3 rounded-ff-sm bg-primary/5 p-4">
                <FFAvatar name={state.selectedChild.name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-primary">
                    Hi, {state.selectedChild.name}! 👋
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your 4-digit PIN to open your family space.
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-4 w-4 rounded-full border ${
                      state.pin.length > index
                        ? 'border-accent bg-accent'
                        : 'border-black/10 bg-white'
                    }`}
                  />
                ))}
              </div>

              {state.isLoading ? (
                <div className="space-y-3">
                  <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
                  <FFShimmer height="16rem" borderRadius="1rem" className="shimmer" />
                </div>
              ) : null}

              {!state.isLoading && state.error ? (
                <FFErrorState
                  title="PIN not accepted"
                  message={state.error}
                  onRetry={() => dispatch({ type: 'SET_ERROR', error: null })}
                />
              ) : null}

              {!state.isLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {pinNumbers.map((item, index) => {
                    if (item === '') {
                      return <div key={`empty-${index}`} />;
                    }

                    if (item === 'delete') {
                      return (
                        <FFButton
                          key="delete"
                          variant="ghost"
                          className="aspect-square w-full"
                          onClick={handleDelete}
                          disabled={state.pin.length === 0}
                        >
                          Delete
                        </FFButton>
                      );
                    }

                    return (
                      <FFButton
                        key={item}
                        variant="outline"
                        className="aspect-square w-full text-lg font-display"
                        onClick={() => handlePinChange(item)}
                        disabled={state.pin.length >= 4}
                      >
                        {item}
                      </FFButton>
                    );
                  })}
                </div>
              ) : null}
            </FFCard>
          ) : null}

          <FFCard variant="warm" className="space-y-4 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<Heart />} title="Need help" />
            <p className="text-sm text-gray-500">
              If you do not know your join code or PIN, ask a parent or family admin for help.
            </p>
            <FFButton variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Back to phone sign in
            </FFButton>
          </FFCard>
        </motion.div>
      </main>
    </div>
  );
};

export default ChildLoginScreen;
