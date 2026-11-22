import { isAxiosError } from 'axios';
import { type FormEvent, useRef, useState } from 'react';
import type { ApiResponse } from '../../../core/network/apiTypes';
import FFButton from '../../../shared/components/FFButton';
import FFErrorState from '../../../shared/components/FFErrorState';
import { FamilyRepository, type FamilyMember } from '../repositories/FamilyRepository';

interface Props {
  familyId: string;
  member: FamilyMember;
  memberId: string;
  onCancel: () => void;
  onSaved: () => void;
}

const fieldClass =
  'mt-1 min-h-12 w-full rounded-xl border border-primary/20 bg-white px-3 text-center font-numbers text-lg tracking-[0.5em] text-primary';

const toPinDigits = (value: string) => value.replace(/\D/g, '').slice(0, 4);

/** Same rule as the API (PinValidator): exactly 4 digits and not all the same digit. */
const pinProblem = (pin: string): string | null => {
  if (pin.length !== 4) return 'Enter exactly 4 digits.';
  if (new Set(pin).size === 1) return 'Use at least two different digits (not 1111).';
  return null;
};

/**
 * Parent / FamilyAdmin sets or resets a Child or Elder's 4-digit sign-in PIN
 * (PUT /families/{familyId}/members/{memberId}/pin). Saving also clears any PIN lockout.
 */
export default function MemberPinEditor({ familyId, member, memberId, onCancel, onSaved }: Props) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const memberName = member.displayName || member.name;

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const problem = pinProblem(pin) ?? (pin !== confirmPin ? 'The two PINs do not match.' : null);
    if (problem) {
      setError(problem);
      return;
    }
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    setError('');
    try {
      await FamilyRepository.setMemberPin(familyId, memberId, pin);
      setPin('');
      setConfirmPin('');
      onSaved();
    } catch (caught) {
      const response = isAxiosError<ApiResponse<unknown>>(caught) ? caught.response?.data : undefined;
      setError(response?.errors?.[0]?.message || response?.message || 'Could not save the PIN. Please try again.');
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void save(event)} className="mt-4 space-y-4 border-t border-primary/10 pt-4" noValidate>
      <p className="text-sm text-slate-600">
        Set a 4-digit PIN for <span className="font-semibold text-primary">{memberName}</span>. They use it on
        &ldquo;Switch to child / elder&rdquo;. Saving also unlocks the account if it was locked.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-gray-500">
          New PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={pin}
            onChange={(event) => { setPin(toPinDigits(event.target.value)); setError(''); }}
            className={fieldClass}
            aria-label={`New PIN for ${memberName}`}
          />
        </label>
        <label className="block text-xs font-semibold text-gray-500">
          Confirm PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={4}
            value={confirmPin}
            onChange={(event) => { setConfirmPin(toPinDigits(event.target.value)); setError(''); }}
            className={fieldClass}
            aria-label={`Confirm PIN for ${memberName}`}
          />
        </label>
      </div>
      {error ? <FFErrorState title="PIN not saved" message={error} /> : null}
      <div className="flex gap-3">
        <FFButton type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={saving}>
          Cancel
        </FFButton>
        <FFButton type="submit" className="flex-1" isLoading={saving}>
          Save PIN
        </FFButton>
      </div>
    </form>
  );
}
