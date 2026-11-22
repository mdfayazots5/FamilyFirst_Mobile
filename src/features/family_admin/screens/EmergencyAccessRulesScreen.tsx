import React, { useState } from 'react';
import { CheckCircle2, Clock3, KeyRound, Link2, LockKeyhole, Phone, Plus, Save, ShieldAlert, Trash2 } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useApiResource } from '../../../core/hooks/useApiResource';
import FFButton from '../../../shared/components/FFButton';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import {
  EMERGENCY_ACCESS_MODE_OPTIONS,
  EMERGENCY_LINK_EXPIRY_OPTIONS,
  FamilyAdminL2Repository,
  type EmergencyAccessRules,
  type EmergencyContact,
} from '../repositories/FamilyAdminL2Repository';

const modeIcons = { LoginRequired: LockKeyhole, PinOnly: KeyRound, NoLogin: Link2 };
const formatExpiry = (hours: number) => hours % 24 === 0
  ? `${hours / 24} ${hours === 24 ? 'day' : 'days'}`
  : `${hours} ${hours === 1 ? 'hour' : 'hours'}`;

const contactFields = [
  { key: 'name', label: 'Full name', type: 'text', required: true },
  { key: 'phoneNumber', label: 'Phone number', type: 'tel', required: true },
  { key: 'relationship', label: 'Relationship (optional)', type: 'text', required: false },
] as const;

