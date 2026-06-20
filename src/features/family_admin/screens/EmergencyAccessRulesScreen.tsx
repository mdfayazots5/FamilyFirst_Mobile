import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Save, Plus, Trash2, Phone, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  FamilyAdminL2Repository,
  EmergencyAccessRules,
  EmergencyContact,
} from '../repositories/FamilyAdminL2Repository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const ACCESS_MODES = [
  { id: 'LoginRequired', label: 'Login Required',  desc: 'Viewer must sign in to FamilyFirst.' },
  { id: 'PinOnly',       label: 'PIN Only',         desc: 'Access via a numeric PIN — no FamilyFirst account needed.' },
  { id: 'NoLogin',       label: 'No Login',         desc: 'Emergency folder viewable by anyone with the link. Only for Emergency Folder.' },
] as const;

const EXPIRY_OPTIONS = [24, 48, 72, 120, 168];

const EmergencyAccessRulesScreen: React.FC = () => {
  const { user } = useAuth();
  const [rules, setRules]         = useState<EmergencyAccessRules | null>(null);
  const [mode, setMode]           = useState<EmergencyAccessRules['accessMode']>('LoginRequired');
  const [expiry, setExpiry]       = useState(72);
  const [contacts, setContacts]   = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);

  const load = async () => {
    if (!user?.familyId) return;
    setIsLoading(true);
    try {
      const data = await FamilyAdminL2Repository.getEmergencyConfig(user.familyId);
      setRules(data);
      setMode(data.accessMode);
      setExpiry(data.emergencyLinkExpiryHours);
      setContacts([...data.emergencyContacts]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.familyId]);

  const addContact = () => {
    if (contacts.length >= 3) return;
    setContacts(prev => [...prev, { name: '', phoneNumber: '', relationship: '' }]);
  };

  const removeContact = (i: number) => setContacts(prev => prev.filter((_, idx) => idx !== i));

  const updateContact = (i: number, field: keyof EmergencyContact, value: string) =>
    setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const handleSave = async () => {
    if (!user?.familyId) return;
    setIsSaving(true);
    try {
      const updated = await FamilyAdminL2Repository.updateEmergencyConfig(user.familyId, {
        accessMode: mode,
        emergencyLinkExpiryHours: expiry,
        emergencyContacts: contacts.filter(c => c.name && c.phoneNumber),
      });
      setRules(updated);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Emergency Access"
        subtitle="Emergency folder & SOS contacts"
        showBack
      />

      <main className="px-4 py-5 space-y-4 page-enter">

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <FFShimmer key={i} className="h-32 rounded-ff" />)}
          </div>
        ) : (
          <>
            {/* Access mode */}
            <div className="space-y-2">
              <FFSectionHeader icon={<ShieldAlert className="w-[18px] h-[18px]" />} title="Link Access Mode" />
              <FFCard className="p-4 space-y-2">
                {ACCESS_MODES.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                      mode === m.id ? 'border-primary bg-primary/5' : 'border-black/5 hover:bg-black/[0.02]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${
                      mode === m.id ? 'border-primary bg-primary' : 'border-gray-300'
                    }`} />
                    <div>
                      <p className="font-body font-semibold text-sm text-primary">{m.label}</p>
                      <p className="font-body text-xs text-gray-400 mt-0.5">{m.desc}</p>
                    </div>
                  </button>
                ))}
                {mode === 'NoLogin' && (
                  <div className="bg-alert/5 border border-alert/10 rounded-xl p-3">
                    <p className="font-body text-xs text-alert leading-relaxed">
                      Anyone with the link can view emergency documents. Use for Emergency Folder only.
                    </p>
                  </div>
                )}
              </FFCard>
            </div>

            {/* Link expiry */}
            <div className="space-y-2">
              <FFSectionHeader icon={<ShieldAlert className="w-[18px] h-[18px]" />} title="Link Expiry" />
              <FFCard className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs text-gray-500">Auto-revoke emergency link after</p>
                  <span className="font-numbers font-medium text-sm text-accent">
                    {expiry}h {expiry >= 24 ? `(${expiry / 24}d)` : ''}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {EXPIRY_OPTIONS.map(h => (
                    <button
                      key={h}
                      onClick={() => setExpiry(h)}
                      className={`px-3 py-1.5 rounded-xl font-body text-xs font-semibold border transition-colors ${
                        expiry === h ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-black/5'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <p className="font-body text-xs text-gray-400">Maximum 7 days (168h).</p>
              </FFCard>
            </div>

            {/* Emergency contacts */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FFSectionHeader icon={<Phone className="w-[18px] h-[18px]" />} title="Emergency Contacts" />
                {contacts.length < 3 && (
                  <button onClick={addContact} className="flex items-center gap-1 font-body text-xs text-accent font-semibold py-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                )}
              </div>
              <p className="font-body text-xs text-gray-400 px-1">Receive SOS alerts. Max 3 contacts.</p>

              {contacts.length === 0 ? (
                <button
                  onClick={addContact}
                  className="w-full py-4 border-2 border-dashed border-black/10 rounded-ff font-body text-sm text-gray-400"
                >
                  + Add first emergency contact
                </button>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact, i) => (
                    <FFCard key={i} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <p className="font-body font-semibold text-xs text-gray-500">Contact {i + 1}</p>
                        </div>
                        <button onClick={() => removeContact(i)} className="p-1.5 rounded-xl hover:bg-alert/10 text-gray-300 hover:text-alert transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {[
                        { field: 'name' as const, placeholder: 'Full name', type: 'text' },
                        { field: 'phoneNumber' as const, placeholder: '+91 98765 43210', type: 'tel' },
                        { field: 'relationship' as const, placeholder: 'e.g. Family Doctor, Uncle', type: 'text' },
                      ].map(({ field, placeholder, type }) => (
                        <input
                          key={field}
                          type={type}
                          value={contact[field]}
                          onChange={e => updateContact(i, field, e.target.value)}
                          placeholder={placeholder}
                          className="w-full h-12 px-4 bg-white border border-black/5 rounded-xl font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20 placeholder:text-gray-300"
                        />
                      ))}
                    </FFCard>
                  ))}
                </div>
              )}
            </div>

            <FFButton
              icon={<Save className="w-4 h-4" />}
              isLoading={isSaving}
              className="w-full"
              onClick={handleSave}
            >
              Save Emergency Rules
            </FFButton>
          </>
        )}

      </main>
    </div>
  );
};

export default EmergencyAccessRulesScreen;
