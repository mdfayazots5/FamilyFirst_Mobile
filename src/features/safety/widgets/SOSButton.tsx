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
    const familyId = user?.familyId;
    if (!familyId) {
      setState('error');
      return;
    }

    // The send runs inside geolocation callbacks, so it needs its own try/catch: an outer try never sees
    // those rejections (before R6 a failed SOS left the child with no feedback at all).
    const send = async (latitude: number, longitude: number) => {
      try {
        const sos = await SafetyRepository.triggerSos(familyId, {
          latitude, longitude, timestamp: new Date().toISOString(),
        });
        setAlertsSent(sos.alertsSentCount);
        setState('dispatched');
      } catch {
        setState('error');
      }
    };

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => { void send(pos.coords.latitude, pos.coords.longitude); },
        // No GPS — send with approximate zeros; server logs the attempt
        () => { void send(0, 0); },
        { timeout: 5000, maximumAge: 30000 },
      );
    } catch {
      void send(0, 0);
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
      {state === 'error' && (
        <p role="alert" className="max-w-[16rem] text-sm font-semibold text-red-700 text-center bg-white rounded-xl px-3 py-2 shadow">
          The alert could not be sent. Hold the button again, or call a parent directly.
        </p>
      )}
      <p className="text-xs text-gray-500 text-center">
        {state === 'holding' ? 'Hold…' : state === 'error' ? 'Hold 2s to retry SOS' : 'Hold 2s for SOS'}
      </p>
    </div>
  );
};

export default SOSButton;
