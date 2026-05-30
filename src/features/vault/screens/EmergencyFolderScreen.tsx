import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, WifiOff, Phone, Heart, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { VaultRepository } from '../repositories/VaultRepository';
import type { VaultDocument } from '../repositories/VaultRepository';
import DocumentCard from '../widgets/DocumentCard';

// Emergency member card — shows critical health info per member
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
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Offline indicator */}
      {isOffline && (
        <div className="bg-amber-500 text-white px-4 py-2 flex items-center gap-2 text-sm">
          <WifiOff className="w-4 h-4" />
          <span>Offline — showing cached emergency data</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-red-700 px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          {user && (
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emergency Folder
            </h1>
          </div>
        </div>
        <p className="text-red-200 text-xs mt-2">View-only · No login required for shared links</p>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-5">
        {/* Member emergency cards */}
        <div>
          <h2 className="text-sm font-bold text-[#1A2E4A] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Family Emergency Info
          </h2>
          <div className="space-y-3">
            {DEMO_EMERGENCY_CARDS.map(card => (
              <div key={card.memberId} className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#1A2E4A]">{card.memberName}</span>
                  <span className="flex items-center gap-1.5 bg-red-50 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
                    <Heart className="w-3.5 h-3.5" fill="currentColor" />
                    {card.bloodGroup}
                  </span>
                </div>

                {card.allergies.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-amber-700 mb-1">⚠ Allergies</p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.allergies.map(a => (
                        <span key={a} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                )}

                {card.medications.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-blue-700 mb-1">💊 Current Medications</p>
                    {card.medications.map(m => (
                      <p key={m} className="text-xs text-gray-700">{m}</p>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <Phone className="w-3.5 h-3.5 text-green-600" />
                  <a href={`tel:${card.emergencyContact.split('(')[0].trim()}`}
                    className="text-sm font-medium text-green-700 underline">
                    {card.emergencyContact}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority documents */}
        <div>
          <h2 className="text-sm font-bold text-[#1A2E4A] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Priority Documents ({documents.length}/5)
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center">
              <p className="text-sm text-gray-400">
                No documents tagged as emergency priority.
              </p>
              {user && (
                <button
                  onClick={() => navigate('/vault')}
                  className="mt-3 flex items-center gap-1 text-xs text-[#C8922A] font-medium mx-auto"
                >
                  Tag documents <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
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
      </div>
    </div>
  );
};

export default EmergencyFolderScreen;
