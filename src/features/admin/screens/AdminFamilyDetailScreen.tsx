import { Users } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApiResource } from '../../../core/hooks/useApiResource';
import FFBadge from '../../../shared/components/FFBadge';
import FFCard from '../../../shared/components/FFCard';
import FFErrorState from '../../../shared/components/FFErrorState';
import FFPageHeader from '../../../shared/components/FFPageHeader';
import FFSectionHeader from '../../../shared/components/FFSectionHeader';
import FFShimmer from '../../../shared/components/FFShimmer';
import { AdminRepository } from '../repositories/AdminRepository';

export default function AdminFamilyDetailScreen() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { data: family, isLoading, error, reload } = useApiResource(
    familyId ? () => AdminRepository.getFamilyDetail(familyId) : null,
    [familyId],
    'Could not load family details. Please try again.',
  );

  return (
    <div className="space-y-5 px-4 py-5 pb-24 page-enter">
      <div className="overflow-hidden rounded-ff">
        <FFPageHeader
          title="Family details"
          showBack
          onBack={() => {
            if (state?.fromFamilies) navigate(-1);
            else navigate('/admin/families', { replace: true });
          }}
        />
      </div>

      {isLoading ? (
        <FFShimmer className="h-40 rounded-ff" />
      ) : error ? (
        <FFErrorState message={error} onRetry={reload} />
      ) : family && (
        <>
          <FFCard className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="min-w-0 break-words font-display text-xl font-bold text-primary">{family.familyName}</h1>
              <FFBadge variant={family.isActive ? 'success' : 'alert'}>{family.isActive ? 'Active family' : 'Flagged family'}</FFBadge>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ['City', family.city || 'Not provided'],
                ['Created', new Date(family.createdAt).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs text-slate-600">{label}</dt>
                  <dd className="break-words text-sm font-semibold text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </FFCard>

          <section className="space-y-3" aria-label="Family members">
            <FFSectionHeader icon={<Users className="h-[18px] w-[18px]" />} title="Family members" />
            <FFCard className="overflow-hidden">
              {family.members.length ? (
                <ul className="divide-y divide-black/5">
                  {family.members.map(member => (
                    <li key={member.memberId} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-primary">{member.fullName}</p>
                        <p className="text-xs text-slate-600">{member.role} · Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                      </div>
                      <FFBadge variant={member.isActive ? 'success' : 'gray'}>{member.isActive ? 'Active' : 'Inactive'}</FFBadge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-sm text-slate-600">No family members found.</p>
              )}
            </FFCard>
          </section>
        </>
      )}
    </div>
  );
}