const EmergencyAccessRulesScreen: React.FC = () => {
  const { user } = useAuth();
  const familyId = user?.familyId;
  const resource = useApiResource<EmergencyAccessRules>(
    familyId ? () => FamilyAdminL2Repository.getEmergencyConfig(familyId) : null,
    [familyId],
    'Emergency access rules could not be loaded.',
  );
  const rules = resource.data;
  const loadError = familyId ? resource.error : 'Family details are not available.';
  const [draft, setDraft] = useState<Partial<EmergencyAccessRules>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const isSaving = saveStatus === 'saving';

  const mode = draft.accessMode ?? rules?.accessMode;
  const expiry = draft.emergencyLinkExpiryHours ?? rules?.emergencyLinkExpiryHours;
  const contacts = draft.emergencyContacts ?? rules?.emergencyContacts ?? [];
  const savedContacts = rules?.emergencyContacts ?? [];
  const contactsChanged = contacts.length !== savedContacts.length || contacts.some((contact, index) =>
    contactFields.some(({ key }) => contact[key] !== savedContacts[index]?.[key]),
  );
  const incompleteContact = contacts.some(contact => !contact.name.trim() || !contact.phoneNumber.trim());
  const isDirty = !!rules && (mode !== rules.accessMode || expiry !== rules.emergencyLinkExpiryHours || contactsChanged);
  const canSave = isDirty && !incompleteContact && !isSaving;

  const edit = <K extends keyof EmergencyAccessRules,>(key: K, value: EmergencyAccessRules[K]) => {
    setDraft(previous => ({ ...previous, [key]: value }));
    setSaveStatus('idle');
  };

  const addContact = () => {
    if (contacts.length < 3) edit('emergencyContacts', [...contacts, { name: '', phoneNumber: '', relationship: '' }]);
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) =>
    edit('emergencyContacts', contacts.map((contact, i) => i === index ? { ...contact, [field]: value } : contact));

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!familyId || !rules || !canSave) return;

    setSaveStatus('saving');
    try {
      const updated = await FamilyAdminL2Repository.updateEmergencyConfig(familyId, {
        ...(mode !== rules.accessMode ? { accessMode: mode } : {}),
        ...(expiry !== rules.emergencyLinkExpiryHours ? { emergencyLinkExpiryHours: expiry } : {}),
        ...(contactsChanged ? { emergencyContacts: contacts.map(contact => ({
          name: contact.name.trim(),
          phoneNumber: contact.phoneNumber.trim(),
          relationship: contact.relationship.trim(),
        })) } : {}),
      });
      resource.setData(updated);
      setDraft({});
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const status = isSaving ? 'Saving emergency access rules…'
    : saveStatus === 'saved' ? 'Emergency access rules saved.'
    : isDirty ? 'Unsaved changes' : 'No unsaved changes';

  return (
    <div className="space-y-5 pb-6">
      <div className="overflow-hidden rounded-ff">
        <FFPageHeader title="Emergency Access" showBack />
      </div>

      {resource.isLoading ? (
        <div className="space-y-3" aria-label="Loading emergency access rules">
          {Array.from({ length: 3 }, (_, index) => <FFShimmer key={index} height={112} />)}
        </div>
      ) : loadError ? (
        <FFErrorState message={loadError} onRetry={familyId ? resource.reload : undefined} />
      ) : rules ? (
        <form className="space-y-4" onSubmit={handleSave}>
          <fieldset disabled={isSaving} className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <legend className="sr-only">Emergency access settings</legend>
            <div className="min-w-0 space-y-4">
              <section aria-labelledby="emergency-mode-heading" className="space-y-3 rounded-ff border border-primary/10 bg-white p-4 shadow-card sm:p-5">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert size={20} className="shrink-0 text-primary" aria-hidden="true" />
                  <h2 id="emergency-mode-heading" className="text-base!">Who can open the link</h2>
                </div>
                <div role="radiogroup" aria-labelledby="emergency-mode-heading" className="space-y-2">
                  {EMERGENCY_ACCESS_MODE_OPTIONS.map(option => {
                    const Icon = modeIcons[option.id];
                    const selected = mode === option.id;
                    return (
                      <label key={option.id} className={`flex cursor-pointer items-center gap-2.5 rounded-ff-sm border p-3 transition-colors focus-within:ring-2 focus-within:ring-primary/25 ${selected ? 'border-primary/50 bg-primary/5' : 'border-primary/10 hover:bg-primary/[0.03]'}`}>
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-ff-sm bg-primary/5 text-primary">
                          <Icon size={17} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-primary">{option.label}</span>
                          <span className="block text-xs leading-relaxed text-slate-600">{option.desc}</span>
                        </span>
                        <input type="radio" name="emergency-access-mode" checked={selected} onChange={() => edit('accessMode', option.id)} className="size-4 shrink-0 accent-primary" />
                      </label>
                    );
                  })}
                </div>
                {mode === 'NoLogin' ? (
                  <p className="rounded-ff-sm border border-alert/20 bg-alert/5 px-3 py-2 text-xs font-semibold text-alert">
                    Anyone with the link can view emergency documents.
                  </p>
                ) : null}
              </section>

              <section aria-labelledby="emergency-expiry-heading" className="space-y-3 rounded-ff border border-primary/10 bg-white p-4 shadow-card sm:p-5">
                <div className="flex items-center gap-2.5">
                  <Clock3 size={20} className="shrink-0 text-primary" aria-hidden="true" />
                  <h2 id="emergency-expiry-heading" className="text-base!">Link expiry</h2>
                </div>
                <div role="radiogroup" aria-labelledby="emergency-expiry-heading" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {EMERGENCY_LINK_EXPIRY_OPTIONS.map(hours => (
                    <label key={hours} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-ff-sm border px-1 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-primary/25 ${expiry === hours ? 'border-primary bg-primary text-white' : 'border-primary/15 text-primary hover:bg-primary/5'}`}>
                      <input type="radio" name="emergency-link-expiry" checked={expiry === hours} onChange={() => edit('emergencyLinkExpiryHours', hours)} className="sr-only" />
                      {formatExpiry(hours)}
                    </label>
                  ))}
                </div>
                {expiry !== undefined && !EMERGENCY_LINK_EXPIRY_OPTIONS.includes(expiry) ? (
                  <p className="text-xs text-slate-600">Current expiry is {formatExpiry(expiry)}.</p>
                ) : null}
              </section>
            </div>

            <section aria-labelledby="emergency-contacts-heading" className="min-w-0 overflow-hidden rounded-ff border border-primary/10 bg-white shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 border-b border-primary/10 bg-primary/[0.03] p-4 sm:px-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="shrink-0 text-primary" aria-hidden="true" />
                    <h2 id="emergency-contacts-heading" className="text-base!">Emergency contacts</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">Receive SOS alerts · {contacts.length}/3 added</p>
                </div>
                <FFButton type="button" size="sm" variant="outline" icon={<Plus size={16} aria-hidden="true" />} onClick={addContact} disabled={contacts.length >= 3}>
                  Add contact
                </FFButton>
              </div>
              {contacts.length ? (
                <div className="divide-y divide-primary/10">
                  {contacts.map((contact, index) => (
                    <div key={index} role="group" aria-labelledby={`emergency-contact-${index}`} className="space-y-2 px-4 pb-4 pt-2 sm:px-5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 id={`emergency-contact-${index}`} className="text-sm!">Contact {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => edit('emergencyContacts', contacts.filter((_, i) => i !== index))}
                          aria-label={`Remove contact ${index + 1}`}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-ff-sm px-2 text-xs font-semibold text-alert hover:bg-alert/5 focus-visible:ring-2 focus-visible:ring-alert/30"
                        >
                          <Trash2 size={15} aria-hidden="true" /> Remove
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {contactFields.map(field => (
                          <label key={field.key} className="min-w-0 space-y-1">
                            <span className="block text-xs font-semibold text-slate-700">{field.label}</span>
                            <input
                              type={field.type}
                              value={contact[field.key]}
                              required={field.required}
                              onChange={event => updateContact(index, field.key, event.target.value)}
                              className="min-h-11 w-full min-w-0 scroll-mb-32 rounded-ff-sm border border-primary/20 bg-white px-2.5 text-sm text-primary outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-6 text-sm text-slate-600 sm:px-5">No emergency contacts yet.</p>
              )}
            </section>
          </fieldset>

          <div className="sticky bottom-16 z-20 space-y-2 bg-bg-cream py-2 md:bottom-0">
            {saveStatus === 'error' ? (
              <p role="alert" className="rounded-ff-sm border border-alert/20 bg-white px-3 py-2 text-sm text-alert">
                Emergency access rules could not be saved. Your edits are still here. Try saving again.
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-ff border border-primary/10 bg-white p-2.5 shadow-card sm:px-4">
              <div className="px-1">
                <p role="status" className={`flex items-center gap-1.5 text-sm font-semibold ${saveStatus === 'saved' ? 'text-success' : 'text-slate-700'}`}>
                  {saveStatus === 'saved' ? <CheckCircle2 size={17} className="shrink-0" aria-hidden="true" /> : null}
                  {status}
                </p>
                {incompleteContact ? <p className="mt-0.5 text-xs text-alert">Enter a name and phone number for each contact.</p> : null}
              </div>
              <FFButton type="submit" size="sm" aria-label="Save Emergency Rules" icon={<Save size={16} aria-hidden="true" />} disabled={!canSave} isLoading={isSaving}>
                <span className="sm:hidden">Save rules</span>
                <span className="hidden sm:inline">Save Emergency Rules</span>
              </FFButton>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
};

export default EmergencyAccessRulesScreen;
