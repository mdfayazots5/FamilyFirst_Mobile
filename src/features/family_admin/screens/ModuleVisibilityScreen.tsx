import React, { useState, useEffect } from 'react';
import {
  Save,
  Info,
  Eye,
  EyeOff,
  Shield,
  ClipboardList,
  ShoppingBag,
  MessageSquare,
  Calendar,
  BarChart3,
  ShieldAlert,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { FamilyAdminL2Repository } from '../repositories/FamilyAdminL2Repository';
import FFCard from '../../../shared/components/FFCard';
import FFButton from '../../../shared/components/FFButton';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';

// Maps UI module id (lowercase) → backend ModuleName (PascalCase)
const MODULE_BACKEND_NAME: Record<string, string> = {
  attendance: 'Attendance', tasks: 'Tasks', rewards: 'Rewards',
  feedback: 'Feedback', calendar: 'Calendar', reports: 'Reports',
  safety: 'Safety', admin: 'FamilyAdmin',
};
const ROLE_TO_INT: Record<string, number> = { PARENT: 3, CHILD: 4, TEACHER: 5, ELDER: 6 };
const ROLE_FROM_INT: Record<number, string> = { 3: 'PARENT', 4: 'CHILD', 5: 'TEACHER', 6: 'ELDER' };

const ModuleVisibilityScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const roles = ['PARENT', 'CHILD', 'TEACHER', 'ELDER'];
  const roleLabels: Record<string, string> = { PARENT: 'Parent', CHILD: 'Child', TEACHER: 'Teacher', ELDER: 'Elder' };

  const modules = [
    { id: 'attendance', name: 'Attendance',      icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'tasks',      name: 'Task Board',       icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'rewards',    name: 'Reward Shop',      icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'feedback',   name: 'Teacher Notes',    icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'calendar',   name: 'Family Calendar',  icon: <Calendar className="w-4 h-4" /> },
    { id: 'reports',    name: 'Weekly Reports',   icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'safety',     name: 'Safety & SOS',     icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'admin',      name: 'Admin Panel',      icon: <Settings className="w-4 h-4" /> },
  ];

  // Initial state: parents see all, children see most except admin
  const [visibility, setVisibility] = useState<Record<string, Record<string, boolean>>>(
    roles.reduce((acc, role) => ({
      ...acc,
      [role]: modules.reduce((mAcc, mod) => ({
        ...mAcc,
        [mod.id]: role === 'PARENT' ||
          (role === 'CHILD' && mod.id !== 'admin') ||
          (role === 'TEACHER' && ['attendance', 'feedback'].includes(mod.id))
      }), {})
    }), {})
  );

  const toggleVisibility = (role: string, moduleId: string) => {
    if (role === 'PARENT' && moduleId === 'admin') return;
    setVisibility(prev => ({
      ...prev,
      [role]: { ...prev[role], [moduleId]: !prev[role][moduleId] }
    }));
  };

  useEffect(() => {
    if (!user?.familyId) return;
    FamilyAdminL2Repository.getModuleVisibility(user.familyId).then(items => {
      const loaded: Record<string, Record<string, boolean>> = {};
      items.forEach(item => {
        const roleStr = ROLE_FROM_INT[item.role];
        if (!roleStr) return;
        if (!loaded[roleStr]) loaded[roleStr] = {};
        const modId = Object.entries(MODULE_BACKEND_NAME).find(([, v]) => v === item.moduleName)?.[0];
        if (modId) loaded[roleStr][modId] = item.isVisible;
      });
      setVisibility(prev => {
        const merged = { ...prev };
        roles.forEach(role => { merged[role] = { ...prev[role], ...(loaded[role] ?? {}) }; });
        return merged;
      });
    }).catch(() => { /* keep defaults */ }).finally(() => setIsLoading(false));
  }, [user?.familyId]);

  const handleSave = async () => {
    if (!user?.familyId) return;
    setIsSaving(true);
    try {
      const items = roles.flatMap(role =>
        modules.map(mod => ({
          role: ROLE_TO_INT[role],
          moduleName: MODULE_BACKEND_NAME[mod.id],
          isVisible: visibility[role]?.[mod.id] ?? false,
        }))
      );
      await FamilyAdminL2Repository.updateModuleVisibility(user.familyId, { items });
    } catch { /* silent */ }
    finally { setIsSaving(false); }
  };

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      <FFPageHeader
        title="Module Access"
        subtitle="Choose what each role can see"
        showBack
        rightAction={
          <FFButton size="sm" icon={<Save className="w-4 h-4" />} onClick={handleSave} isLoading={isSaving}>
            Save
          </FFButton>
        }
      />

      <main className="px-4 py-5 space-y-4 page-enter">

        {/* Info notice */}
        <FFCard className="p-3 flex items-start gap-3">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="font-body text-xs text-gray-500 leading-relaxed">
            Changes apply immediately across the app. Parents always retain access to Admin Panel.
          </p>
        </FFCard>

        {/* Matrix */}
        <div className="space-y-3">
          <FFSectionHeader icon={<Eye className="w-[18px] h-[18px]" />} title="Visibility" />

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <FFShimmer key={i} className="h-16 rounded-ff" />)}
            </div>
          ) : (
            <FFCard className="overflow-hidden divide-y divide-black/5">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr,repeat(4,44px)] items-center px-4 py-2.5 bg-black/[0.02]">
                <span className="font-body font-semibold text-xs text-gray-400 uppercase tracking-wider">Module</span>
                {roles.map(role => (
                  <span key={role} className="font-body font-semibold text-[9px] text-gray-400 uppercase tracking-wider text-center">
                    {roleLabels[role].slice(0, 3)}
                  </span>
                ))}
              </div>

              {modules.map(mod => (
                <div
                  key={mod.id}
                  className="grid grid-cols-[1fr,repeat(4,44px)] items-center px-4 py-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-ff-sm bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {mod.icon}
                    </div>
                    <p className="font-body text-sm text-primary truncate">{mod.name}</p>
                  </div>

                  {roles.map(role => {
                    const locked = role === 'PARENT' && mod.id === 'admin';
                    const visible = visibility[role]?.[mod.id] ?? false;
                    return (
                      <div key={role} className="flex justify-center">
                        <button
                          onClick={() => toggleVisibility(role, mod.id)}
                          disabled={locked}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            locked
                              ? 'opacity-30 cursor-not-allowed'
                              : visible
                                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                : 'bg-black/5 text-gray-300 hover:bg-black/10'
                          }`}
                          aria-label={`${visible ? 'Hide' : 'Show'} ${mod.name} for ${roleLabels[role]}`}
                        >
                          {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </FFCard>
          )}
        </div>

      </main>
    </div>
  );
};

export default ModuleVisibilityScreen;
