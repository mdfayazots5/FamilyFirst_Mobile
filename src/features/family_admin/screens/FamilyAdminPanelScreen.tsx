import React from 'react';
import { Users, Eye, Bell, ChevronRight, Shield, Settings, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FFCard from '../../../shared/components/FFCard';
import FFBadge from '../../../shared/components/FFBadge';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

const familyModules = [
  {
    id: 'visibility',
    label: 'Module Access',
    desc: 'Control what each role can see',
    Icon: Eye,
    path: '/family-admin/modules',
    bg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    id: 'notifications',
    label: 'Notification Rules',
    desc: 'Set up family alert preferences',
    Icon: Bell,
    path: '/family-admin/notifications',
    bg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    id: 'members',
    label: 'Family Members',
    desc: 'Manage profiles and invites',
    Icon: Users,
    path: '/parent/members',
    bg: 'bg-success/10',
    iconColor: 'text-success',
  },
];

const advancedModules = [
  {
    id: 'emergency',
    label: 'Emergency Access',
    desc: 'Emergency folder & SOS contacts',
    Icon: Shield,
    path: '/family-admin/emergency-access',
    status: 'Active',
    statusVariant: 'success' as const,
  },
  {
    id: 'finance',
    label: 'Finance Privacy',
    desc: 'Default sharing tiers for members',
    Icon: Settings,
    path: '/family-admin/finance-privacy',
    status: 'Configured',
    statusVariant: 'primary' as const,
  },
  {
    id: 'thresholds',
    label: 'Alert Thresholds',
    desc: 'Safety & document alert limits',
    Icon: ClipboardList,
    path: '/family-admin/alert-thresholds',
    status: 'Active',
    statusVariant: 'success' as const,
  },
  {
    id: 'storage',
    label: 'Storage',
    desc: 'Document storage provider',
    Icon: Settings,
    path: '/family-admin/storage',
    status: 'App Managed',
    statusVariant: 'gray' as const,
  },
];

const FamilyAdminPanelScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-6">
      <div className="overflow-hidden rounded-ff">
        <FFPageHeader title="Family Admin" showBack />
      </div>

      <div className="space-y-6 pt-5 page-enter">

        {/* Quick Actions */}
        <div className="space-y-3">
          <FFSectionHeader icon={<Settings className="w-[18px] h-[18px]" />} title="Configuration" />
          <div className="grid grid-cols-1 gap-3">
            {familyModules.map(({ id, label, desc, Icon, path, bg, iconColor }) => (
              <FFCard
                key={id}
                hoverable
                onClick={() => navigate(path)}
                className="p-4 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-ff-sm flex items-center justify-center flex-shrink-0 ${bg}`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-primary">{label}</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </FFCard>
            ))}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-3">
          <FFSectionHeader icon={<Shield className="w-[18px] h-[18px]" />} title="Advanced Settings" />
          <div className="space-y-2">
            {advancedModules.map(({ id, label, desc, Icon, path, status, statusVariant }) => (
              <FFCard
                key={id}
                hoverable
                onClick={() => navigate(path)}
                className="p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-ff-sm bg-black/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-primary">{label}</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5 truncate">{desc}</p>
                </div>
                <FFBadge variant={statusVariant}>{status}</FFBadge>
              </FFCard>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FamilyAdminPanelScreen;
