import React, { useEffect, useReducer } from 'react';
import { Check, Copy, QrCode, RefreshCw, Share2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { FamilyRepository } from '../repositories/FamilyRepository';
import { useAuth } from '../../../core/auth/AuthContext';

type State = {
  joinCode: string;
  isLoading: boolean;
  isCopied: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_CODE'; joinCode: string }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_COPIED'; isCopied: boolean }
  | { type: 'SET_ERROR'; error: string | null };

const initialState: State = {
  joinCode: '',
  isLoading: true,
  isCopied: false,
  error: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_CODE':
      return { ...state, joinCode: action.joinCode, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_COPIED':
      return { ...state, isCopied: action.isCopied };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    default:
      return state;
  }
};

const JoinCodeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadJoinCode = async () => {
    if (!user?.familyId) {
      dispatch({ type: 'SET_LOADING', isLoading: false });
      dispatch({ type: 'SET_ERROR', error: 'Family membership is required to view the join code.' });
      return;
    }

    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const data = await FamilyRepository.getJoinCode(user.familyId);
      dispatch({ type: 'SET_CODE', joinCode: data.joinCode });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'We could not load the join code.';
      dispatch({ type: 'SET_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  useEffect(() => {
    void loadJoinCode();
  }, [user?.familyId]);

  const handleRegenerate = async () => {
    if (!user?.familyId) {
      return;
    }

    dispatch({ type: 'SET_LOADING', isLoading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      const data = await FamilyRepository.regenerateJoinCode(user.familyId);
      dispatch({ type: 'SET_CODE', joinCode: data.joinCode });
      dispatch({ type: 'SET_COPIED', isCopied: false });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'We could not create a fresh join code.';
      dispatch({ type: 'SET_ERROR', error: message });
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  const handleCopy = async () => {
    if (!state.joinCode) {
      return;
    }
    await navigator.clipboard.writeText(state.joinCode);
    dispatch({ type: 'SET_COPIED', isCopied: true });
    window.setTimeout(() => dispatch({ type: 'SET_COPIED', isCopied: false }), 2000);
  };

  const handleShare = async () => {
    if (!navigator.share || !state.joinCode) {
      return;
    }

    await navigator.share({
      title: 'Join our FamilyFirst family',
      text: `Use this FamilyFirst code to join our family: ${state.joinCode}`,
      url: window.location.origin,
    });
  };

  return (
    <div className="min-h-screen bg-bg-cream page-enter">
      <FFPageHeader title="Join code" subtitle="Share one simple code with your family" showBack onBack={() => navigate(-1)} />

      <main className="mx-auto max-w-xl px-4 py-6 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-4"
        >
          <FFCard variant="primary" className="space-y-3 p-6 text-white">
            <p className="font-display text-xl font-bold text-white">Invite your family</p>
            <p className="text-sm text-white/75">
              Share the code below with the people you want to bring into your family dashboard.
            </p>
          </FFCard>

          <FFCard className="space-y-5 p-4 text-center sm:p-5 lg:p-6">
            <FFSectionHeader icon={<QrCode />} title="Current code" />

            {state.isLoading && !state.joinCode ? (
              <div className="space-y-3">
                <FFShimmer height="3rem" borderRadius="0.75rem" className="shimmer" />
                <FFShimmer height="14rem" borderRadius="1rem" className="shimmer" />
              </div>
            ) : null}

            {!state.isLoading && state.error ? (
              <FFErrorState title="Join code unavailable" message={state.error} onRetry={() => void loadJoinCode()} />
            ) : null}

            {!state.isLoading && !state.error && state.joinCode ? (
              <>
                <FFCard variant="warm" className="p-5">
                  <p className="text-xs font-semibold text-gray-500">Family code</p>
                  <p className="mt-3 font-display text-3xl font-bold tracking-wide text-primary">{state.joinCode}</p>
                </FFCard>

                <div className="flex justify-center rounded-ff bg-white p-5">
                  <QRCodeSVG value={`familyfirst://join?code=${state.joinCode}`} size={220} includeMargin />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <FFButton variant="outline" className="w-full" onClick={() => void handleCopy()} icon={state.isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}>
                    {state.isCopied ? 'Copied' : 'Copy code'}
                  </FFButton>
                  <FFButton className="w-full" onClick={() => void handleShare()} icon={<Share2 className="h-4 w-4" />}>
                    Share
                  </FFButton>
                  <FFButton variant="outline" className="w-full" onClick={() => void handleRegenerate()} isLoading={state.isLoading} icon={<RefreshCw className="h-4 w-4" />}>
                    New code
                  </FFButton>
                </div>
              </>
            ) : null}
          </FFCard>

          <FFCard variant="warm" className="space-y-4 p-4 sm:p-5 lg:p-6">
            <FFSectionHeader icon={<Shield />} title="Share safely" />
            <ul className="space-y-2 text-left text-sm text-gray-500">
              <li>Share the code only with trusted family members.</li>
              <li>Regenerating the code will stop the old code from working.</li>
              <li>Children and elders can use this code before signing in with their PIN.</li>
            </ul>
          </FFCard>
        </motion.div>
      </main>
    </div>
  );
};

export default JoinCodeScreen;
