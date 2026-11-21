import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { requireApiData } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';

// ── Level 2 interfaces ────────────────────────────────────────────────────────

export interface MonthlyChildSummaryItem {
  childProfileId: string;
  childName: string;
  attendanceRate: number;
  attendanceDelta: number;
  taskRate: number;
  taskDelta: number;
  feedbackCount: number;
  coinsEarned: number;
  coinsSpent: number;
}

export interface ExpiringDocument {
  documentId: string;
  documentName: string;
  category: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

export interface HealthReminder {
  memberId: string;
  memberName: string;
  reminderType: string;
  description: string;
  dueDate?: string;
}

export interface ReportExport {
  downloadUrl: string;
  expiresAtUtc: string;
  format: 'PDF';
}

export type MonthlyReportExportRequest =
  | { reportType: 'MonthlyFamily'; period: string; format: 'PDF' }
  | { reportType: 'ChildMonthly'; period: string; childId: string; format: 'PDF' };

export interface MonthlyFamilyReport {
  familyId: string;
  familyName: string;
  year: number;
  month: number;
  children: MonthlyChildSummaryItem[];
  totalFeedbackCount: number;
  feedbackResolutionRate: number;
  expiringDocuments: ExpiringDocument[];
  healthReminders: HealthReminder[];
  financeSnapshot: { totalSpend: number; savingsRate: number; topCategory?: string } | null;
  generatedAt: string;
  narrativeHeadline: string;
}

export interface PillarScoreSnapshot {
  month: string;
  studyScore: number;
  cleanlinessScore: number;
  disciplineScore: number;
  screenControlScore: number;
  responsibilityScore: number;
}

export interface ChildMonthlySummary {
  childProfileId: string;
  childName: string;
  year: number;
  month: number;
  attendanceRate: number;
  attendanceSessions: number;
  attendancePresentCount: number;
  attendanceAbsentCount: number;
  taskRate: number;
  taskAssignedCount: number;
  taskApprovedCount: number;
  feedbackCount: number;
  feedbackByType: Record<string, number>;
  coinsEarned: number;
  coinsSpent: number;
  pillarScores: PillarScoreSnapshot[];
  narrativeSummary: string;
}

// ── Existing Level 1 interfaces ───────────────────────────────────────────────

export interface DigestEntry {
  archiveId: string;
  weekStartDate: string;
  weekEndDate: string;
  generatedAt: string;
  familyScore: number;
  childCount: number;
  shareableImageUrl?: string | null;
}

export interface WeeklyDigest {
  familyScore: number;
  previousFamilyScore: number;
  narrative: string;
  childSummaries: {
    childId: string;
    childName: string;
    highlights: string[];
    attendance: string;
    homework: string;
  }[];
  teacherAppreciations: string[];
  upcomingEvents: string[];
}

/** @deprecated Old client-only shape; the API returns AttendanceSummary (see below). Kept for source compatibility. */
export interface AttendanceDay {
  date: string;
  completionRate: number; // 0 to 1
}

/** Heatmap day status — values produced by ReportService.ResolveHeatmapStatus. */
export type AttendanceHeatmapStatus = 'Present' | 'Late' | 'LeftEarly' | 'Absent' | 'NoSession';

export interface AttendanceHeatmapEntry {
  date: string;              // yyyy-mm-dd
  status: AttendanceHeatmapStatus;
  sessionCount: number;
}

/**
 * Mirrors API AttendanceSummaryDto (DTOs/Reports/AttendanceSummaryDto.cs) —
 * GET /families/{familyId}/children/{childId}/reports/attendance-summary?fromDate&toDate (yyyy-mm-dd).
 */
export interface AttendanceSummary {
  childProfileId: string;
  fromDate: string;
  toDate: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leftEarlyCount: number;
  attendanceRate: number;    // 0–100 (Present / total records × 100, 2 dp)
  heatmap: AttendanceHeatmapEntry[];
}

/** The five real pillars (ChildProfile pillar columns). Each score is 0–20. */
export interface PillarScores {
  study: number;
  cleanliness: number;
  discipline: number;
  screenControl: number;
  responsibility: number;
}

/** UI shape of one score-history snapshot. Mapped from API ScoreHistoryDto (DTOs/Family/ScoreHistoryDto.cs). */
export interface ScoreHistoryPoint {
  date: string;
  pillars: PillarScores;
}

/** Raw API ScoreHistoryDto (camelCased). */
interface ScoreHistoryDtoRaw {
  childProfileId: string;
  scoreDate: string;
  studyScore: number;
  cleanlinessScore: number;
  disciplineScore: number;
  screenControlScore: number;
  responsibilityScore: number;
}


export interface ReportLookupOption {
  id: string;
  label: string;
  code: string;
}

const mapLookupItems = (items: MasterDataItem[]): ReportLookupOption[] =>
  items.map((item) => ({
    id: item.id,
    label: item.name,
    code: item.code,
  }));


export const ReportsRepository = {
  getDigestArchive: async (familyId: string): Promise<DigestEntry[]> => {
    const response = await apiClient.get<ApiResponse<{ items: DigestEntry[]; totalCount: number }>>(
      resolvePath(MasterApiReference.Reports.Archive, { familyId }),
      { params: { page: 1, pageSize: 12 } },
    );
    return response.data.data?.items ?? [];
  },

  getWeeklyDigest: async (familyId: string, weekStartDate: string): Promise<WeeklyDigest> => {
    const response = await apiClient.get<ApiResponse<WeeklyDigest>>(
      resolvePath(MasterApiReference.Reports.WeeklyDigest, { familyId }),
      { params: { weekStartDate } },
    );
    return response.data.data as WeeklyDigest;
  },

  /** Family's children for report child pickers — GetMasters 'ChildProfile' (family-scoped from the JWT). */
  getChildren: async (): Promise<ReportLookupOption[]> => {
    return mapLookupItems(await getMasters('ChildProfile'));
  },

  /** fromDate / toDate: yyyy-mm-dd (API binds DateOnly). */
  getAttendanceSummary: async (
    familyId: string,
    childId: string,
    fromDate: string,
    toDate: string,
  ): Promise<AttendanceSummary> => {
    const response = await apiClient.get<ApiResponse<AttendanceSummary>>(
      resolvePath(MasterApiReference.Reports.AttendanceSummary, { familyId, childId }),
      { params: { fromDate, toDate } },
    );
    const data = requireApiData(response.data, 'ReportsRepository.getAttendanceSummary');
    return { ...data, heatmap: data.heatmap ?? [] };
  },

  getScoreHistory: async (familyId: string, childId: string, _periodDays = 30): Promise<ScoreHistoryPoint[]> => {
    // API returns one snapshot per recorded update (no periodDays filter server-side).
    const response = await apiClient.get<ApiResponse<ScoreHistoryDtoRaw[]>>(
      resolvePath(MasterApiReference.Children.ScoreHistory, { familyId, childId }),
    );
    return (response.data.data ?? []).map((s) => ({
      date: s.scoreDate,
      pillars: {
        study: s.studyScore,
        cleanliness: s.cleanlinessScore,
        discipline: s.disciplineScore,
        screenControl: s.screenControlScore,
        responsibility: s.responsibilityScore,
      },
    }));
  },

  updateParentRemark: async (childId: string, remark: string): Promise<void> => {
    await apiClient.put<ApiResponse<null>>(
      resolvePath(MasterApiReference.Children.Update, { childId }),
      { weeklyRemark: remark },
    );
  },

  // ── Level 2 extensions ──────────────────────────────────────────────────────

  exportMonthlyReport: async (familyId: string, request: MonthlyReportExportRequest): Promise<ReportExport> => {
    const response = await apiClient.post<ApiResponse<ReportExport>>(
      resolvePath(MasterApiReference.Reports.Export, { familyId }), request,
    );
    return requireApiData(response.data, 'ReportsRepository.exportMonthlyReport');
  },

  getMonthlyFamilyReport: async (
    familyId: string, year?: number, month?: number,
  ): Promise<MonthlyFamilyReport> => {
    const response = await apiClient.get<ApiResponse<MonthlyFamilyReport>>(resolvePath(MasterApiReference.Reports.MonthlyFamily, { familyId }), {
      params: { year, month },
    });
    return requireApiData(response.data, 'ReportsRepository.getMonthlyFamilyReport');
  },

  getChildMonthlySummary: async (
    familyId: string, childId: string, year?: number, month?: number,
  ): Promise<ChildMonthlySummary> => {
    const response = await apiClient.get<ApiResponse<ChildMonthlySummary>>(
      resolvePath(MasterApiReference.Reports.ChildMonthly, { familyId, childId }),
      { params: { year, month } },
    );
    return requireApiData(response.data, 'ReportsRepository.getChildMonthlySummary');
  },

  getDocumentExpiryReport: async (familyId: string): Promise<ExpiringDocument[]> => {
    const response = await apiClient.get<ApiResponse<ExpiringDocument[]>>(
      resolvePath(MasterApiReference.Reports.DocumentExpiry, { familyId }),
    );
    return response.data.data ?? [];
  },

  getHealthReminderSummary: async (familyId: string): Promise<HealthReminder[]> => {
    const response = await apiClient.get<ApiResponse<HealthReminder[]>>(
      resolvePath(MasterApiReference.Reports.HealthReminders, { familyId }),
    );
    return response.data.data ?? [];
  },

  getCalendarEventTypes: async (): Promise<ReportLookupOption[]> => {

    return mapLookupItems(await getMasters('CalendarEventType'));
  },

  getTaskTypes: async (): Promise<ReportLookupOption[]> => {

    return mapLookupItems(await getMasters('TaskType'));
  },
};
