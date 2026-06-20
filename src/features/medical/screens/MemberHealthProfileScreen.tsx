import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Heart, Pill, Edit3, Plus, ChevronRight, Clock,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { MedicalRepository, HealthProfile } from '../repositories/MedicalRepository';
import AllergyBadge from '../widgets/AllergyBadge';
import FFButton from '../../../shared/components/FFButton';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { UserRole } from '../../../core/auth/AuthContext';

const STATUS_CONFIG = {
  Given:         { color: 'text-success',  bg: 'bg-success/10',  dot: 'bg-success' },
  Due:           { color: 'text-accent',   bg: 'bg-accent/10',   dot: 'bg-accent' },
  Overdue:       { color: 'text-alert',    bg: 'bg-alert/10',    dot: 'bg-alert' },
  NotApplicable: { color: 'text-gray-400', bg: 'bg-black/5',     dot: 'bg-gray-300' },
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
      <div className="min-h-screen bg-bg-cream">
        <FFPageHeader title="Health Profile" showBack />
        <div className="px-4 pt-4 space-y-3">
          <FFShimmer className="h-24 rounded-ff" />
          <FFShimmer className="h-36 rounded-ff" />
          <FFShimmer className="h-24 rounded-ff" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center p-6 gap-4">
        <p className="font-body text-sm text-gray-500">Profile not found.</p>
        <FFButton onClick={() => navigate(-1)}>Go Back</FFButton>
      </div>
    );
  }

  const activeMeds = profile.currentMedications.filter(m => !m.isArchived);
  const dueVaccinations = profile.vaccinationStatus.filter(v => v.status === 'Due' || v.status === 'Overdue');

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title={profile.memberName}
        subtitle="Health Profile"
        showBack
        rightAction={
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => navigate(`/medical/${memberId}/edit`)}
                className="p-2 rounded-xl bg-white/10"
                aria-label="Edit profile"
              >
                <Edit3 className="w-4 h-4 text-white" />
              </button>
            )}
            <button
              onClick={() => navigate(`/medical/${memberId}/emergency-card`)}
              className="flex items-center gap-1.5 bg-alert text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
            >
              <Heart className="w-3.5 h-3.5" fill="currentColor" />
              Emergency
            </button>
          </div>
        }
      />

      {/* Blood group strip — below header, still primary bg */}
      <div className="bg-primary px-5 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-ff bg-alert/20 border border-alert/30 flex flex-col items-center justify-center">
            <Heart className="w-5 h-5 text-alert mb-0.5" fill="currentColor" />
            <span className="font-numbers font-bold text-lg text-white">
              {profile.bloodGroup || '?'}
            </span>
          </div>
          <div className="flex-1">
            {!profile.isProfileComplete ? (
              <div className="bg-accent/20 border border-accent/30 rounded-xl px-3 py-2">
                <p className="font-body text-xs font-medium text-accent">
                  Profile incomplete — add Blood Group and Allergies to enable emergency card sharing.
                </p>
              </div>
            ) : (
              <p className="font-body text-xs text-success">Profile complete · Emergency card ready</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/5 bg-white px-4">
        {(['overview', 'medications', 'vaccinations'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 font-body text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400'
            }`}
          >
            {tab}
            {tab === 'medications' && activeMeds.length > 0 && (
              <span className="ml-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {activeMeds.length}
              </span>
            )}
            {tab === 'vaccinations' && dueVaccinations.length > 0 && (
              <span className="ml-1 text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
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
              <FFCard className="p-4">
                <p className="font-body text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Chronic Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {profile.chronicConditions.map(c => (
                    <span key={c} className="font-body text-sm bg-primary/10 text-primary px-3 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </FFCard>
            )}

            {profile.primaryDoctor && (
              <FFCard className="p-4 space-y-2">
                <p className="font-body text-xs font-medium text-gray-400 uppercase tracking-wider">Primary Doctor</p>
                <p className="font-body text-sm font-semibold text-primary">{profile.primaryDoctor.name}</p>
                {profile.primaryDoctor.phone && (
                  <a href={`tel:${profile.primaryDoctor.phone}`} className="font-body text-sm text-success">
                    {profile.primaryDoctor.phone}
                  </a>
                )}
              </FFCard>
            )}

            {profile.emergencyContact && (
              <FFCard className="p-4 space-y-2">
                <p className="font-body text-xs font-medium text-gray-400 uppercase tracking-wider">Emergency Contact</p>
                <p className="font-body text-sm font-semibold text-primary">
                  {profile.emergencyContact.name}
                  {profile.emergencyContact.relationship && (
                    <span className="text-gray-400 font-normal"> · {profile.emergencyContact.relationship}</span>
                  )}
                </p>
                {profile.emergencyContact.phone && (
                  <a href={`tel:${profile.emergencyContact.phone}`} className="font-body text-sm text-success">
                    {profile.emergencyContact.phone}
                  </a>
                )}
              </FFCard>
            )}

            <button
              onClick={() => navigate(`/medical/${memberId}/timeline`)}
              className="flex items-center gap-3 w-full p-4 bg-white border border-black/5 rounded-ff shadow-card"
            >
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="font-body text-sm font-medium text-primary flex-1 text-left">Health Timeline</span>
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
                className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-black/10 rounded-ff text-gray-400 hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="font-body text-sm font-medium">Add Prescription</span>
              </button>
            )}
            {activeMeds.length === 0 ? (
              <p className="font-body text-sm text-gray-400 text-center py-8">No active medications.</p>
            ) : (
              activeMeds.map(med => (
                <FFCard key={med.prescriptionId} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-body text-sm font-semibold text-primary">{med.medicationName}</p>
                      <p className="font-body text-xs text-gray-500 mt-0.5">{med.dosage} · {med.frequency}</p>
                      <p className="font-body text-xs text-gray-400 mt-0.5">Dr. {med.prescribingDoctor}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {med.isRecurring && (
                        <span className="font-body text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Daily</span>
                      )}
                      {med.endDate && (
                        <span className="font-body text-xs text-gray-400">Until {med.endDate}</span>
                      )}
                    </div>
                  </div>
                </FFCard>
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
                className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-black/10 rounded-ff text-gray-400 hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="font-body text-sm font-medium">Add / Update Vaccination</span>
              </button>
            )}
            {profile.vaccinationStatus.length === 0 ? (
              <p className="font-body text-sm text-gray-400 text-center py-8">No vaccination records.</p>
            ) : (
              profile.vaccinationStatus.map(v => {
                const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.NotApplicable;
                return (
                  <div key={v.vaccinationId} className="flex items-center gap-3 bg-white border border-black/5 rounded-ff p-4 shadow-card">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1">
                      <p className="font-body text-sm font-medium text-primary">{v.vaccineName}</p>
                      <p className="font-body text-xs text-gray-400 mt-0.5">
                        {v.status === 'Given' && v.givenDate
                          ? `Given: ${new Date(v.givenDate).toLocaleDateString('en-IN')}`
                          : v.dueDate
                          ? `Due: ${new Date(v.dueDate).toLocaleDateString('en-IN')}`
                          : v.status}
                      </p>
                    </div>
                    <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
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
