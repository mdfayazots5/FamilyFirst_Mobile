import React, { useState, useRef, useCallback } from 'react';
import { Zap } from 'lucide-react';
import { SafetyRepository } from '../repositories/SafetyRepository';
import { useAuth } from '../../../core/auth/AuthContext';

// SOS requires a 2-second hold to activate, followed by a 2-second cancel window.
// After that window, the SOS is dispatched and parents are notified instantly.

type SosState = 'idle' | 'holding' | 'confirming' | 'dispatched' | 'error';

const SOSButton: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<SosState>('idle');
  const [holdProgress, setHoldProgress] = useState(0);
  const [alertsSent, setAlertsSent] = useState(0);
  const holdTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const HOLD_MS = 2000;
  const CANCEL_MS = 2000;

  const startHold = useCallback(() => {
    if (state !== 'idle') return;
    setState('holding');
    setHoldProgress(0);
    const startTime = Date.now();

    holdTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_MS) * 100, 100);
      setHoldProgress(progress);

      if (elapsed >= HOLD_MS) {
        clearInterval(holdTimerRef.current!);
        holdTimerRef.current = null;
        setState('confirming');

        // 2-second cancel window before dispatch
        cancelTimerRef.current = setTimeout(() => dispatch(), CANCEL_MS);
      }
    }, 50);
  }, [state]);

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) { clearInterval(holdTimerRef.current); holdTimerRef.current = null; }
    if (cancelTimerRef.current) { clearTimeout(cancelTimerRef.current); cancelTimerRef.current = null; }
    setState('idle');
    setHoldProgress(0);
  }, []);

  const dispatch = useCallback(async () => {
    if (!user?.familyId) return;

    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const sos = await SafetyRepository.triggerSos(user.familyId!, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            timestamp: new Date().toISOString(),
          });
          setAlertsSent(sos.alertsSentCount);
          setState('dispatched');
        },
        async () => {
          // No GPS — send with approximate zeros; server logs the attempt
          const sos = await SafetyRepository.triggerSos(user.familyId!, {
            latitude: 0, longitude: 0,
            timestamp: new Date().toISOString(),
          });
          setAlertsSent(sos.alertsSentCount);
          setState('dispatched');
        },
        { timeout: 5000, maximumAge: 30000 },
      );
    } catch {
      setState('error');
    }
  }, [user?.familyId]);

  if (state === 'dispatched') {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        <div className="bg-red-600 text-white rounded-3xl px-6 py-4 text-center shadow-2xl max-w-xs">
          <Zap className="w-8 h-8 mx-auto mb-2" />
          <p className="text-base font-bold">Your parents have been notified.</p>
          <p className="text-sm text-red-200 mt-1">Stay safe. Help is on the way.</p>
          <p className="text-xs text-red-300 mt-1">{alertsSent} parent{alertsSent !== 1 ? 's' : ''} alerted</p>
        </div>
        <button
          onClick={() => { setState('idle'); setHoldProgress(0); }}
          className="text-xs text-gray-500 underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (state === 'confirming') {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        <div className="bg-red-600 rounded-full w-28 h-28 flex items-center justify-center shadow-2xl animate-pulse">
          <Zap className="w-12 h-12 text-white" />
        </div>
        <p className="text-sm font-bold text-red-600">Sending alert…</p>
        <button
          onClick={cancelHold}
          className="text-sm font-semibold text-gray-600 bg-white px-6 py-2 rounded-full shadow border border-gray-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 select-none">
      <div className="relative">
        {/* Progress ring */}
        {state === 'holding' && (
          <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#ef4444" strokeWidth="6"
              strokeDasharray={`${(holdProgress / 100) * 339} 339`}
              strokeLinecap="round" transform="rotate(-90 60 60)" />
          </svg>
        )}
        <button
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95
            ${state === 'holding' ? 'bg-red-700 scale-95' : 'bg-red-600 hover:bg-red-700'}`}
          aria-label="Hold 2 seconds for SOS"
        >
          <Zap className="w-9 h-9 text-white" />
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">
        {state === 'holding' ? 'Hold…' : 'Hold 2s for SOS'}
      </p>
    </div>
  );
};

export default SOSButton;
