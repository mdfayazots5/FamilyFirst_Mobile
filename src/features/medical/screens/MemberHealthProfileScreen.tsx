import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Heart, Pill, Syringe, Edit3, Share2, RefreshCw,
  Clock, FileText, Plus, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { MedicalRepository, HealthProfile, Medication, VaccinationEntry } from '../repositories/MedicalRepository';
import AllergyBadge from '../widgets/AllergyBadge';
import FFButton from '../../../shared/components/FFButton';
import { UserRole } from '../../../core/auth/AuthContext';

const STATUS_CONFIG = {
  Given:         { color: 'text-green-700',  bg: 'bg-green-50',  dot: 'bg-green-500' },
  Due:           { color: 'text-amber-700',  bg: 'bg-amber-50',  dot: 'bg-amber-500' },
  Overdue:       { color: 'text-red-700',    bg: 'bg-red-50',    dot: 'bg-red-500' },
  NotApplicable: { color: 'text-gray-500',   bg: 'bg-gray-50',   dot: 'bg-gray-300' },
};

const MemberHealthProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  const { user } = useAuth();

  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'vaccinations'>('overview');

  const canEdit = user?.role === UserRole.PARENT || user?.role === UserRole.FAMILY_ADMIN;

  useEffect(() => {
    if (!user?.familyId || !memberId) return;
    MedicalRepository.getHealthProfile(user.familyId, memberId)
      .then(setProfile)
      .finally(() => setIsLoading(false));
  }, [user?.familyId, memberId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F4EE] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8F4EE] flex flex-col items-center justify-center p-6">
        <p className="text-sm text-gray-500 mb-4">Profile not found.</p>
        <FFButton onClick={() => navigate(-1)}>Go Back</FFButton>
      </div>
    );
  }

  const activeMeds = profile.currentMedications.filter(m => !m.isArchived);
  const dueVaccinations = profile.vaccinationStatus.filter(v => v.status === 'Due' || v.status === 'Overdue');

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Header */}
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {profile.memberName}
            </h1>
            <p className="text-xs text-blue-200">Health Profile</p>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => navigate(`/medical/${memberId}/edit`)}
                className="p-2 rounded-xl bg-white/10"
              >
                <Edit3 className="w-4 h-4 text-white" />
              </button>
            )}
            <button
              onClick={() => navigate(`/medical/${memberId}/emergency-card`)}
              className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
              Emergency
            </button>
          </div>
        </div>
      </div>

      {/* Blood group + profile completion bar */}
      <div className="bg-[#1A2E4A] px-5 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-900/30 border border-red-500/30 flex flex-col items-center justify-center">
            <Heart className="w-5 h-5 text-red-400 mb-0.5" fill="currentColor" />
            <span className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {profile.bloodGroup || '?'}
            </span>
          </div>
          <div className="flex-1">
            {!profile.isProfileComplete && (
              <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl px-3 py-2">
                <p className="text-xs font-medium text-orange-300">
                  Profile incomplete — add Blood Group and Allergies to enable emergency card sharing.
                </p>
              </div>
            )}
            {profile.isProfileComplete && (
              <p className="text-xs text-green-300">Profile complete · Emergency card ready</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-4">
        {(['overview', 'medications', 'vaccinations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors
              ${activeTab === tab
                ? 'text-[#1A2E4A] border-b-2 border-[#1A2E4A]'
                : 'text-gray-400'}`}
          >
            {tab}
            {tab === 'medications' && activeMeds.length > 0 && (
              <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                {activeMeds.length}
              </span>
            )}
            {tab === 'vaccinations' && dueVaccinations.length > 0 && (
              <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                {dueVaccinations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <>
            <AllergyBadge allergies={profile.knownAllergies} />

            {profile.chronicConditions.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Chronic Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {profile.chronicConditions.map(c => (
                    <span key={c} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {profile.primaryDoctor && (
              <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Doctor</p>
                <p className="text-sm font-semibold text-[#1A2E4A]">{profile.primaryDoctor.name}</p>
                {profile.primaryDoctor.phone && (
                  <a href={`tel:${profile.primaryDoctor.phone}`} className="text-sm text-blue-600">
                    {profile.primaryDoctor.phone}
                  </a>
                )}
              </div>
            )}

            {profile.emergencyContact && (
              <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Emergency Contact</p>
                <p className="text-sm font-semibold text-[#1A2E4A]">
                  {profile.emergencyContact.name}
                  {profile.emergencyContact.relationship && (
                    <span className="text-gray-400 font-normal"> · {profile.emergencyContact.relationship}</span>
                  )}
                </p>
                {profile.emergencyContact.phone && (
                  <a href={`tel:${profile.emergencyContact.phone}`} className="text-sm text-blue-600">
                    {profile.emergencyContact.phone}
                  </a>
                )}
              </div>
            )}

            <button
              onClick={() => navigate(`/medical/${memberId}/timeline`)}
              className="flex items-center gap-3 w-full p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-[#1A2E4A] flex-1 text-left">Health Timeline</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          </>
        )}

        {/* Medications tab */}
        {activeTab === 'medications' && (
          <>
            {canEdit && (
              <button
                onClick={() => navigate(`/medical/${memberId}/prescriptions/add`)}
                className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-[#1A2E4A] hover:text-[#1A2E4A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Prescription</span>
              </button>
            )}
            {activeMeds.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No active medications.</p>
            ) : (
              activeMeds.map(med => (
                <div key={med.prescriptionId} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1A2E4A]">{med.medicationName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{med.dosage} · {med.frequency}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Dr. {med.prescribingDoctor}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {med.isRecurring && (
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Daily</span>
                      )}
                      {med.endDate && (
                        <span className="text-xs text-gray-400">Until {med.endDate}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Vaccinations tab */}
        {activeTab === 'vaccinations' && (
          <>
            {canEdit && (
              <button
                onClick={() => navigate(`/medical/${memberId}/vaccinations`)}
                className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-[#1A2E4A] hover:text-[#1A2E4A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add / Update Vaccination</span>
              </button>
            )}
            {profile.vaccinationStatus.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No vaccination records.</p>
            ) : (
              profile.vaccinationStatus.map(v => {
                const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.NotApplicable;
                return (
                  <div key={v.vaccinationId} className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1A2E4A]">{v.vaccineName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {v.status === 'Given' && v.givenDate
                          ? `Given: ${new Date(v.givenDate).toLocaleDateString('en-IN')}`
                          : v.dueDate
                          ? `Due: ${new Date(v.dueDate).toLocaleDateString('en-IN')}`
                          : v.status}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {v.status}
                    </span>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemberHealthProfileScreen;
