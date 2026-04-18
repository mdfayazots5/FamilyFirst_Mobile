# Master API Reference - FamilyFirst

This is the single source of truth for all API integrations in the FamilyFirst application.

## API Status Summary

| Screen Name | API Name | Endpoint | Status | Last Updated |
|-------------|----------|----------|--------|--------------|
| Login | Phone Login | `/api/auth/login` | NOT CONNECTED | 2026-04-12 |
| Login | OTP Verify | `/api/auth/verify` | NOT CONNECTED | 2026-04-12 |
| Parent Home | Dashboard Stats | `/api/parent/stats` | INTEGRATED (MOCK) | 2026-04-12 |
| Child Home | Task List | `/api/child/tasks` | INTEGRATED (MOCK) | 2026-04-12 |
| Admin | Dashboard Stats | `/admin/stats` | INTEGRATED (MOCK) | 2026-04-12 |
| Family Circle | Member List | `/families/:familyId/members` | INTEGRATED (MOCK) | 2026-04-12 |

---

## Detailed Integration Logs

### Screen: Demo Login
- **API Name**: N/A (Mock)
- **Status**: WORKING (Demo Mode)
- **Issue Description**: Currently bypasses real auth for Phase 01.
- **Required Fix**: Integrate real auth in Phase 02.
- **Date**: 2026-04-12

### Screen: Parent Home
- **API Name**: Dashboard Stats
- **Endpoint**: `/families/:familyId/dashboard`
- **Status**: INTEGRATED (MOCK)
- **Issue Description**: UI using `DashboardRepository`. Currently returns mock data in demo mode.
- **Required Fix**: Verify live endpoint `/families/:familyId/dashboard` contract matches mock.
- **Date**: 2026-04-12

### Screen: Child Home
- **API Name**: Task List
- **Endpoint**: `/families/:familyId/members/:memberId/tasks`
- **Status**: INTEGRATED (MOCK)
- **Issue Description**: UI using `TaskCompletionRepository`. Currently returns mock data in demo mode.
- **Required Fix**: Verify live endpoint contract.
- **Date**: 2026-04-12

### Screen: Admin Dashboard
- **API Name**: Dashboard Stats
- **Endpoint**: `/admin/stats`
- **Status**: INTEGRATED (MOCK)
- **Issue Description**: UI using `AdminRepository`. Mock data used in demo mode.
- **Required Fix**: Connect to live admin analytics endpoint.
- **Date**: 2026-04-12

### Screen: Family Circle
- **API Name**: Member List
- **Endpoint**: `/families/:familyId/members`
- **Status**: INTEGRATED (MOCK)
- **Issue Description**: UI using `FamilyRepository`. Mock data used in demo mode.
- **Required Fix**: Verify member object structure with live API.
- **Date**: 2026-04-12
