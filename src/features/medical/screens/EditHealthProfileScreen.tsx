import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyRepository, type FamilyMember } from '../../family/repositories/FamilyRepository';
import {
  ALLERGY_CATEGORY_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  CHRONIC_CONDITION_OPTIONS,
  MedicalRepository,
  AllergyEntry,
} from '../repositories/MedicalRepository';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFShimmer from '../../../shared/components/FFShimmer';
import { INDIA_COUNTRY_CODE, INDIAN_MOBILE_ERROR, INDIAN_MOBILE_LENGTH, isValidIndianMobile, toIndianE164, toIndianMobileDigits } from '../../../core/utils/indianPhone';

const inputClass = "w-full h-12 px-3 bg-bg-cream rounded-xl border border-black/5 font-body text-sm text-primary focus:outline-none focus:ring-1 focus:ring-primary/20";

type LoadState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; members: FamilyMember[] };

const EditHealthProfileScreen: React.FC<{ createMode?: boolean }> = ({ createMode = false }) => {
  const navigate = useNavigate();
  const { memberId: routeMemberId } = useParams<{ memberId: string }>();
  const { user } = useAuth();
  const familyId = user?.familyId;
  const [loadState, setLoadState] = useReducer(
    (_previous: LoadState, next: LoadState) => next,
    { status: 'loading' },
  );
  const [selectedId, setSelectedId] = useState('');
  const memberId = createMode ? selectedId : routeMemberId;
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveFailed, setSaveFailed] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState<AllergyEntry[]>([]);
  const [newAllergyText, setNewAllergyText] = useState('');
  const [newAllergyCategory, setNewAllergyCategory] = useState<(typeof ALLERGY_CATEGORY_OPTIONS)[number]>('Food');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRelationship, setContactRelationship] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [organDonor, setOrganDonor] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadState({ status: 'loading' });
    const load = async () => {
      if (!familyId) throw new Error('Family unavailable');
      if (createMode) {
        const [familyMembers, profiles] = await Promise.all([
          FamilyRepository.getMembers(familyId),
          MedicalRepository.listHealthProfiles(familyId),
        ]);
        if (!active) return;
        const existingIds = new Set(profiles.map(profile => profile.memberId));
        const eligible = familyMembers.filter(member => member.id && !existingIds.has(member.id));
        setLoadState({ status: 'ready', members: eligible });
        setSelectedId(previous => eligible.some(member => member.id === previous) ? previous : '');
        return;
      }
      if (!routeMemberId) throw new Error('Family member unavailable');
      const p = await MedicalRepository.getHealthProfile(familyId, routeMemberId);
      if (!active) return;
      setBloodGroup(p.bloodGroup);
      setAllergies(p.knownAllergies);
      setChronicConditions(p.chronicConditions);
      setDoctorName(p.primaryDoctor?.name ?? '');
      setDoctorPhone(toIndianMobileDigits(p.primaryDoctor?.phone ?? ''));
      setContactName(p.emergencyContact?.name ?? '');
      setContactRelationship(p.emergencyContact?.relationship ?? '');
      setContactPhone(toIndianMobileDigits(p.emergencyContact?.phone ?? ''));
      setOrganDonor(p.organDonor);
      setLoadState({ status: 'ready', members: [] });
    };
    void load().catch(() => { if (active) setLoadState({ status: 'failed' }); });
    return () => { active = false; };
  }, [familyId, routeMemberId, createMode, loadAttempt]);

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
    if (!familyId || !memberId || loadState.status !== 'ready' || isSaving) return;
    if ((doctorPhone && !isValidIndianMobile(doctorPhone)) || (contactPhone && !isValidIndianMobile(contactPhone))) {
      setPhoneError(INDIAN_MOBILE_ERROR);
      return;
    }
    setPhoneError(null);
    setIsSaving(true);
    setSaveFailed(false);
    try {
      await MedicalRepository.updateHealthProfile(familyId, memberId, {
        bloodGroup,
        knownAllergies: allergies,
        chronicConditions,
        primaryDoctorName: doctorName || undefined,
        primaryDoctorPhone: doctorPhone ? toIndianE164(doctorPhone) : undefined,
        emergencyContactName: contactName || undefined,
        emergencyContactRelationship: contactRelationship || undefined,
        emergencyContactPhone: contactPhone ? toIndianE164(contactPhone) : undefined,
        organDonor,
      });
      setIsSaved(true);
      if (createMode) {
        navigate(`/medical/${memberId}`, { replace: true });
      } else {
        setTimeout(() => navigate(-1), 800);
      }
    } catch {
      setSaveFailed(true);
    } finally {
      setIsSaving(false);
    }
  };

  const header = <FFPageHeader title={createMode ? 'Add Health Profile' : 'Edit Health Profile'} showBack />;
  if (loadState.status !== 'ready' || (createMode && loadState.members.length === 0)) {
    return (
      <div className="min-h-screen bg-bg-cream">
        {header}
        <div className="px-4 pt-5 pb-24">
          {loadState.status === 'loading' && <FFShimmer className="h-32 rounded-ff" />}
          {loadState.status === 'failed' && (
            <FFErrorState message="Unable to load health profile details." onRetry={() => setLoadAttempt(attempt => attempt + 1)} />
          )}
          {loadState.status === 'ready' && (
            <p className="font-body text-sm text-primary">All family members already have a health profile.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-cream">
      {header}

      <div className="px-4 pt-5 pb-24 space-y-5">
        {createMode && (
          <label className="block space-y-2 font-body text-sm font-semibold text-primary">
            <span>Family member</span>
            <select className={inputClass} value={selectedId} disabled={isSaving} onChange={event => setSelectedId(event.target.value)}>
              <option value="">Select a family member</option>
              {loadState.members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
          </label>
        )}

        {/* Blood Group */}
        <div>
          <label className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Blood Group *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_GROUP_OPTIONS.map(bg => (
              <button
                key={bg}
                onClick={() => setBloodGroup(bg)}
                className={`py-2.5 rounded-xl font-numbers font-bold text-sm transition-colors ${
                  bloodGroup === bg
                    ? 'bg-alert text-white'
                    : 'bg-white text-gray-600 border border-black/5 hover:border-alert/30'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Known Allergies
            {allergies.length === 0 && (
              <span className="ml-2 text-accent normal-case font-normal">Important for emergency care</span>
            )}
          </label>
          <div className="space-y-2 mb-3">
            {allergies.map((a, i) => (
              <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-black/5">
                <span className="flex-1 font-body text-sm text-primary">{a.text}</span>
                <span className="font-body text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">{a.category}</span>
                <button onClick={() => removeAllergy(i)} aria-label="Remove allergy">
                  <Trash2 className="w-3.5 h-3.5 text-alert" />
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
              className="flex-1 px-3 py-2.5 bg-white rounded-xl border border-black/5 font-body text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            <select
              value={newAllergyCategory}
              onChange={e => setNewAllergyCategory(e.target.value as (typeof ALLERGY_CATEGORY_OPTIONS)[number])}
              className="px-2 py-2.5 bg-white rounded-xl border border-black/5 font-body text-xs focus:outline-none"
            >
              {ALLERGY_CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={addAllergy}
              className="p-2.5 bg-primary text-white rounded-xl"
              aria-label="Add allergy"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chronic Conditions */}
        <div>
          <label className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Chronic Conditions
          </label>
          <div className="flex flex-wrap gap-2">
            {CHRONIC_CONDITION_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => toggleCondition(c)}
                className={`px-3 py-1.5 rounded-full font-body text-sm font-medium transition-colors ${
                  chronicConditions.includes(c)
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 border border-black/5'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Doctor */}
        <FFCard className="p-4 space-y-3">
          <p className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider">Primary Doctor</p>
          <input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Doctor name" className={inputClass} />
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-semibold text-primary">{INDIA_COUNTRY_CODE}</span>
            <input value={doctorPhone} onChange={e => { setDoctorPhone(toIndianMobileDigits(e.target.value)); setPhoneError(null); }} placeholder="10-digit mobile number" type="tel" inputMode="numeric" maxLength={INDIAN_MOBILE_LENGTH} aria-label="Doctor mobile number" className={inputClass} />
          </div>
        </FFCard>

        {/* Emergency Contact */}
        <FFCard className="p-4 space-y-3">
          <p className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider">Emergency Contact</p>
          <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Contact name" className={inputClass} />
          <input value={contactRelationship} onChange={e => setContactRelationship(e.target.value)} placeholder="Relationship (e.g. Mother)" className={inputClass} />
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-semibold text-primary">{INDIA_COUNTRY_CODE}</span>
            <input value={contactPhone} onChange={e => { setContactPhone(toIndianMobileDigits(e.target.value)); setPhoneError(null); }} placeholder="10-digit mobile number" type="tel" inputMode="numeric" maxLength={INDIAN_MOBILE_LENGTH} aria-label="Emergency contact mobile number" className={inputClass} />
          </div>
          {phoneError ? <p role="alert" className="font-body text-xs text-alert">{phoneError}</p> : null}
        </FFCard>

        {/* Organ Donor */}
        <FFCard className="p-4 flex items-center justify-between">
          <div>
            <p className="font-body text-sm font-semibold text-primary">Organ Donor</p>
            <p className="font-body text-xs text-gray-400 mt-0.5">Adults only · Shown on emergency card if enabled</p>
          </div>
          <button
            onClick={() => setOrganDonor(v => !v)}
            className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 relative ${organDonor ? 'bg-success' : 'bg-black/10'}`}
            aria-label="Toggle organ donor"
          >
            <span className={`block w-5 h-5 bg-white rounded-full shadow mx-0.5 transition-transform ${organDonor ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </FFCard>

        {isSaved ? (
          <div className="flex items-center justify-center gap-2 py-3 bg-success/10 rounded-ff">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="font-body text-sm font-medium text-success">Profile saved!</span>
          </div>
        ) : (
          <FFButton onClick={handleSave} disabled={!memberId || !bloodGroup || isSaving} isLoading={isSaving} className="w-full">
            Save Profile
          </FFButton>
        )}
        {saveFailed && <p role="alert" className="font-body text-sm text-alert">Unable to save the health profile. Try again.</p>}
      </div>
    </div>
  );
};

export default EditHealthProfileScreen;
