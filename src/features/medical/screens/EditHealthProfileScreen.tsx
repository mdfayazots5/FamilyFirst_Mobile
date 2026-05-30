import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { MedicalRepository, HealthProfile, AllergyEntry } from '../repositories/MedicalRepository';
import FFButton from '../../../shared/components/FFButton';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ALLERGY_CATEGORIES = ['Food', 'Medication', 'Environmental'] as const;
const CHRONIC_CONDITIONS = ['Asthma', 'Diabetes', 'Epilepsy', 'Heart condition', 'Other'];

const EditHealthProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState<AllergyEntry[]>([]);
  const [newAllergyText, setNewAllergyText] = useState('');
  const [newAllergyCategory, setNewAllergyCategory] = useState<typeof ALLERGY_CATEGORIES[number]>('Food');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [organDonor, setOrganDonor] = useState(false);

  useEffect(() => {
    if (!user?.familyId || !memberId) return;
    MedicalRepository.getHealthProfile(user.familyId, memberId).then(p => {
      setBloodGroup(p.bloodGroup);
      setAllergies(p.knownAllergies);
      setChronicConditions(p.chronicConditions);
      setDoctorName(p.primaryDoctor?.name ?? '');
      setDoctorPhone(p.primaryDoctor?.phone ?? '');
      setContactName(p.emergencyContact?.name ?? '');
      setContactRelationship(p.emergencyContact?.relationship ?? '');
      setContactPhone(p.emergencyContact?.phone ?? '');
      setOrganDonor(p.organDonor);
    });
  }, [user?.familyId, memberId]);

  const addAllergy = () => {
    if (!newAllergyText.trim()) return;
    setAllergies(prev => [...prev, { text: newAllergyText.trim(), category: newAllergyCategory }]);
    setNewAllergyText('');
  };

  const removeAllergy = (index: number) =>
    setAllergies(prev => prev.filter((_, i) => i !== index));

  const toggleCondition = (c: string) =>
    setChronicConditions(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c],
    );

  const handleSave = async () => {
    if (!user?.familyId || !memberId) return;
    setIsSaving(true);
    try {
      await MedicalRepository.updateHealthProfile(user.familyId, memberId, {
        bloodGroup,
        knownAllergies: allergies,
        chronicConditions,
        primaryDoctorName: doctorName || undefined,
        primaryDoctorPhone: doctorPhone || undefined,
        emergencyContactName: contactName || undefined,
        emergencyContactRelationship: contactRelationship || undefined,
        emergencyContactPhone: contactPhone || undefined,
        organDonor,
      });
      setIsSaved(true);
      setTimeout(() => navigate(-1), 800);
    } catch {
      // keep form open on error
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
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Edit Health Profile
          </h1>
        </div>
      </div>

      <div className="px-4 pt-5 pb-24 space-y-5">

        {/* Blood Group */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
            Blood Group *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_GROUPS.map(bg => (
              <button
                key={bg}
                onClick={() => setBloodGroup(bg)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-colors
                  ${bloodGroup === bg
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'}`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
            Known Allergies
            {allergies.length === 0 && (
              <span className="ml-2 text-orange-500 normal-case font-normal">
                Important for emergency care
              </span>
            )}
          </label>
          <div className="space-y-2 mb-3">
            {allergies.map((a, i) => (
              <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
                <span className="flex-1 text-sm text-[#1A2E4A]">{a.text}</span>
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{a.category}</span>
                <button onClick={() => removeAllergy(i)}>
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newAllergyText}
              onChange={e => setNewAllergyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAllergy()}
              placeholder="Add allergy…"
              className="flex-1 px-3 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
            />
            <select
              value={newAllergyCategory}
              onChange={e => setNewAllergyCategory(e.target.value as typeof ALLERGY_CATEGORIES[number])}
              className="px-2 py-2.5 bg-white rounded-xl border border-gray-200 text-xs focus:outline-none"
            >
              {ALLERGY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={addAllergy}
              className="p-2.5 bg-[#1A2E4A] text-white rounded-xl"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chronic Conditions */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
            Chronic Conditions
          </label>
          <div className="flex flex-wrap gap-2">
            {CHRONIC_CONDITIONS.map(c => (
              <button
                key={c}
                onClick={() => toggleCondition(c)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${chronicConditions.includes(c)
                    ? 'bg-[#1A2E4A] text-white'
                    : 'bg-white text-gray-600 border border-gray-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Doctor */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Doctor</p>
          <input
            value={doctorName}
            onChange={e => setDoctorName(e.target.value)}
            placeholder="Doctor name"
            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
          />
          <input
            value={doctorPhone}
            onChange={e => setDoctorPhone(e.target.value)}
            placeholder="Phone number"
            type="tel"
            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
          />
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Emergency Contact</p>
          <input
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            placeholder="Contact name"
            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
          />
          <input
            value={contactRelationship}
            onChange={e => setContactRelationship(e.target.value)}
            placeholder="Relationship (e.g. Mother)"
            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
          />
          <input
            value={contactPhone}
            onChange={e => setContactPhone(e.target.value)}
            placeholder="Phone number"
            type="tel"
            className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2E4A]"
          />
        </div>

        {/* Organ Donor */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-[#1A2E4A]">Organ Donor</p>
            <p className="text-xs text-gray-400">Adults only · Shown on emergency card if enabled</p>
          </div>
          <button
            onClick={() => setOrganDonor(v => !v)}
            className={`w-12 h-6 rounded-full transition-colors ${organDonor ? 'bg-green-500' : 'bg-gray-200'}`}
          >
            <span className={`block w-5 h-5 bg-white rounded-full shadow mx-0.5 transition-transform
              ${organDonor ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        {isSaved ? (
          <div className="flex items-center justify-center gap-2 py-3 bg-green-50 rounded-2xl">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Profile saved!</span>
          </div>
        ) : (
          <FFButton onClick={handleSave} disabled={!bloodGroup || isSaving} className="w-full">
            {isSaving ? 'Saving…' : 'Save Profile'}
          </FFButton>
        )}
      </div>
    </div>
  );
};

export default EditHealthProfileScreen;
