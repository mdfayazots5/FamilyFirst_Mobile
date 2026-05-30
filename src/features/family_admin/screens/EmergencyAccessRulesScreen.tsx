import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Save, Plus, Trash2, Phone } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import {
  FamilyAdminL2Repository,
  EmergencyAccessRules,
  EmergencyContact,
} from '../repositories/FamilyAdminL2Repository';

const ACCESS_MODES = [
  { id: 'LoginRequired', label: 'Login Required', desc: 'Viewer must sign in to FamilyFirst.' },
  { id: 'PinOnly',       label: 'PIN Only',        desc: 'Access via a numeric PIN — no FamilyFirst account needed.' },
  { id: 'NoLogin',       label: 'No Login',        desc: 'Emergency folder viewable by anyone with the link. Only for Emergency Folder.' },
] as const;

const EXPIRY_OPTIONS = [24, 48, 72, 120, 168];

const EmergencyAccessRulesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rules, setRules]       = useState<EmergencyAccessRules | null>(null);
  const [mode, setMode]         = useState<EmergencyAccessRules['accessMode']>('LoginRequired');
  const [expiry, setExpiry]     = useState(72);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
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
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emergency Access Rules
            </h1>
            <p className="text-xs text-blue-200">DV-07 — Emergency folder & SOS contacts</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl bg-white/10">
            <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-5 pb-32 space-y-4">
        {/* Access mode */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Emergency Link Access Mode
          </h2>
          {ACCESS_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                mode === m.id ? 'border-[#1A2E4A] bg-[#1A2E4A]/5' : 'border-gray-200'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                mode === m.id ? 'border-[#1A2E4A] bg-[#1A2E4A]' : 'border-gray-300'
              }`} />
              <div>
                <p className="text-sm font-semibold text-[#1A2E4A]">{m.label}</p>
                <p className="text-xs text-gray-400">{m.desc}</p>
              </div>
            </button>
          ))}
          {mode === 'NoLogin' && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-xs text-amber-700">⚠ No-login mode means anyone with the link can view emergency documents. Use for Emergency Folder only.</p>
            </div>
          )}
        </div>

        {/* Link expiry */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emergency Link Expiry
            </h2>
            <span className="text-sm font-bold text-[#C8922A]">
              {expiry}h {expiry >= 24 ? `(${expiry / 24}d)` : ''}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {EXPIRY_OPTIONS.map(h => (
              <button
                key={h}
                onClick={() => setExpiry(h)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                  expiry === h ? 'bg-[#1A2E4A] text-white border-[#1A2E4A]' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">Maximum 7 days (168h). Links auto-revoke when content expires.</p>
        </div>

        {/* Emergency contacts */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1A2E4A]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emergency Contacts
            </h2>
            {contacts.length < 3 && (
              <button onClick={addContact} className="flex items-center gap-1 text-xs text-[#C8922A] font-medium">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">These contacts receive SOS alerts and can access emergency documents. Max 3.</p>

          {contacts.length === 0 && (
            <button onClick={addContact} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
              + Add first emergency contact
            </button>
          )}

          {contacts.map((contact, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500">Contact {i + 1}</p>
                </div>
                <button onClick={() => removeContact(i)} className="p-1 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
              {[
                { field: 'name' as const, placeholder: 'Full name' },
                { field: 'phoneNumber' as const, placeholder: '+91 98765 43210' },
                { field: 'relationship' as const, placeholder: 'e.g. Family Doctor, Uncle' },
              ].map(({ field, placeholder }) => (
                <input
                  key={field}
                  type={field === 'phoneNumber' ? 'tel' : 'text'}
                  value={contact[field]}
                  onChange={e => updateContact(i, field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#1A2E4A] text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving…' : 'Save Emergency Rules'}
        </button>
      </div>
    </div>
  );
};

export default EmergencyAccessRulesScreen;
