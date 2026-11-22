import React, { useEffect, useReducer } from 'react';
import { CheckCircle2, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import {
  FAMILY_LINK_TYPE_OPTIONS,
  type FamilyInviteRoleOption,
  FamilyRepository,
} from '../repositories/FamilyRepository';
import { useAuth } from '../../../core/auth/AuthContext';
import { INDIA_COUNTRY_CODE, INDIAN_MOBILE_LENGTH, toIndianMobileDigits } from '../../../core/utils/indianPhone';

type State = {
  name: string;
  phone: string;
  roleId: string;
  linkType: string;
  roleOptions: FamilyInviteRoleOption[];
  isOptionsLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  isSuccess: boolean;
};

type Action =
  | { type: 'SET_FIELD'; field: 'name' | 'phone' | 'roleId' | 'linkType'; value: string }
  | { type: 'SET_ROLE_OPTIONS'; roleOptions: FamilyInviteRoleOption[] }
  | { type: 'SET_OPTIONS_LOADING'; isOptionsLoading: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_SUCCESS'; isSuccess: boolean };

const initialState: State = {
  name: '',
  phone: '',
  roleId: '',
  linkType: 'Mother',
  roleOptions: [],
  isOptionsLoading: true,
  isSubmitting: false,
  error: null,
  isSuccess: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value, error: null };
    case 'SET_ROLE_OPTIONS': {
      const roleId = action.roleOptions.find((option) => option.value === 3)?.id ?? action.roleOptions[0]?.id ?? '';
      return { ...state, roleId, roleOptions: action.roleOptions, error: null };
    }
    case 'SET_OPTIONS_LOADING':
      return { ...state, isOptionsLoading: action.isOptionsLoading };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_SUCCESS':
      return { ...state, isSuccess: action.isSuccess };
    default:
      return state;
  }
};

const AddMemberScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadRoleOptions = async () => {
    dispatch({ type: 'SET_OPTIONS_LOADING', isOptionsLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const roleOptions = await FamilyRepository.getRoleOptions();
      dispatch({ type: 'SET_ROLE_OPTIONS', roleOptions });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'We could not load the role list.';
      dispatch({ type: 'SET_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_OPTIONS_LOADING', isOptionsLoading: false });
    }
  };

  useEffect(() => {
    void loadRoleOptions();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.familyId) {
      dispatch({ type: 'SET_ERROR', error: 'A family is required before adding members.' });
      return;
    }

    const role = state.roleOptions.find((option) => option.id === state.roleId);
    if (!role) {
      dispatch({ type: 'SET_ERROR', error: 'Select a family role.' });
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      await FamilyRepository.addMember(user.familyId, {
        name: state.name.trim(),
        phone: state.phone,
        role: role.value,
        linkType: state.linkType,
      });
      dispatch({ type: 'SET_SUCCESS', isSuccess: true });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'We could not add this member. Check the phone number and try again.';
      dispatch({ type: 'SET_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  };

  if (state.isSuccess) {
    return (
      <div className="min-h-screen bg-bg-cream page-enter">
        <FFPageHeader title="Member added" subtitle="The invite is ready to continue" />
        <main className="mx-auto max-w-lg px-4 py-6 pb-24 sm:px-6">
          <FFCard className="space-y-5 p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-ff bg-success/10 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <p className="font-display text-xl font-bold text-primary">{state.name} has been added</p>
              <p className="mt-2 text-sm text-gray-500">
                You can go back to the family list or add another person right away.
              </p>
            </div>
            <div className="flex gap-3">
              <FFButton variant="outline" className="flex-1" onClick={() => navigate('/parent/add-member')}>
                Add another
              </FFButton>
              <FFButton className="flex-1" onClick={() => navigate('/parent/members')}>
                View members
              </FFButton>
            </div>
          </FFCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader title="Add member" subtitle="Bring someone new into your family space" showBack onBack={() => navigate(-1)} />

      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <FFCard variant="primary" className="space-y-3 p-6 text-white">
            <p className="font-display text-xl font-bold text-white">Invite a new family member</p>
            <p className="text-sm text-white/75">
              Add parents, elders, teachers, or children with the right role and relationship.
            </p>
          </FFCard>

          <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<UserPlus />} title="Member details" />

            {state.isOptionsLoading ? (
              <div className="space-y-3">
                <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
                <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
                <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
              </div>
            ) : null}

            {!state.isOptionsLoading && state.error && state.roleOptions.length === 0 ? (
              <FFErrorState title="Roles could not load" message={state.error} onRetry={() => void loadRoleOptions()} />
            ) : null}

            {!state.isOptionsLoading && state.roleOptions.length > 0 ? (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="memberName" className="block text-xs font-semibold text-gray-500">
                      Full name
                    </label>
                    <input
                      id="memberName"
                      type="text"
                      value={state.name}
                      onChange={(event) => dispatch({ type: 'SET_FIELD', field: 'name', value: event.target.value })}
                      placeholder="Example: Priya Sharma"
                      className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="memberPhone" className="block text-xs font-semibold text-gray-500">
                      Phone number
                    </label>
                    <div className="flex min-h-12 w-full items-center rounded-xl border border-black/10 bg-white transition focus-within:border-accent">
                      <span className="border-r border-black/10 px-4 py-3 text-sm font-semibold text-primary">{INDIA_COUNTRY_CODE}</span>
                      <input
                        id="memberPhone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        required
                        maxLength={INDIAN_MOBILE_LENGTH}
                        aria-describedby="memberPhoneHint"
                        value={state.phone}
                        onChange={(event) => dispatch({ type: 'SET_FIELD', field: 'phone', value: toIndianMobileDigits(event.target.value) })}
                        placeholder="98765 43210"
                        className="min-h-12 w-full rounded-r-xl bg-transparent px-4 py-3 text-sm text-primary outline-none"
                      />
                    </div>
                    <p id="memberPhoneHint" className="text-xs text-gray-500">
                      10-digit Indian mobile number.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="memberRole" className="block text-xs font-semibold text-gray-500">
                      Role
                    </label>
                    <select
                      id="memberRole"
                      value={state.roleId}
                      onChange={(event) => dispatch({ type: 'SET_FIELD', field: 'roleId', value: event.target.value })}
                      className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                    >
                      {state.roleOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="linkType" className="block text-xs font-semibold text-gray-500">
                      Relationship
                    </label>
                    <select
                      id="linkType"
                      value={state.linkType}
                      onChange={(event) => dispatch({ type: 'SET_FIELD', field: 'linkType', value: event.target.value })}
                      className="min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent"
                    >
                      {FAMILY_LINK_TYPE_OPTIONS.map((linkType) => (
                        <option key={linkType} value={linkType}>
                          {linkType}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {state.error ? (
                  <FFErrorState title="Member could not be added" message={state.error} onRetry={() => dispatch({ type: 'SET_ERROR', error: null })} />
                ) : null}

                <FFButton type="submit" className="w-full" isLoading={state.isSubmitting} icon={<Users className="h-4 w-4" />}>
                  Send invite
                </FFButton>
              </form>
            ) : null}
          </FFCard>
        </motion.div>
      </main>
    </div>
  );
};

export default AddMemberScreen;
