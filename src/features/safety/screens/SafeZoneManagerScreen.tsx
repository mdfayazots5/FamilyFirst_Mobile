import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit3, Shield } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { SafetyRepository, SafeZone } from '../repositories/SafetyRepository';
import FFEmptyState from '../../../shared/components/FFEmptyState';
import FFCard from '../../../shared/components/FFCard';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';

const ZONE_BADGE: Record<string, string> = {
  Home:           'bg-success/10 text-success border-success/20',
  School:         'bg-primary/10 text-primary border-primary/20',
  Tuition:        'bg-accent/10 text-accent border-accent/20',
  RelativesHouse: 'bg-accent/10 text-accent border-accent/20',
  Workplace:      'bg-black/5 text-gray-600 border-black/10',
  PlaceOfWorship: 'bg-primary/10 text-primary border-primary/20',
  Other:          'bg-black/5 text-gray-600 border-black/10',
};

const SafeZoneManagerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [zones, setZones] = useState<SafeZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.familyId) return;
    SafetyRepository.listZones(user.familyId)
      .then(setZones)
      .finally(() => setIsLoading(false));
  }, [user?.familyId]);

  const handleDelete = async (zoneId: string) => {
    if (!user?.familyId) return;
    setDeletingId(zoneId);
    try {
      await SafetyRepository.deleteZone(user.familyId, zoneId);
      setZones(prev => prev.filter(z => z.zoneId !== zoneId));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-cream">
      <FFPageHeader
        title="Safe Zones"
        subtitle={`${zones.length} zone${zones.length !== 1 ? 's' : ''} configured`}
        showBack
        rightAction={
          <button
            onClick={() => navigate('/safety/zones/add')}
            className="flex items-center gap-1.5 bg-accent text-white px-3 py-1.5 rounded-xl font-body text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />Add
          </button>
        }
      />

      <div className="px-4 pt-4 pb-24 space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <FFShimmer key={i} className="h-20 rounded-ff" />)}
          </div>
        ) : zones.length === 0 ? (
          <FFEmptyState
            title="No safe zones yet"
            message="Add your child's school or home to get arrival and departure alerts."
            actionLabel="Add First Zone"
            onAction={() => navigate('/safety/zones/add')}
          />
        ) : (
          zones.map(zone => {
            const badgeClass = ZONE_BADGE[zone.zoneType] ?? ZONE_BADGE.Other;
            return (
              <FFCard key={zone.zoneId} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-black/5 rounded-xl flex-shrink-0">
                      <Shield className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-sm font-semibold text-primary truncate">{zone.zoneName}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`font-body text-xs font-medium px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          {zone.zoneType}
                        </span>
                        <span className="font-numbers text-xs text-gray-400">{zone.radiusMetres}m radius</span>
                        {zone.lateAlertEnabled && (
                          <span className="font-body text-xs text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                            Late alert {zone.lateAlertTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/safety/zones/edit/${zone.zoneId}`)}
                      className="p-2 rounded-xl hover:bg-black/5 transition-colors"
                      aria-label="Edit zone"
                    >
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(zone.zoneId)}
                      disabled={deletingId === zone.zoneId}
                      className="p-2 rounded-xl hover:bg-alert/5 transition-colors"
                      aria-label="Delete zone"
                    >
                      <Trash2 className="w-4 h-4 text-alert" />
                    </button>
                  </div>
                </div>
              </FFCard>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SafeZoneManagerScreen;
