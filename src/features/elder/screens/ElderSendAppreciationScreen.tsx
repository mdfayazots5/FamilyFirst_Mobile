import React, { useEffect, useReducer, useState } from 'react';
import {
  CheckCircle2,
  Heart,
  Mic,
  Play,
  RefreshCw,
  Send,
  Square,
  Trash2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import FFAvatar from '../../../shared/components/FFAvatar';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { ElderRepository, GrandchildStatus } from '../repositories/ElderRepository';

type ChildLookupState =
  | { status: 'loading'; data: GrandchildStatus | null; error: string | null }
  | { status: 'ready'; data: GrandchildStatus; error: string | null }
  | { status: 'error'; data: GrandchildStatus | null; error: string };

type ChildLookupAction =
  | { type: 'LOAD_START'; preserve: GrandchildStatus | null }
  | { type: 'LOAD_SUCCESS'; payload: GrandchildStatus }
  | { type: 'LOAD_ERROR'; error: string };

const initialState: ChildLookupState = {
  status: 'loading',
  data: null,
  error: null,
};

function reducer(state: ChildLookupState, action: ChildLookupAction): ChildLookupState {
  switch (action.type) {
    case 'LOAD_START':
      return { status: 'loading', data: action.preserve, error: null };
    case 'LOAD_SUCCESS':
      return { status: 'ready', data: action.payload, error: null };
    case 'LOAD_ERROR':
      return { status: 'error', data: state.data, error: action.error };
    default:
      return state;
  }
}

const stickers = [
  { emoji: '🙏', label: 'Blessings' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🌟', label: 'Star' },
  { emoji: '👏', label: 'Bravo' },
  { emoji: '🎂', label: 'Birthday' },
  { emoji: '🎉', label: 'Celebrate' },
];

const ElderSendAppreciationScreen: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [message, setMessage] = useState('');
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const loadChild = async () => {
    if (!user?.familyId || !childId) {
      dispatch({ type: 'LOAD_ERROR', error: 'Grandchild details are not available right now.' });
      return;
    }

    dispatch({ type: 'LOAD_START', preserve: state.data });

    try {
      const children = await ElderRepository.getGrandchildren(user.familyId);
      const child = children.find((item) => item.id === childId);

      if (!child) {
        dispatch({ type: 'LOAD_ERROR', error: 'Grandchild not found.' });
        return;
      }

      dispatch({ type: 'LOAD_SUCCESS', payload: child });
    } catch (error) {
      console.error('Failed to load appreciation target', error);
      dispatch({ type: 'LOAD_ERROR', error: 'Unable to load this appreciation screen right now.' });
    }
  };

  useEffect(() => {
    void loadChild();
  }, [user?.familyId, childId]);

  const child = state.data;

  const handleSend = async () => {
    if (!user?.familyId || !childId || !child) {
      return;
    }

    setIsSending(true);

    try {
      await ElderRepository.sendAppreciation(user.familyId, {
        childProfileId: childId,
        childName: child.name,
        authorId: user.id,
        authorName: user.name || 'Elder',
        message: message || (selectedSticker ? `Sending you ${selectedSticker}` : 'Thinking of you today.'),
        sticker: selectedSticker || undefined,
        audioUrl: audioUrl || undefined,
      });

      setIsSuccess(true);
      setTimeout(() => navigate('/elder'), 1500);
    } catch (error) {
      console.error('Failed to send elder appreciation', error);
    } finally {
      setIsSending(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setAudioUrl('demo_audio_url');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      <FFPageHeader
        title={child ? `Send to ${child.name}` : 'Send appreciation'}
        subtitle="A warm note for your grandchild"
        showBack
        rightAction={
          <FFButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => void loadChild()}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </FFButton>
        }
      />

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 pb-24">
        {state.status === 'loading' && !child ? (
          <FFCard className="p-5 shadow-card">
            <div className="flex items-center gap-4">
              <FFShimmer width={64} height={64} borderRadius="9999px" />
              <div className="flex-1 space-y-3">
                <FFShimmer width="45%" height={18} />
                <FFShimmer width="70%" height={14} />
              </div>
            </div>
          </FFCard>
        ) : null}

        {state.status === 'error' && !child ? (
          <FFErrorState message={state.error} onRetry={() => void loadChild()} />
        ) : null}

        {child ? (
          <>
            {state.status === 'error' ? (
              <FFCard className="border-alert/20 bg-alert/5 p-4 shadow-card">
                <p className="font-body text-sm text-alert">{state.error}</p>
              </FFCard>
            ) : null}

            <FFCard className="p-5 shadow-card">
              <div className="flex items-center gap-4">
                <FFAvatar name={child.name} size="xl" />
                <div>
                  <h1 className="font-display text-2xl font-bold text-primary">{child.name}</h1>
                  <p className="mt-1 font-body text-sm text-slate-500">
                    Send a loving message, blessing, or celebration note.
                  </p>
                </div>
              </div>
            </FFCard>

            <section className="space-y-4">
              <FFSectionHeader icon={<Heart />} title="Choose a sticker" />
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {stickers.map((sticker) => (
                  <button
                    key={sticker.emoji}
                    type="button"
                    onClick={() => setSelectedSticker(sticker.emoji)}
                    className={`rounded-ff border p-4 text-3xl transition-colors ${
                      selectedSticker === sticker.emoji
                        ? 'border-accent bg-accent/10'
                        : 'border-black/5 bg-white'
                    }`}
                    aria-label={sticker.label}
                  >
                    {sticker.emoji}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <FFSectionHeader icon={<Mic />} title="Voice note" />
              <FFCard className="p-5 shadow-card">
                {audioUrl ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white"
                    >
                      <Play size={18} />
                    </button>
                    <div className="h-3 flex-1 rounded-full bg-slate-100" />
                    <button
                      type="button"
                      onClick={() => setAudioUrl(null)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-alert/10 text-alert"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <button
                      type="button"
                      onClick={isRecording ? () => setIsRecording(false) : startRecording}
                      className={`flex h-24 w-24 items-center justify-center rounded-full ${
                        isRecording ? 'bg-alert text-white' : 'bg-primary text-white'
                      }`}
                    >
                      {isRecording ? <Square size={28} /> : <Mic size={28} />}
                    </button>
                    <p className="font-body text-sm text-slate-500">
                      {isRecording ? 'Recording your message...' : 'Tap to record a short voice blessing.'}
                    </p>
                  </div>
                )}
              </FFCard>
            </section>

            <section className="space-y-4">
              <FFSectionHeader icon={<Send />} title="Write a note" />
              <FFCard className="p-5 shadow-card">
                <textarea
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="I am proud of you. Keep going with your kind heart and steady effort."
                  className="min-h-40 w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-body text-sm text-primary outline-none focus:border-primary"
                />
              </FFCard>
            </section>

            <FFButton className="w-full" isLoading={isSending} onClick={() => void handleSend()} icon={<Send size={16} />}>
              Send appreciation
            </FFButton>
          </>
        ) : null}

        {state.status === 'ready' && !child ? (
          <FFEmptyState
            title="Grandchild not found"
            message="This child may no longer be available from the elder dashboard."
          />
        ) : null}
      </main>

      {isSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 p-4">
          <FFCard className="max-w-md p-6 text-center shadow-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-primary">Sent with love</h2>
            <p className="mt-2 font-body text-sm text-slate-500">
              Your appreciation has been shared with {child?.name}.
            </p>
          </FFCard>
        </div>
      ) : null}
    </div>
  );
};

export default ElderSendAppreciationScreen;
