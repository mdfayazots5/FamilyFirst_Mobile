import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

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
  }
};
