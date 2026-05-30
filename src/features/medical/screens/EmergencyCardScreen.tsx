import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import {
  ArrowLeft, Heart, AlertTriangle, Phone, Share2, RefreshCw,
  Link2, Copy, Check, Lock, Pill,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { MedicalRepository, EmergencyCard, EmergencyCardShare } from '../repositories/MedicalRepository';
import AllergyBadge from '../widgets/AllergyBadge';

interface EmergencyCardScreenProps {
  shareToken?: string; // set when rendering via public share link (no auth)
}

const EmergencyCardScreen: React.FC<EmergencyCardScreenProps> = ({ shareToken }) => {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  const { user } = useAuth();

  const [card, setCard] = useState<EmergencyCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareData, setShareData] = useState<EmergencyCardShare | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPublicView = !!shareToken;
  const canShare = !isPublicView && (user?.role === 'Parent' || user?.role === 'FamilyAdmin');

  useEffect(() => {
    if (shareToken) {
      MedicalRepository.getEmergencyCardByToken(shareToken)
        .then(setCard)
        .catch(() => setError('This emergency card link has expired or been revoked.'))
        .finally(() => setIsLoading(false));
    } else if (user?.familyId && memberId) {
      MedicalRepository.getEmergencyCard(user.familyId, memberId)
        .then(setCard)
        .finally(() => setIsLoading(false));
    }
  }, [shareToken, user?.familyId, memberId]);

  const handleShare = async () => {
    if (!user?.familyId || !memberId) return;
    setIsSharing(true);
    try {
      const data = await MedicalRepository.shareEmergencyCard(user.familyId, memberId, { expiryHours: 72 });
      setShareData(data);
      setShowSharePanel(true);
    } catch {
      // ignore
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = () => {
    if (!shareData) return;
    const url = `${window.location.origin}${shareData.shareLink}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F4EE] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center px-8 gap-5">
        <Lock className="w-12 h-12 text-red-300" />
        <h2 className="text-base font-bold text-red-700 text-center">
          {error ?? 'Emergency card unavailable.'}
        </h2>
        <p className="text-xs text-red-500 text-center">
          Contact the family for a new emergency card link.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EE]">
      {/* Header */}
      <div className="bg-red-700 px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          {!isPublicView && (
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="flex-1">
            <p className="text-xs text-red-200 font-medium uppercase tracking-wide">
              Medical Emergency Card
            </p>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {card.memberName}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Blood Group — prominent */}
        <div className="bg-red-600 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-2xl flex flex-col items-center justify-center">
            <Heart className="w-6 h-6 text-red-600 mb-1" fill="currentColor" />
            <span className="text-2xl font-black text-red-700" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {card.bloodGroup || '?'}
            </span>
          </div>
          <div>
            <p className="text-red-200 text-xs font-medium uppercase tracking-wide">Blood Group</p>
            <p className="text-white text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {card.bloodGroup || 'Unknown'}
            </p>
            {card.organDonor && (
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                Organ Donor
              </span>
            )}
          </div>
        </div>

        {/* Allergies */}
        <AllergyBadge allergies={card.knownAllergies} />

        {/* Current Medications */}
        {card.currentMedications.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Medications</p>
            </div>
            {card.currentMedications.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1A2E4A]">{m.medicationName}</span>
                <span className="text-xs text-gray-500">{m.dosage}</span>
              </div>
            ))}
          </div>
        )}

        {/* Doctor + Emergency Contact */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          {card.primaryDoctorName && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Primary Doctor</p>
                <p className="text-sm font-medium text-[#1A2E4A]">{card.primaryDoctorName}</p>
              </div>
              {card.primaryDoctorPhone && (
                <a href={`tel:${card.primaryDoctorPhone}`}
                  className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-xl">
                  <Phone className="w-3 h-3" />Call
                </a>
              )}
            </div>
          )}
          {card.emergencyContactName && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Emergency Contact</p>
                <p className="text-sm font-medium text-[#1A2E4A]">{card.emergencyContactName}</p>
              </div>
              {card.emergencyContactPhone && (
                <a href={`tel:${card.emergencyContactPhone}`}
                  className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                  <Phone className="w-3 h-3" fill="currentColor" />Call Now
                </a>
              )}
            </div>
          )}
        </div>

        {/* Share actions */}
        {canShare && !showSharePanel && (
          <button
            onClick={handleShare}
            disabled={!card.isProfileComplete || isSharing}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#1A2E4A] text-white rounded-2xl text-sm font-semibold disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {isSharing ? 'Generating link…' : 'Share Emergency Card'}
          </button>
        )}

        {!card.isProfileComplete && canShare && (
          <p className="text-xs text-center text-orange-600">
            Add Blood Group and Allergies to enable sharing.
          </p>
        )}

        {/* Share panel */}
        {showSharePanel && shareData && (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <p className="text-sm font-semibold text-[#1A2E4A]">Share Options</p>

            <div className="flex justify-center">
              <QRCode
                value={`${window.location.origin}${shareData.shareLink}`}
                size={160}
                level="H"
                renderAs="svg"
              />
            </div>

            <p className="text-xs text-center text-gray-400">
              Scan at OPD — no app or account required
            </p>

            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-500 truncate">
                {`${window.location.origin}${shareData.shareLink}`}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-2 bg-[#1A2E4A] text-white rounded-xl text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <p className="text-xs text-center text-gray-400">
              Link expires {new Date(shareData.expiresAt).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyCardScreen;
