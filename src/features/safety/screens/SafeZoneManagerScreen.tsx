import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit3, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { SafetyRepository, SafeZone } from '../repositories/SafetyRepository';
import FFEmptyState from '../../../shared/components/FFEmptyState';

const ZONE_COLORS: Record<string, string> = {
  Home:           'bg-green-50 text-green-700 border-green-200',
  School:         'bg-blue-50 text-blue-700 border-blue-200',
  Tuition:        'bg-purple-50 text-purple-700 border-purple-200',
  RelativesHouse: 'bg-amber-50 text-amber-700 border-amber-200',
  Workplace:      'bg-gray-50 text-gray-600 border-gray-200',
  PlaceOfWorship: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Other:          'bg-gray-50 text-gray-600 border-gray-200',
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
    <div className="min-h-screen bg-[#F8F4EE]">
      <div className="bg-[#1A2E4A] px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Safe Zones
            </h1>
            <p className="text-xs text-blue-200">{zones.length} zone{zones.length !== 1 ? 's' : ''} configured</p>
          </div>
          <button
            onClick={() => navigate('/safety/zones/add')}
            className="flex items-center gap-1.5 bg-[#C8922A] text-white px-3 py-1.5 rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-300 animate-spin" />
          </div>
        ) : zones.length === 0 ? (
          <FFEmptyState
            title="No safe zones yet"
            subtitle="Add your child's school or home to get arrival and departure alerts."
            action={{ label: 'Add First Zone', onClick: () => navigate('/safety/zones/add') }}
          />
        ) : (
          zones.map(zone => {
            const colorClass = ZONE_COLORS[zone.zoneType] ?? ZONE_COLORS.Other;
            return (
              <div key={zone.zoneId} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-gray-50 rounded-xl flex-shrink-0">
                      <Shield className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A2E4A] truncate">{zone.zoneName}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colorClass}`}>
                          {zone.zoneType}
                        </span>
                        <span className="text-xs text-gray-400">{zone.radiusMetres}m radius</span>
                        {zone.lateAlertEnabled && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            Late alert {zone.lateAlertTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/safety/zones/edit/${zone.zoneId}`)}
                      className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(zone.zoneId)}
                      disabled={deletingId === zone.zoneId}
                      className="p-2 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SafeZoneManagerScreen;
