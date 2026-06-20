import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, WifiOff, Phone, Heart, AlertTriangle, Pill, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository } from '../repositories/VaultRepository';
import type { VaultDocument } from '../repositories/VaultRepository';
import DocumentCard from '../widgets/DocumentCard';
import FFCard from '../../../shared/components/FFCard';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

interface EmergencyMemberCard {
  memberId: string;
  memberName: string;
  bloodGroup: string;
  allergies: string[];
  medications: string[];
  emergencyContact: string;
}

const DEMO_EMERGENCY_CARDS: EmergencyMemberCard[] = [
  {
    memberId: 'm1',
    memberName: 'Arjun',
    bloodGroup: 'B+',
    allergies: ['Penicillin', 'Peanuts'],
    medications: ['Salbutamol inhaler'],
    emergencyContact: '+91 98765 43210 (Priya)',
  },
  {
    memberId: 'm2',
    memberName: 'Priya',
    bloodGroup: 'O+',
    allergies: [],
    medications: [],
    emergencyContact: '+91 98765 43210 (Rajesh)',
  },
];

const EmergencyFolderScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const onOnline  = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    const familyId = user?.familyId ?? 'demo';
    VaultRepository.getEmergencyDocuments(familyId)
      .then(setDocuments)
      .finally(() => setIsLoading(false));
  }, [user?.familyId]);

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      {/* Offline indicator */}
      {isOffline && (
        <div className="bg-accent text-primary px-4 py-2 flex items-center gap-2 font-body text-sm font-semibold">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>Offline — showing cached emergency data</span>
        </div>
      )}

      {/* Emergency header — alert red is intentional for emergency context */}
      <div className="bg-alert px-5 pt-12 pb-5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {user && (
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10" aria-label="Go back">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-white" />
            <h1 className="font-display font-bold text-lg text-white">Emergency Folder</h1>
          </div>
        </div>
        <p className="font-body text-white/70 text-xs mt-2">View-only · No login required for shared links</p>
      </div>

      <main className="px-4 pt-4 pb-24 space-y-5 page-enter">
        {/* Member emergency cards */}
        <div className="space-y-3">
          <FFSectionHeader icon={<Heart className="w-[18px] h-[18px]" />} title="Family Emergency Info" />
          {DEMO_EMERGENCY_CARDS.map(card => (
            <FFCard key={card.memberId} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-base text-primary">{card.memberName}</span>
                <span className="flex items-center gap-1.5 bg-alert/10 text-alert font-numbers font-medium text-sm px-3 py-1 rounded-full">
                  <Heart className="w-3.5 h-3.5" fill="currentColor" />
                  {card.bloodGroup}
                </span>
              </div>

              {card.allergies.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-accent" />
                    <p className="font-body font-semibold text-xs text-accent">Allergies</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.allergies.map(a => (
                      <span key={a} className="font-body text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {card.medications.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Pill className="w-3.5 h-3.5 text-primary" />
                    <p className="font-body font-semibold text-xs text-primary">Current Medications</p>
                  </div>
                  {card.medications.map(m => (
                    <p key={m} className="font-body text-xs text-primary">{m}</p>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                <Phone className="w-3.5 h-3.5 text-success flex-shrink-0" />
                <a
                  href={`tel:${card.emergencyContact.split('(')[0].trim()}`}
                  className="font-body text-sm font-semibold text-success underline"
                >
                  {card.emergencyContact}
                </a>
              </div>
            </FFCard>
          ))}
        </div>

        {/* Priority documents */}
        <div className="space-y-3">
          <FFSectionHeader icon={<ShieldAlert className="w-[18px] h-[18px]" />} title={`Priority Documents (${documents.length}/5)`} />

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <FFShimmer key={i} className="h-16 rounded-ff" />)}
            </div>
          ) : documents.length === 0 ? (
            <FFCard className="p-6 text-center">
              <p className="font-body text-sm text-gray-400">No documents tagged as emergency priority.</p>
              {user && (
                <button
                  onClick={() => navigate('/vault')}
                  className="mt-3 flex items-center gap-1 font-body text-xs text-accent font-semibold mx-auto"
                >
                  Tag documents <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </FFCard>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <DocumentCard
                  key={doc.documentId}
                  document={doc}
                  onClick={() => user ? navigate(`/vault/${doc.documentId}`) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmergencyFolderScreen;
