import { isAxiosError } from 'axios';
import { type FormEvent, useRef, useState } from 'react';
import { useApiResource } from '../../../core/hooks/useApiResource';
import type { ApiResponse } from '../../../core/network/apiTypes';
import FFButton from '../../../shared/components/FFButton';
import FFErrorState from '../../../shared/components/FFErrorState';
import { FAMILY_LINK_TYPE_OPTIONS, FamilyRepository, type FamilyMember, mapRoleValue } from '../repositories/FamilyRepository';

interface Props {
  familyId: string;
  member: FamilyMember;
  memberId: string;
  canChangeAccess: boolean;
  onCancel: () => void;
  onSave: (updated: FamilyMember) => void;
  onRemove: () => void;
}

const fieldClass = 'mt-1 min-h-12 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm text-primary';

export default function FamilyMemberEditor({ familyId, member, memberId, canChangeAccess, onCancel, onSave, onRemove }: Props) {
  const roles = useApiResource(FamilyRepository.getRoleOptions, [], 'Could not load family roles.');
  const [roleId, setRoleId] = useState<string>();
  const [displayName, setDisplayName] = useState(member.displayName ?? '');
  const [linkType, setLinkType] = useState(member.linkType);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [pending, setPending] = useState<'save' | 'remove' | null>(null);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const memberName = member.displayName || member.name;
  const role = roles.data?.find(option => canChangeAccess && roleId
    ? option.id === roleId
    : mapRoleValue(option.value) === member.role);

  const run = async (action: 'save' | 'remove', request: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    setPending(action);
    setError('');
    try {
      await request();
    } catch (caught) {
      const response = isAxiosError<ApiResponse<unknown>>(caught) ? caught.response?.data : undefined;
      setError(response?.errors?.[0]?.message || response?.message || 'Could not update the family roster. Please try again.');
    } finally {
      busy.current = false;
      setPending(null);
    }
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!role) return;
    void run('save', async () => {
      onSave(await FamilyRepository.updateMember(familyId, memberId, {
        role: role.value,
        linkType: linkType === member.linkType ? undefined : linkType,
        displayName: displayName.trim(),
      }));
    });
  };

  return (
    <form aria-label={`Edit ${memberName}`} onSubmit={save} className="mt-4 space-y-4 border-t border-primary/10 pt-4">
      <fieldset disabled={pending !== null || confirmRemove} className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-semibold text-primary">
          Display name
          <input className={fieldClass} value={displayName} placeholder={member.name} maxLength={200}
            onChange={event => setDisplayName(event.target.value)} />
        </label>
        <label className="text-sm font-semibold text-primary">
          Relationship
          <select className={fieldClass} value={linkType} onChange={event => setLinkType(event.target.value)}>
            {!FAMILY_LINK_TYPE_OPTIONS.includes(member.linkType) && (
              <option value={member.linkType}>{member.linkType || 'Unspecified'}</option>
            )}
            {FAMILY_LINK_TYPE_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-primary">
          Role
          <select className={fieldClass} disabled={!canChangeAccess || roles.isLoading} value={role?.id ?? ''}
            onChange={event => setRoleId(event.target.value)}>
            {!role && <option value="">{roles.isLoading ? 'Loading roles…' : 'Select a role'}</option>}
            {roles.data?.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
      </fieldset>
      {roles.error && <FFErrorState message={roles.error} onRetry={roles.reload} />}
      {error && <p role="alert" className="text-sm font-semibold text-alert">{error}</p>}
      {confirmRemove ? (
        <div className="space-y-3 rounded-xl border border-alert/20 bg-alert/5 p-3">
          <p className="text-sm text-primary">Remove {memberName} from this family?</p>
          <div className="flex flex-wrap gap-2">
            <FFButton type="button" size="sm" variant="alert" aria-label="Confirm removal" isLoading={pending === 'remove'}
              onClick={() => void run('remove', async () => {
                await FamilyRepository.removeMember(familyId, memberId);
                onRemove();
              })}>
              Confirm removal
            </FFButton>
            <FFButton type="button" size="sm" variant="outline" disabled={pending !== null}
              onClick={() => { setConfirmRemove(false); setError(''); }}>
              Keep member
            </FFButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <FFButton type="submit" size="sm" aria-label="Save changes" disabled={!role} isLoading={pending === 'save'}>
            Save changes
          </FFButton>
          <FFButton type="button" size="sm" variant="outline" disabled={pending !== null} onClick={onCancel}>Cancel</FFButton>
          {canChangeAccess && (
            <FFButton type="button" size="sm" variant="ghost" className="text-alert" disabled={pending !== null}
              onClick={() => { setError(''); setConfirmRemove(true); }}>
              Remove member
            </FFButton>
          )}
        </div>
      )}
    </form>
  );
}
