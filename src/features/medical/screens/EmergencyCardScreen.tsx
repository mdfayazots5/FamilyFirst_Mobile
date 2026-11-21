import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, Heart, Phone, Share2, Copy, Check, Lock, Pill,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { UserRole } from '../../../core/auth/UserRole';
import { MedicalRepository, EmergencyCard, EmergencyCardShare } from '../repositories/MedicalRepository';
import AllergyBadge from '../widgets/AllergyBadge';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFErrorState from '../../../shared/components/FFErrorState';
import EmergencyCacheBanner from '../../../core/connectivity/EmergencyCacheBanner';
import { isEmergencyNetworkFailure } from '../../../core/cache/EmergencyOfflineStore';

interface EmergencyCardScreenProps {
  shareToken?: string;
}

type CardState =
  | { status: 'loading' }
  | { status: 'ready'; card: EmergencyCard; fromCache: boolean }
  | { status: 'error'; message: string };

const EmergencyCardScreen: React.FC<EmergencyCardScreenProps> = ({ shareToken }) => {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  const { user } = useAuth();

  const [cardState, setCardState] = useReducer((_previous: CardState, next: CardState) => next, { status: 'loading' });
  const [shareData, setShareData] = useState<EmergencyCardShare | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const isPublicView = !!shareToken;
  const canShare = !isPublicView && (user?.role === UserRole.PARENT || user?.role === UserRole.FAMILY_ADMIN);

  useEffect(() => {
    let active = true;
    setCardState({ status: 'loading' });
    setShareData(null);
    setShowSharePanel(false);
    const request = shareToken
      ? MedicalRepository.getEmergencyCardByToken(shareToken).then(data => ({ data, fromCache: false }))
      : user?.familyId && memberId
        ? MedicalRepository.loadEmergencyCard(user.familyId, memberId)
        : null;
    if (!request) {
      setCardState({ status: 'error', message: 'The emergency card could not be found.' });
      return;
    }
    void request
      .then(({ data, fromCache }) => {
        if (active) setCardState({ status: 'ready', card: data, fromCache });
      })
      .catch(error => {
        if (!active) return;
        const message = shareToken
          ? isEmergencyNetworkFailure(error)
            ? 'Reconnect to verify and open this shared emergency card.'
            : 'Unable to load this emergency card link. It may have expired or been revoked.'
          : 'Unable to load the emergency card.';
        setCardState({ status: 'error', message });
      });
    return () => { active = false; };
  }, [shareToken, user?.familyId, user?.id, memberId, loadAttempt]);

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

  if (cardState.status === 'loading') {
    return (
      <div className="min-h-screen bg-bg-cream">
        <div className="bg-alert px-5 pt-12 pb-5">
          <div className="h-6 w-48 bg-white/20 rounded-full" />
        </div>
        <div className="px-4 pt-4 space-y-4">
          <FFShimmer className="h-32 rounded-ff" />
          <FFShimmer className="h-24 rounded-ff" />
          <FFShimmer className="h-28 rounded-ff" />
        </div>
      </div>
    );
  }

  if (cardState.status === 'error') {
    return (
      <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center px-8 gap-5">
        <FFErrorState
          title="Emergency card unavailable"
          message={cardState.message}
          onRetry={() => setLoadAttempt(attempt => attempt + 1)}
        />
        {isPublicView && (
        <div className="flex items-center gap-2 bg-black/[0.03] border border-black/5 rounded-xl px-4 py-3">
          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="font-body text-xs text-gray-500">Emergency card links expire after 72 hours.</p>
        </div>
        )}
      </div>
    );
  }

  const { card, fromCache } = cardState;
  const showShareActions = canShare && !fromCache;
  return (
    <div className="min-h-screen bg-bg-cream">
      {fromCache && <EmergencyCacheBanner />}
      {/* Header — alert red intentional for emergency card */}
      <div className="bg-alert px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          {!isPublicView && (
            <button onClick={() => navigate(-1)} className="grid min-h-12 min-w-12 place-items-center rounded-xl bg-white/10" aria-label="Go back">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <div className="flex-1">
            <p className="font-body text-xs text-white/60 font-semibold uppercase tracking-wide">
              Medical Emergency Card
            </p>
            <h1 className="font-display font-bold text-xl text-white">{card.memberName}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Blood Group — prominent */}
        <div className="bg-alert rounded-ff p-5 flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-ff flex flex-col items-center justify-center">
            <Heart className="w-6 h-6 text-alert mb-1" fill="currentColor" />
            <span className="font-numbers font-bold text-2xl text-alert">
              {card.bloodGroup || '?'}
            </span>
          </div>
          <div>
            <p className="font-body text-xs text-white/60 font-semibold uppercase tracking-wide">Blood Group</p>
            <p className="font-numbers font-bold text-3xl text-white">
              {card.bloodGroup || 'Unknown'}
            </p>
            {card.organDonor && (
              <span className="font-body text-xs bg-white/20 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                Organ Donor
              </span>
            )}
          </div>
        </div>

        {/* Allergies */}
        <AllergyBadge allergies={card.knownAllergies} />

        {/* Current Medications */}
        {card.currentMedications.length > 0 && (
          <FFCard className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" />
              <p className="font-body text-xs font-medium text-gray-400 uppercase tracking-wider">Current Medications</p>
            </div>
            {card.currentMedications.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-primary">{m.medicationName}</span>
                <span className="font-body text-xs text-gray-500">{m.dosage}</span>
              </div>
            ))}
          </FFCard>
        )}

        {/* Doctor + Emergency Contact */}
        {(card.primaryDoctorName || card.emergencyContactName) && <FFCard className="p-4 space-y-3">
          {card.primaryDoctorName && (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-xs text-gray-400">Primary Doctor</p>
                <p className="font-body text-sm font-medium text-primary">{card.primaryDoctorName}</p>
              </div>
              {card.primaryDoctorPhone && (
                <a href={`tel:${card.primaryDoctorPhone}`}
                  className="flex items-center gap-1 font-body text-xs text-success bg-success/10 px-3 py-1.5 rounded-xl">
                  <Phone className="w-3 h-3" />Call
                </a>
              )}
            </div>
          )}
          {card.emergencyContactName && (
            <div className="flex items-center justify-between pt-2 border-t border-black/5">
              <div>
                <p className="font-body text-xs text-gray-400">Emergency Contact</p>
                <p className="font-body text-sm font-medium text-primary">{card.emergencyContactName}</p>
              </div>
              {card.emergencyContactPhone && (
                <a href={`tel:${card.emergencyContactPhone}`}
                  className="flex items-center gap-1 font-body text-xs font-bold text-alert bg-alert/10 px-3 py-1.5 rounded-xl border border-alert/20">
                  <Phone className="w-3 h-3" fill="currentColor" />Call Now
                </a>
              )}
            </div>
          )}
        </FFCard>}

        {/* Share actions */}
        {showShareActions && !showSharePanel && (
          <FFButton
            onClick={handleShare}
            disabled={!card.isProfileComplete}
            isLoading={isSharing}
            icon={<Share2 className="w-4 h-4" />}
            className="w-full"
          >
            Share Emergency Card
          </FFButton>
        )}

        {!card.isProfileComplete && showShareActions && (
          <p className="font-body text-xs text-center text-accent">
            Add Blood Group and Allergies to enable sharing.
          </p>
        )}

        {/* Share panel */}
        {showShareActions && showSharePanel && shareData && (
          <FFCard className="p-5 space-y-4">
            <p className="font-display font-semibold text-sm text-primary">Share Options</p>

            <div className="flex justify-center">
              <QRCodeSVG
                value={`${window.location.origin}${shareData.shareLink}`}
                size={160}
                level="H"
              />
            </div>

            <p className="font-body text-xs text-center text-gray-400">
              Scan at OPD — no app or account required
            </p>

            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-black/5 rounded-xl font-body text-xs text-gray-500 truncate">
                {`${window.location.origin}${shareData.shareLink}`}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-xl font-body text-sm font-medium"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <p className="font-body text-xs text-center text-gray-400">
              Link expires {new Date(shareData.expiresAt).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </FFCard>
        )}
      </div>
    </div>
  );
};

export default EmergencyCardScreen;
