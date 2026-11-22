import React, { useReducer } from 'react';
import axios from 'axios';
import { Baby, Heart, KeyRound, LogIn, UserRound } from 'lucide-react';
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
import { SecureStorageService } from '../../core/storage/SecureStorageService';
import { logger } from '../../core/services/logger';
import { useAuth, UserRole } from '../../core/auth/AuthContext';
import { useApiResource } from '../../core/hooks/useApiResource';
import { FamilyRepository, type FamilyMember } from '../family/repositories/FamilyRepository';

/**
 * Child / Elder PIN sign-in — "parent hands over the device" (founder decision 2026-11-22;
 * the family join code was removed). Route: /child-login (unchanged).
 *
 * 1. A Parent or FamilyAdmin is signed in on this device and opens this screen.
 * 2. Their family's Child and Elder members are listed (GET /families/{familyId}/members).
 * 3. The child/elder taps their name and enters their 4-digit PIN (POST /auth/verify-pin { userId, pin }).
 * 4. On success the parent session is revoked and replaced by the child/elder session.
 *
 * Without a signed-in parent the screen only explains the hand-over — nobody can list a family's
 * members anonymously.
 */

type PinState = {
  selected: FamilyMember | null;
  pin: string;
  isSubmitting: boolean;
  error: string | null;
};

