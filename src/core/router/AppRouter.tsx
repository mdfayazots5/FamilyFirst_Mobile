import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth, UserRole } from '../auth/AuthContext';
import { AppConfig } from '../config/appConfig';
import SplashScreen from '../../features/auth/SplashScreen';
import PhoneLoginScreen from '../../features/auth/PhoneLoginScreen';
import OtpVerifyScreen from '../../features/auth/OtpVerifyScreen';
import ChildLoginScreen from '../../features/auth/ChildLoginScreen';
import AppNavShell from '../../shared/layouts/AppNavShell';

import ParentHomeScreen from '../../features/parent/screens/ParentHomeScreen';
import ChildDetailScreen from '../../features/parent/screens/ChildDetailScreen';
import FamilySetupWizard from '../../features/family/screens/FamilySetupWizard';
import FamilyMembersScreen from '../../features/family/screens/FamilyMembersScreen';
import JoinCodeScreen from '../../features/family/screens/JoinCodeScreen';
import AddMemberScreen from '../../features/family/screens/AddMemberScreen';
import ParentProfileScreen from '../../features/parent/screens/ParentProfileScreen';
import TeacherHomeScreen from '../../features/teacher/screens/TeacherHomeScreen';
import AttendanceMarkingScreen from '../../features/teacher/screens/AttendanceMarkingScreen';
import CreateSessionScreen from '../../features/teacher/screens/CreateSessionScreen';
import TeacherProfileScreen from '../../features/teacher/screens/TeacherProfileScreen';
import FeedbackSubmissionScreen from '../../features/teacher/screens/FeedbackSubmissionScreen';
import FeedbackHistoryScreen from '../../features/teacher/screens/FeedbackHistoryScreen';
import FeedbackInboxScreen from '../../features/parent/screens/FeedbackInboxScreen';
import FeedbackDetailScreen from '../../features/parent/screens/FeedbackDetailScreen';
import RoutineBuilderScreen from '../../features/tasks/screens/RoutineBuilderScreen';
import AddTaskScreen from '../../features/tasks/screens/AddTaskScreen';
import ChildHomeScreen from '../../features/child/screens/ChildHomeScreen';
import TaskDetailScreen from '../../features/child/screens/TaskDetailScreen';
import VerificationQueueScreen from '../../features/parent/screens/VerificationQueueScreen';
import CoinsRewardsScreen from '../../features/child/screens/CoinsRewardsScreen';
import MyScoresScreen from '../../features/child/screens/MyScoresScreen';
import RewardShopScreen from '../../features/parent/screens/RewardShopScreen';
import FamilyCalendarScreen from '../../features/calendar/screens/FamilyCalendarScreen';
import CreateEventScreen from '../../features/calendar/screens/CreateEventScreen';
import EventDetailScreen from '../../features/calendar/screens/EventDetailScreen';
import ChildFamilyScreen from '../../features/child/screens/ChildFamilyScreen';
import FamilyGoalsScreen from '../../features/family/screens/FamilyGoalsScreen';
import FamilyLedgerScreen from '../../features/family/screens/FamilyLedgerScreen';
import ElderHomeScreen from '../../features/elder/screens/ElderHomeScreen';
import ElderSendAppreciationScreen from '../../features/elder/screens/ElderSendAppreciationScreen';
import ElderSettingsScreen from '../../features/elder/screens/ElderSettingsScreen';
import AdminDashboardScreen from '../../features/admin/screens/AdminDashboardScreen';
import FamilyManagementScreen from '../../features/admin/screens/FamilyManagementScreen';
import PlansManagerScreen from '../../features/admin/screens/PlansManagerScreen';
import TaskTemplatesScreen from '../../features/admin/screens/TaskTemplatesScreen';
import RewardCatalogScreen from '../../features/admin/screens/RewardCatalogScreen';
import NotificationCampaignScreen from '../../features/admin/screens/NotificationCampaignScreen';
import AppConfigScreen from '../../features/admin/screens/AppConfigScreen';
import FamilyAdminPanelScreen from '../../features/family_admin/screens/FamilyAdminPanelScreen';
import NotificationHistoryScreen from '../../features/notifications/screens/NotificationHistoryScreen';
import NotificationPreferencesScreen from '../../features/notifications/screens/NotificationPreferencesScreen';
import ProfileScreen from '../../features/profile/screens/ProfileScreen';
import ScoresReportsScreen from '../../features/reports/screens/ScoresReportsScreen';
import WeeklyDigestScreen from '../../features/reports/screens/WeeklyDigestScreen';
import AttendanceSummaryScreen from '../../features/reports/screens/AttendanceSummaryScreen';
import MonthlyReportScreen from '../../features/reports/screens/MonthlyReportScreen';
import ReportArchiveScreen from '../../features/reports/screens/ReportArchiveScreen';
import ChildSettingsScreen from '../../features/child/screens/ChildSettingsScreen';
import ParentSettingsScreen from '../../features/parent/screens/ParentSettingsScreen';
import TeacherSettingsScreen from '../../features/teacher/screens/TeacherSettingsScreen';
import SubscriptionScreen from '../../features/profile/screens/SubscriptionScreen';
import AnalyticsScreen from '../../features/admin/screens/AnalyticsScreen';
import SupportTicketsScreen from '../../features/admin/screens/SupportTicketsScreen';
import ContentManagerScreen from '../../features/admin/screens/ContentManagerScreen';
import ModuleVisibilityScreen from '../../features/family_admin/screens/ModuleVisibilityScreen';
import NotificationRulesScreen from '../../features/family_admin/screens/NotificationRulesScreen';
import StorageConfigScreen from '../../features/family_admin/screens/StorageConfigScreen';
import SafetyAlertThresholdsScreen from '../../features/family_admin/screens/SafetyAlertThresholdsScreen';
import EmergencyAccessRulesScreen from '../../features/family_admin/screens/EmergencyAccessRulesScreen';
import FinancePrivacyScreen from '../../features/family_admin/screens/FinancePrivacyScreen';
import VaultHomeScreen from '../../features/vault/screens/VaultHomeScreen';
import CategoryViewScreen from '../../features/vault/screens/CategoryViewScreen';
import DocumentUploadScreen from '../../features/vault/screens/DocumentUploadScreen';
import DocumentDetailScreen from '../../features/vault/screens/DocumentDetailScreen';
import DocumentSearchScreen from '../../features/vault/screens/DocumentSearchScreen';
import ExpiryDashboardScreen from '../../features/vault/screens/ExpiryDashboardScreen';
import EmergencyFolderScreen from '../../features/vault/screens/EmergencyFolderScreen';
import ShareDocumentViewScreen from '../../features/vault/screens/ShareDocumentViewScreen';
import HealthHomeScreen from '../../features/medical/screens/HealthHomeScreen';
import MemberHealthProfileScreen from '../../features/medical/screens/MemberHealthProfileScreen';
import EditHealthProfileScreen from '../../features/medical/screens/EditHealthProfileScreen';
import EmergencyCardScreen from '../../features/medical/screens/EmergencyCardScreen';
import VaccinationTrackerScreen from '../../features/medical/screens/VaccinationTrackerScreen';
import SafetyHomeScreen from '../../features/safety/screens/SafetyHomeScreen';
import FamilyMapScreen from '../../features/safety/screens/FamilyMapScreen';
import SafeZoneManagerScreen from '../../features/safety/screens/SafeZoneManagerScreen';
import AddEditSafeZoneScreen from '../../features/safety/screens/AddEditSafeZoneScreen';
import LocationAlertHistoryScreen from '../../features/safety/screens/LocationAlertHistoryScreen';
import SosAlertScreen from '../../features/safety/screens/SosAlertScreen';
import EmergencyButtonScreen from '../../features/safety/screens/EmergencyButtonScreen';
import LocationSettingsScreen from '../../features/safety/screens/LocationSettingsScreen';
import FinanceDashboardScreen from '../../features/finance/screens/FinanceDashboardScreen';
import BudgetManagerScreen from '../../features/finance/screens/BudgetManagerScreen';
import FinanceSettingsScreen from '../../features/finance/screens/FinanceSettingsScreen';

