import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

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

// ── Level 2 demo data ─────────────────────────────────────────────────────────

const now = new Date();
const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

const DEMO_MONTHLY_REPORT: MonthlyFamilyReport = {
  familyId: 'f1',
  familyName: 'Sharma Family',
  year: prevMonth.getFullYear(),
  month: prevMonth.getMonth() + 1,
  children: [
    {
      childProfileId: 'c1', childName: 'Arjun',
      attendanceRate: 92, attendanceDelta: 4,
      taskRate: 85, taskDelta: 7,
      feedbackCount: 3, coinsEarned: 120, coinsSpent: 40,
    },
    {
      childProfileId: 'c2', childName: 'Zara',
      attendanceRate: 78, attendanceDelta: -2,
      taskRate: 70, taskDelta: 5,
      feedbackCount: 2, coinsEarned: 80, coinsSpent: 20,
    },
  ],
  totalFeedbackCount: 5,
  feedbackResolutionRate: 0.8,
  expiringDocuments: [
    { documentId: 'd1', documentName: 'Arjun — School ID Card', category: 'Identity', expiryDate: new Date(now.getTime() + 12 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 12 },
    { documentId: 'd2', documentName: 'Home Insurance', category: 'Insurance', expiryDate: new Date(now.getTime() + 25 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 25 },
  ],
  healthReminders: [
    { memberId: 'm1', memberName: 'Arjun', reminderType: 'Vaccination', description: 'MMR Booster', dueDate: new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0] },
  ],
  financeSnapshot: null,
  generatedAt: new Date().toISOString(),
  narrativeHeadline: 'Arjun had an outstanding month — 92% attendance!',
};

const DEMO_CHILD_MONTHLY: ChildMonthlySummary = {
  childProfileId: 'c1',
  childName: 'Arjun',
  year: prevMonth.getFullYear(),
  month: prevMonth.getMonth() + 1,
  attendanceRate: 92,
  attendanceSessions: 22,
  attendancePresentCount: 20,
  attendanceAbsentCount: 2,
  taskRate: 85,
  taskAssignedCount: 20,
  taskApprovedCount: 17,
  feedbackCount: 3,
  feedbackByType: { Appreciation: 2, Observation: 1 },
  coinsEarned: 120,
  coinsSpent: 40,
  pillarScores: [
    { month: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0], studyScore: 12, cleanlinessScore: 10, disciplineScore: 11, screenControlScore: 9, responsibilityScore: 10 },
    { month: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0], studyScore: 14, cleanlinessScore: 12, disciplineScore: 13, screenControlScore: 11, responsibilityScore: 12 },
    { month: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], studyScore: 16, cleanlinessScore: 14, disciplineScore: 15, screenControlScore: 13, responsibilityScore: 14 },
  ],
  narrativeSummary: 'Arjun had excellent attendance this month, completed tasks consistently, earned 120 coins, and their Study pillar is at its highest level.',
};