type PinAction =
  | { type: 'SELECT'; member: FamilyMember | null }
  | { type: 'SET_PIN'; pin: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

const initialPinState: PinState = { selected: null, pin: '', isSubmitting: false, error: null };

const pinReducer = (state: PinState, action: PinAction): PinState => {
  switch (action.type) {
    case 'SELECT':
      return { ...initialPinState, selected: action.member };
    case 'SET_PIN':
      return { ...state, pin: action.pin, error: null };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: null };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, pin: '', error: action.error };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const pinNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'] as const;

const HANDOVER_ROLES: readonly UserRole[] = [UserRole.PARENT, UserRole.FAMILY_ADMIN];
const PIN_ROLES: readonly UserRole[] = [UserRole.CHILD, UserRole.ELDER];

const ChildLoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, handleAuthResponse } = useAuth();
  const [state, dispatch] = useReducer(pinReducer, initialPinState);

  const canHandOver = isAuthenticated && !!user && HANDOVER_ROLES.includes(user.role) && !!user.familyId;
  const familyId = canHandOver ? user?.familyId : undefined;

  const members = useApiResource<FamilyMember[]>(
    familyId
      ? async () => (await FamilyRepository.getMembers(familyId))
          .filter((member) => PIN_ROLES.includes(member.role) && !!member.userId)
      : null,
    [familyId],
    'We could not load your family members. Please try again.',
  );

  const handleBack = () => {
    if (state.selected) {
      dispatch({ type: 'SELECT', member: null });
      return;
    }
    navigate(-1);
  };

  const handlePinSubmit = async (finalPin: string) => {
    const userId = state.selected?.userId;
    if (!userId || finalPin.length !== 4) {
      return;
    }

    dispatch({ type: 'SUBMIT_START' });
    const parentRefreshToken = SecureStorageService.getRefreshToken();
    const parentAccessToken = SecureStorageService.getAccessToken();

    try {
      const response = await AuthRepository.verifyPin(userId, finalPin);

      // Hand-over: end the parent session on this device before the child/elder session starts.
      SecureStorageService.clearAll();
      if (parentRefreshToken) {
        void AuthRepository.logout(parentRefreshToken, parentAccessToken ?? undefined).catch((error: unknown) => {
          logger.error('Parent session revoke failed during PIN hand-over', error);
        });
      }

      handleAuthResponse(response);
      navigate('/', { replace: true });
    } catch (caughtError: unknown) {
      // Show the API's own message (wrong PIN / locked out), never Axios' "Request failed with status code 401".
      const apiData = axios.isAxiosError<{ message?: string; errors?: { message?: string }[] }>(caughtError)
        ? caughtError.response?.data
        : undefined;
      const message =
        apiData?.errors?.[0]?.message
        || apiData?.message
        || 'That PIN did not match. Please try again or ask a parent for help.';
      dispatch({ type: 'SUBMIT_ERROR', error: message });
    }
  };

  const handlePinChange = (nextDigit: string) => {
    if (state.pin.length >= 4 || state.isSubmitting) {
      return;
    }

    const nextPin = `${state.pin}${nextDigit}`;
    dispatch({ type: 'SET_PIN', pin: nextPin });

    if (nextPin.length === 4) {
      void handlePinSubmit(nextPin);
    }
  };

  const memberLabel = (member: FamilyMember) => (member.role === UserRole.ELDER ? 'Elder' : 'Child');

  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader
        title="Child and elder sign in"
        subtitle={state.selected ? 'Enter your 4-digit PIN' : 'Sign in with a PIN on this device'}
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
                A parent opens this screen, then the child or elder taps their name and enters their own PIN.
              </p>
            </div>
          </FFCard>

          {!canHandOver ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<LogIn />} title="Ask a parent to sign in" />
              <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
                <li>A parent signs in on this device with their mobile number.</li>
                <li>They open <span className="font-semibold text-primary">Settings → Switch to child / elder</span>.</li>
                <li>You tap your name and enter your 4-digit PIN.</li>
              </ol>
              <FFButton className="w-full" onClick={() => navigate('/login')}>
                Parent sign in
              </FFButton>
            </FFCard>
          ) : null}

          {canHandOver && !state.selected ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<UserRound />} title="Who is using this device?" />
              <p className="text-sm text-gray-500">
                Hand the device over, then tap the name of the child or elder who is signing in.
              </p>

              {members.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <FFShimmer key={index} height="5.5rem" borderRadius="1rem" className="shimmer" />
                  ))}
                </div>
              ) : null}

              {!members.isLoading && members.error ? (
                <FFErrorState title="Could not load profiles" message={members.error} onRetry={members.reload} />
              ) : null}

              {!members.isLoading && !members.error && members.data?.length === 0 ? (
                <FFEmptyState
                  title="No children or elders yet"
                  message="Add a child or elder to your family first. They sign in here with their own PIN."
                  actionLabel={user?.role === UserRole.FAMILY_ADMIN ? 'Add a member' : undefined}
                  onAction={user?.role === UserRole.FAMILY_ADMIN ? () => navigate('/parent/add-member') : undefined}
                />
              ) : null}

              {!members.isLoading && !members.error && members.data && members.data.length > 0 ? (
                <div className="space-y-3">
                  {members.data.map((member) => (
                    <FFCard
                      key={member.id}
                      hoverable
                      onClick={() => dispatch({ type: 'SELECT', member })}
                      className="min-h-12 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <FFAvatar name={member.displayName || member.name} size="md" />
                          <div className="min-w-0">
                            <p className="truncate font-display text-sm font-semibold text-primary">
                              {member.displayName || member.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{memberLabel(member)}</p>
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

          {canHandOver && state.selected ? (
            <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
              <FFSectionHeader icon={<KeyRound />} title="Enter your PIN" />
              <div className="flex items-center gap-3 rounded-ff-sm bg-primary/5 p-4">
                <FFAvatar name={state.selected.displayName || state.selected.name} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold text-primary">
                    Hi, {state.selected.displayName || state.selected.name}! 👋
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your 4-digit PIN to open your family space.
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-3" aria-label={`${state.pin.length} of 4 digits entered`}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-4 w-4 rounded-full border ${
                      state.pin.length > index ? 'border-accent bg-accent' : 'border-black/10 bg-white'
                    }`}
                  />
                ))}
              </div>

              {state.isSubmitting ? (
                <div className="space-y-3">
                  <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
                  <FFShimmer height="16rem" borderRadius="1rem" className="shimmer" />
                </div>
              ) : null}

              {!state.isSubmitting && state.error ? (
                <FFErrorState
                  title="PIN not accepted"
                  message={state.error}
                  onRetry={() => dispatch({ type: 'CLEAR_ERROR' })}
                />
              ) : null}

              {!state.isSubmitting ? (
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
                          onClick={() => dispatch({ type: 'SET_PIN', pin: state.pin.slice(0, -1) })}
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
              If you do not know your PIN, ask a parent or family admin for help.
            </p>
          </FFCard>
        </motion.div>
      </main>
    </div>
  );
};

export default ChildLoginScreen;
