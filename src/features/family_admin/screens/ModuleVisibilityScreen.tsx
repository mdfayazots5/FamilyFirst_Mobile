import React, { useEffect, useState } from 'react';
import { BarChart3, Calendar, ClipboardList, Eye, EyeOff, ListTodo, Lock, MessageSquare, Save, Settings, ShieldAlert, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import FFButton from '../../../shared/components/FFButton';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { FAMILY_ADMIN_ROLE_OPTIONS, FamilyAdminL2Repository, type ModuleVisibilityItem } from '../repositories/FamilyAdminL2Repository';

const roles = FAMILY_ADMIN_ROLE_OPTIONS;
const roleLabels: Record<string, string> = { PARENT: 'Parent', CHILD: 'Child', TEACHER: 'Teacher', ELDER: 'Elder' };
const roleValues: Record<string, number> = { PARENT: 3, CHILD: 4, TEACHER: 5, ELDER: 6 };

const modules = [
  { name: 'Attendance', key: 'Attendance', Icon: ClipboardList },
  { name: 'Task Board', key: 'Tasks', Icon: ListTodo },
  { name: 'Reward Shop', key: 'Rewards', Icon: ShoppingBag },
  { name: 'Teacher Notes', key: 'Feedback', Icon: MessageSquare },
  { name: 'Family Calendar', key: 'Calendar', Icon: Calendar },
  { name: 'Weekly Reports', key: 'Reports', Icon: BarChart3 },
  { name: 'Safety & SOS', key: 'Safety', Icon: ShieldAlert },
  { name: 'Admin Panel', key: 'FamilyAdmin', Icon: Settings },
];

type Visibility = Record<string, Record<string, boolean>>;

const isLocked = (role: string, module: string) => role === 'PARENT' && module === 'FamilyAdmin';

function readVisibility(items: ModuleVisibilityItem[]): Visibility {
  return Object.fromEntries(roles.map(role => [
    role,
    Object.fromEntries(modules.map(({ key }) => {
      const stored = items.find(item => item.role === roleValues[role] && item.moduleName === key);
      const defaultValue = role === 'PARENT'
        || (role === 'CHILD' && key !== 'FamilyAdmin')
        || (role === 'TEACHER' && (key === 'Attendance' || key === 'Feedback'));
      return [key, stored?.isVisible ?? defaultValue];
    })),
  ]));
}

const ModuleVisibilityScreen: React.FC = () => {
  const { user } = useAuth();
  const familyId = user?.familyId;
  const [data, setData] = useState<{ saved: Visibility; draft: Visibility } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'error' | null>(null);

  useEffect(() => {
    setData(null);
    setSaveStatus(null);
    if (!familyId) {
      setLoadError('Family details are unavailable for this account.');
      return;
    }

    setLoadError(null);
    let current = true;
    FamilyAdminL2Repository.getModuleVisibility(familyId).then(items => {
      if (!current) return;
      const saved = readVisibility(items);
      setData({ saved, draft: saved });
    }).catch(() => {
      if (current) setLoadError('Unable to load module visibility. Try again before making changes.');
    });
    return () => { current = false; };
  }, [familyId, loadAttempt]);

  const changes = data ? roles.flatMap(role =>
    modules.flatMap(({ key }) => {
      const isVisible = data.draft[role][key];
      return !isLocked(role, key) && isVisible !== data.saved[role][key]
        ? [{ role: roleValues[role], moduleName: key, isVisible }]
        : [];
    }),
  ) : [];

  const toggleVisibility = (role: string, module: string) => {
    setSaveStatus(null);
    setData(current => current && {
      ...current,
      draft: {
        ...current.draft,
        [role]: { ...current.draft[role], [module]: !current.draft[role][module] },
      },
    });
  };

  const handleSave = async () => {
    if (!familyId || !data || !changes.length || isSaving) return;
    setSaveStatus(null);
    setIsSaving(true);
    try {
      await FamilyAdminL2Repository.updateModuleVisibility(familyId, { items: changes });
      setData(current => current === data ? { saved: data.draft, draft: data.draft } : current);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <div className="overflow-hidden rounded-ff">
        <FFPageHeader
          title="Module Access"
          showBack
          rightAction={
            <FFButton
              size="sm"
              variant="accent"
              className="gap-1.5! px-2.5! disabled:bg-white/10 disabled:text-white/60 disabled:opacity-100! sm:px-4!"
              icon={<Save size={16} aria-hidden="true" />}
              aria-label="Save module visibility"
              onClick={() => void handleSave()}
              disabled={!changes.length}
              isLoading={isSaving}
            >
              Save
            </FFButton>
          }
        />
      </div>

      {loadError ? (
        <FFErrorState title="Module visibility unavailable" message={loadError} onRetry={() => setLoadAttempt(attempt => attempt + 1)} />
      ) : !data ? (
        <div aria-label="Loading module visibility" className="space-y-2 rounded-ff border border-primary/10 bg-white p-4">
          {Array.from({ length: 5 }, (_, index) => <FFShimmer key={index} height={48} />)}
        </div>
      ) : (
        <section className="space-y-3" aria-label="Module visibility settings">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs sm:text-sm">
            <p role="status" className={changes.length || saveStatus === 'saved' ? 'font-semibold text-primary' : 'text-slate-600'}>
              {isSaving ? 'Saving changes…' : saveStatus === 'saved' ? 'Changes saved.' : changes.length ? 'Unsaved changes' : 'Select a setting, then save your changes.'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 sm:gap-x-4">
              <span className="inline-flex items-center gap-1.5"><Eye size={16} className="text-success" aria-hidden="true" />Visible</span>
              <span className="inline-flex items-center gap-1.5"><EyeOff size={16} aria-hidden="true" />Hidden</span>
              <span className="inline-flex items-center gap-1.5"><Lock size={15} aria-hidden="true" />Locked</span>
            </div>
          </div>

          {saveStatus === 'error' ? (
            <p role="alert" className="rounded-ff-sm border border-alert/20 bg-alert/5 px-3 py-2 text-sm text-alert">
              Unable to save changes. Your edits are still here. Try saving again.
            </p>
          ) : null}
          <div className="overflow-hidden rounded-ff border border-primary/10 bg-white shadow-card">
            <table className="w-full table-fixed border-collapse">
              <caption className="sr-only">Module visibility by role</caption>
              <colgroup>
                <col />
                {roles.map(role => <col key={role} className="w-11 min-[400px]:w-13 lg:w-20 xl:w-[15%]" />)}
              </colgroup>
              <thead className="border-b border-primary/10 bg-primary/[0.04] text-[11px] text-slate-700 sm:text-sm">
                <tr>
                  <th scope="col" className="px-2 py-3 text-left font-semibold sm:px-5">Module</th>
                  {roles.map(role => <th key={role} scope="col" className="py-3 text-center font-semibold">{roleLabels[role]}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {modules.map(({ name, key, Icon }) => (
                  <tr key={key} className="hover:bg-primary/[0.02]">
                    <th scope="row" className="px-2 py-2 text-left text-xs font-semibold text-primary sm:px-5 sm:text-sm">
                      <span className="flex items-center gap-2.5">
                        <span aria-hidden="true" className="hidden size-8 shrink-0 items-center justify-center rounded-ff-sm bg-primary/5 sm:inline-flex">
                          <Icon size={17} />
                        </span>
                        <span className="min-w-0 wrap-anywhere">{name}</span>
                      </span>
                    </th>
                    {roles.map(role => {
                      const visible = data.draft[role][key];
                      return (
                        <td key={role} className="py-2 text-center">
                          {isLocked(role, key) ? (
                            <span className="inline-flex min-h-11 items-center gap-1.5 px-1 text-slate-500" title="Locked">
                              <Lock size={16} aria-hidden="true" />
                              <span className="sr-only xl:not-sr-only xl:text-xs">Locked</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={isSaving}
                              aria-label={`${name} visibility for ${roleLabels[role]}`}
                              aria-pressed={visible}
                              onClick={() => toggleVisibility(role, key)}
                              className={`inline-flex size-11 items-center justify-center gap-1.5 rounded-ff-sm border-2 border-transparent bg-clip-padding transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent disabled:opacity-60 xl:w-auto xl:px-2.5 ${visible ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                              {visible ? <Eye size={17} aria-hidden="true" /> : <EyeOff size={17} aria-hidden="true" />}
                              <span aria-hidden="true" className="hidden text-xs font-semibold xl:inline">{visible ? 'Visible' : 'Hidden'}</span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default ModuleVisibilityScreen;