const DEMO_EXPIRING_DOCS: ExpiringDocument[] = [
  { documentId: 'd1', documentName: 'Arjun — School ID Card', category: 'Identity', expiryDate: new Date(now.getTime() + 12 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 12 },
  { documentId: 'd2', documentName: 'Home Insurance', category: 'Insurance', expiryDate: new Date(now.getTime() + 25 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 25 },
  { documentId: 'd3', documentName: 'Zara — Medical Certificate', category: 'Medical', expiryDate: new Date(now.getTime() + 45 * 86400000).toISOString().split('T')[0], daysUntilExpiry: 45 },
];

const DEMO_HEALTH_REMINDERS: HealthReminder[] = [
  { memberId: 'm1', memberName: 'Arjun', reminderType: 'Vaccination', description: 'MMR Booster', dueDate: new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0] },
  { memberId: 'm2', memberName: 'Zara', reminderType: 'Prescription', description: 'Vitamin D — refill due soon' },
];

// ── Existing Level 1 interfaces ───────────────────────────────────────────────

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

export interface AttendanceDay {
  date: string;
  completionRate: number; // 0 to 1
}

export interface ScoreHistoryPoint {
  date: string;
  pillars: {
    discipline: number;
    learning: number;
    contribution: number;
    health: number;
    social: number;
  };
}

export const ReportsRepository = {
  getWeeklyDigest: async (familyId: string, weekStartDate: string): Promise<WeeklyDigest> => {
    if (AppConfig.isDemo) {
      return {
        familyScore: 84,
        previousFamilyScore: 77,
        narrative: "The Sharma family had a stellar week! Engagement is up across the board, especially in the 'Contribution' pillar.",
        childSummaries: [
          {
            childId: 'c1',
            childName: 'Arjun',
            highlights: ['Personal best attendance week!', 'Completed all Math assignments early.'],
            attendance: '5/5',
            homework: '4/5'
          },
          {
            childId: 'c2',
            childName: 'Zara',
            highlights: ['Great improvement in room cleaning.', 'Helped Dadi with her garden.'],
            attendance: '4/5',
            homework: '3/5'
          }
        ],
        teacherAppreciations: ['Mr. Ahmed: Arjun was very helpful in class today.'],
        upcomingEvents: ['Exam on Friday', 'LIC Premium Due']
      };
    }
    const response = await apiClient.get(`/families/${familyId}/reports/weekly-digest`, { params: { weekStartDate } });
    return response.data;
  },

  getAttendanceSummary: async (childId: string, fromDate: string, toDate: string): Promise<AttendanceDay[]> => {
    if (AppConfig.isDemo) {
      const days: AttendanceDay[] = [];
      const start = new Date(fromDate);
      const end = new Date(toDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push({
          date: d.toISOString().split('T')[0],
          completionRate: Math.random()
        });
      }
      return days;
    }
    const response = await apiClient.get(`/children/${childId}/reports/attendance-summary`, { params: { fromDate, toDate } });
    return response.data;
  },

  getScoreHistory: async (childId: string, periodDays = 30): Promise<ScoreHistoryPoint[]> => {
    if (AppConfig.isDemo) {
      const history: ScoreHistoryPoint[] = [];
      const now = new Date();
      for (let i = periodDays; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        history.push({
          date: d.toISOString().split('T')[0],
          pillars: {
            discipline: 60 + Math.random() * 30,
            learning: 50 + Math.random() * 40,
            contribution: 40 + Math.random() * 50,
            health: 70 + Math.random() * 20,
            social: 55 + Math.random() * 35,
          }
        });
      }
      return history;
    }
    const response = await apiClient.get(`/children/${childId}/score-history`, { params: { periodDays } });
    return response.data;
  },

  updateParentRemark: async (childId: string, remark: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.put(`/children/${childId}`, { weeklyRemark: remark });
  },

  // ── Level 2 extensions ──────────────────────────────────────────────────────

  getMonthlyFamilyReport: async (
    familyId: string, year?: number, month?: number,
  ): Promise<MonthlyFamilyReport> => {
    if (AppConfig.isDemo) return DEMO_MONTHLY_REPORT;
    const response = await apiClient.get(`/families/${familyId}/reports/monthly`, {
      params: { year, month },
    });
    return response.data.data;
  },

  getChildMonthlySummary: async (
    familyId: string, childId: string, year?: number, month?: number,
  ): Promise<ChildMonthlySummary> => {
    if (AppConfig.isDemo) return DEMO_CHILD_MONTHLY;
    const response = await apiClient.get(
      `/families/${familyId}/children/${childId}/reports/monthly`,
      { params: { year, month } },
    );
    return response.data.data;
  },

  getDocumentExpiryReport: async (familyId: string): Promise<ExpiringDocument[]> => {
    if (AppConfig.isDemo) return DEMO_EXPIRING_DOCS;
    const response = await apiClient.get(`/families/${familyId}/reports/documents/expiry`);
    return response.data.data;
  },

  getHealthReminderSummary: async (familyId: string): Promise<HealthReminder[]> => {
    if (AppConfig.isDemo) return DEMO_HEALTH_REMINDERS;
    const response = await apiClient.get(`/families/${familyId}/reports/health/reminders`);
    return response.data.data;
  },
};