const EmergencyCardPublicRoute: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  return <EmergencyCardScreen shareToken={token} />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles
}) => {
  const { isAuthenticated, isAuthReady, user } = useAuth();

  if (!isAuthReady) return <SplashScreen />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const ProfileRoute: React.FC = () => {
  const { user } = useAuth();
  return user?.role === UserRole.TEACHER ? <TeacherProfileScreen /> : <ParentProfileScreen />;
};

// Reads auth context directly so it always has the live user value,
// regardless of when the parent AppRouter last rendered.
const RoleRedirect: React.FC = () => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) return <SplashScreen />;

  switch (user?.role) {
    case UserRole.SUPER_ADMIN:   return <Navigate to="/admin" replace />;
    case UserRole.FAMILY_ADMIN:  return <Navigate to="/parent/admin" replace />;
    case UserRole.PARENT:        return <Navigate to="/parent" replace />;
    case UserRole.CHILD:         return <Navigate to="/child" replace />;
    case UserRole.TEACHER:       return <Navigate to="/teacher" replace />;
    case UserRole.ELDER:         return <Navigate to="/elder" replace />;
    default:                     return <Navigate to="/login" replace />;
  }
};

const AppRouter: React.FC = () => {
  const { isAuthReady } = useAuth();

  if (!isAuthReady) return <SplashScreen />;

  return (
    <Routes>
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/login" element={<PhoneLoginScreen />} />
      <Route path="/otp-verify" element={<OtpVerifyScreen />} />
      <Route path="/child-login" element={<ChildLoginScreen />} />

      <Route path="/family-setup" element={<FamilySetupWizard />} />

      {/* Main App Shell */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppNavShell />
        </ProtectedRoute>
      }>
        <Route index element={<RoleRedirect />} />
        
        {/* Role Dashboards */}
        <Route path="parent" element={<ParentHomeScreen />} />
        <Route path="teacher" element={<TeacherHomeScreen />} />
        <Route path="child" element={<ChildHomeScreen />} />
        <Route path="elder" element={<ElderHomeScreen />} />
        <Route path="admin" element={<AdminDashboardScreen />} />
        
        {/* Family & Profile Routes */}
        <Route path="parent/members" element={<FamilyMembersScreen />} />
        <Route path="parent/add-member" element={<AddMemberScreen />} />
        <Route path="parent/join-code" element={<JoinCodeScreen />} />
        <Route path="parent/children/:childId" element={<ChildDetailScreen />} />
        
        <Route path="profile" element={<ProfileRoute />} />
        
        {/* Teacher Specific Routes */}
        <Route path="teacher/attendance/:sessionId" element={<AttendanceMarkingScreen />} />
        <Route path="teacher/create-session" element={<CreateSessionScreen />} />
        <Route path="teacher/feedback/new" element={<FeedbackSubmissionScreen />} />
        <Route path="teacher/feedback/history" element={<FeedbackHistoryScreen />} />
        
        {/* Parent Feedback Routes */}
        <Route path="parent/feedback" element={<FeedbackInboxScreen />} />
        <Route path="parent/feedback/:feedbackId" element={<FeedbackDetailScreen />} />
        
        {/* Task & Routine Routes */}
        <Route path="parent/routine/:childId" element={<RoutineBuilderScreen />} />
        <Route path="parent/routine/:childId/add" element={<AddTaskScreen />} />
        <Route path="parent/routine/:childId/edit/:taskId" element={<AddTaskScreen />} />
        <Route path="parent/verification" element={<VerificationQueueScreen />} />
        <Route path="parent/rewards" element={<RewardShopScreen />} />
        <Route path="parent/goals" element={<FamilyGoalsScreen />} />
        <Route path="parent/ledger" element={<FamilyLedgerScreen />} />
        <Route path="parent/admin" element={<FamilyAdminPanelScreen />} />
        
        {/* Calendar Routes */}
        <Route path="calendar" element={<FamilyCalendarScreen />} />
        <Route path="calendar/create" element={<CreateEventScreen />} />
        <Route path="calendar/edit/:eventId" element={<CreateEventScreen />} />
        <Route path="calendar/event/:eventId" element={<EventDetailScreen />} />
        
        {/* Child Specific Routes */}
        <Route path="child/tasks/:completionId" element={<TaskDetailScreen />} />
        <Route path="child/coins" element={<CoinsRewardsScreen />} />
        <Route path="child/scores" element={<MyScoresScreen />} />
        <Route path="child/family" element={<ChildFamilyScreen />} />
        <Route path="child/settings" element={<ChildSettingsScreen />} />

        {/* Elder Specific Routes */}
        <Route path="elder/appreciate/:childId" element={<ElderSendAppreciationScreen />} />
        <Route path="elder/settings" element={<ElderSettingsScreen />} />

        {/* Super Admin Specific Routes */}
        <Route path="admin/families" element={<FamilyManagementScreen />} />
        {AppConfig.features.subscriptionEnabled && <Route path="admin/plans" element={<PlansManagerScreen />} />}
        <Route path="admin/task-templates" element={<TaskTemplatesScreen />} />
        <Route path="admin/reward-catalog" element={<RewardCatalogScreen />} />
        <Route path="admin/campaigns" element={<NotificationCampaignScreen />} />
        <Route path="admin/config" element={<AppConfigScreen />} />
        <Route path="admin/analytics" element={<AnalyticsScreen />} />
        <Route path="admin/support" element={<SupportTicketsScreen />} />
        <Route path="admin/content" element={<ContentManagerScreen />} />

        {/* Family Admin Routes */}
        <Route path="family-admin/modules" element={<ModuleVisibilityScreen />} />
        <Route path="family-admin/notifications" element={<NotificationRulesScreen />} />
        <Route path="family-admin/storage" element={<StorageConfigScreen />} />
        <Route path="family-admin/alert-thresholds" element={<SafetyAlertThresholdsScreen />} />
        <Route path="family-admin/emergency-access" element={<EmergencyAccessRulesScreen />} />
        <Route path="family-admin/finance-privacy" element={<FinancePrivacyScreen />} />

        {/* Notification Routes */}
        <Route path="notifications" element={<NotificationHistoryScreen />} />
        <Route path="notifications/preferences" element={<NotificationPreferencesScreen />} />
        
        {/* Document Vault Routes */}
        {AppConfig.features.documentVault && (
          <>
            <Route path="vault" element={<VaultHomeScreen />} />
            <Route path="vault/search" element={<DocumentSearchScreen />} />
            <Route path="vault/upload" element={<DocumentUploadScreen />} />
            <Route path="vault/expiry" element={<ExpiryDashboardScreen />} />
            <Route path="vault/emergency" element={<EmergencyFolderScreen />} />
            <Route path="vault/category/:categoryId" element={<CategoryViewScreen />} />
            <Route path="vault/:documentId" element={<DocumentDetailScreen />} />
          </>
        )}

        {/* Public share link — no auth required, renders specific shared document */}
        <Route path="vault/share/:token" element={<ShareDocumentViewScreen />} />

        {/* Medical & Health Records Routes */}
        {AppConfig.features.medicalRecords && (
          <>
            <Route path="medical" element={<HealthHomeScreen />} />
            <Route path="medical/:memberId" element={<MemberHealthProfileScreen />} />
            <Route path="medical/:memberId/edit" element={<EditHealthProfileScreen />} />
            <Route path="medical/:memberId/emergency-card" element={<EmergencyCardScreen />} />
            <Route path="medical/:memberId/vaccinations" element={<VaccinationTrackerScreen />} />
          </>
        )}

        {/* Public emergency card link — no auth required */}
        <Route path="medical/emergency-card/:token" element={<EmergencyCardPublicRoute />} />

        {/* Safety & Location Routes */}
        {AppConfig.features.safetyLocation && (
          <>
            <Route path="safety" element={<SafetyHomeScreen />} />
            <Route path="safety/map" element={<FamilyMapScreen />} />
            <Route path="safety/zones" element={<SafeZoneManagerScreen />} />
            <Route path="safety/zones/add" element={<AddEditSafeZoneScreen />} />
            <Route path="safety/zones/edit/:zoneId" element={<AddEditSafeZoneScreen />} />
            <Route path="safety/alerts" element={<LocationAlertHistoryScreen />} />
            <Route path="safety/sos-alert" element={<SosAlertScreen />} />
            <Route path="safety/settings" element={<LocationSettingsScreen />} />
            <Route path="safety/emergency" element={<EmergencyButtonScreen />} />
          </>
        )}

        {/* Report Routes */}
        <Route path="reports" element={<ScoresReportsScreen />} />
        <Route path="reports/weekly" element={<WeeklyDigestScreen />} />
        <Route path="reports/attendance" element={<AttendanceSummaryScreen />} />
        <Route path="reports/monthly" element={<MonthlyReportScreen />} />
        <Route path="reports/archive" element={<ReportArchiveScreen />} />

        {/* Finance & SMS Ledger Routes */}
        {AppConfig.features.financeTracker && (
          <>
            <Route path="finance" element={<FinanceDashboardScreen />} />
            <Route path="finance/transactions" element={<FinanceDashboardScreen />} />
            <Route path="finance/categories" element={<FinanceDashboardScreen />} />
            <Route path="finance/budget" element={<BudgetManagerScreen />} />
            <Route path="finance/commitments" element={<FinanceDashboardScreen />} />
            <Route path="finance/settings" element={<FinanceSettingsScreen />} />
          </>
        )}
        
        {/* Settings & Profile Routes */}
        <Route path="parent/settings" element={<ParentSettingsScreen />} />
        <Route path="teacher/settings" element={<TeacherSettingsScreen />} />
        {AppConfig.features.subscriptionEnabled && <Route path="profile/subscription" element={<SubscriptionScreen />} />}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
