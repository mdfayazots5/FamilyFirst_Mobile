import React, { useEffect, useReducer } from 'react';
import { Baby, GraduationCap, Heart, QrCode, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { FamilyMember, FamilyRepository } from '../repositories/FamilyRepository';
import { useAuth, UserRole } from '../../../core/auth/AuthContext';

type State = {
  members: FamilyMember[];
  isLoading: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_MEMBERS'; members: FamilyMember[] }
  | { type: 'SET_ERROR'; error: string | null };

const initialState: State = {
  members: [],
  isLoading: true,
  error: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_MEMBERS':
      return { ...state, members: action.members, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
};

const roleIcon = (role: UserRole) => {
  switch (role) {
    case UserRole.PARENT:
    case UserRole.FAMILY_ADMIN:
      return <Shield className="h-4 w-4" />;
    case UserRole.CHILD:
      return <Baby className="h-4 w-4" />;
    case UserRole.ELDER:
      return <Heart className="h-4 w-4" />;
    case UserRole.TEACHER:
      return <GraduationCap className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

const roleLabel = (role: UserRole) => role.replace(/_/g, ' ');

const FamilyMembersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadMembers = async () => {
    if (!user?.familyId) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      dispatch({ type: 'SET_ERROR', error: 'Family membership is required to view this screen.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const members = await FamilyRepository.getMembers(user.familyId);
      dispatch({ type: 'SET_MEMBERS', members });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'We could not load your family members.';
      dispatch({ type: 'SET_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  useEffect(() => {
    void loadMembers();
  }, [user?.familyId]);

  const childCount = state.members.filter((member) => member.role === UserRole.CHILD).length;
  const parentCount = state.members.filter((member) => member.role === UserRole.PARENT || member.role === UserRole.FAMILY_ADMIN).length;
  const elderCount = state.members.filter((member) => member.role === UserRole.ELDER).length;

  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader
        title="Family members"
        subtitle="Everyone in your home, in one calm place"
        showBack
        onBack={() => navigate(-1)}
        rightAction={
          <div className="flex items-center gap-2">
            <FFButton variant="ghost" onClick={() => navigate('/parent/join-code')} icon={<QrCode className="h-4 w-4" />}>
              Invite
            </FFButton>
            <FFButton onClick={() => navigate('/parent/add-member')}>
              Add member
            </FFButton>
          </div>
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
            <p className="font-display text-xl font-bold text-white">Your family circle</p>
            <p className="text-sm text-white/75">
              Keep parents, children, elders, and teachers organized from one screen.
            </p>
          </FFCard>

          <div className="grid gap-3 sm:grid-cols-3">
            <FFCard className="p-4">
              <p className="text-xs font-semibold text-gray-500">Total members</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{state.members.length}</p>
            </FFCard>
            <FFCard className="p-4">
              <p className="text-xs font-semibold text-gray-500">Children</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{childCount}</p>
            </FFCard>
            <FFCard className="p-4">
              <p className="text-xs font-semibold text-gray-500">Parents and elders</p>
              <p className="mt-2 font-numbers text-2xl text-primary">{parentCount + elderCount}</p>
            </FFCard>
          </div>

          <FFCard className="space-y-5 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<Users />} title="My family" />

            {state.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <FFShimmer key={index} height="5rem" borderRadius="1rem" className="shimmer" />
                ))}
              </div>
            ) : null}

            {!state.isLoading && state.error ? (
              <FFErrorState title="Members could not load" message={state.error} onRetry={() => void loadMembers()} />
            ) : null}

            {!state.isLoading && !state.error && state.members.length === 0 ? (
              <FFEmptyState
                title="No family members yet"
                message="Start with one invite link or add a member manually."
                actionLabel="Add member"
                onAction={() => navigate('/parent/add-member')}
              />
            ) : null}

            {!state.isLoading && !state.error && state.members.length > 0 ? (
              <div className="space-y-3">
                {state.members.map((member) => (
                  <FFCard key={member.id} variant="warm" className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <FFAvatar name={member.name} size="md" src={member.avatarUrl} />
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-semibold text-primary">
                            {member.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                            {roleIcon(member.role)}
                            <span>{roleLabel(member.role)}</span>
                            <span className="text-gray-300">•</span>
                            <span>{member.linkType}</span>
                          </div>
                        </div>
                      </div>
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

export default FamilyMembersScreen;
