import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

export interface TaskCompletion {
  id: string;
  title: string;
  status: 'done' | 'pending' | 'missed' | 'flagged';
  time: string;
  photoUrl?: string;
  category: string;
}

export interface Feedback {
  id: string;
  teacherName: string;
  type: 'Appreciation' | 'Complaint' | 'Observation';
  message: string;
  date: string;
  isRead: boolean;
}

export interface ChildDetail {
  id: string;
  name: string;
  avatarUrl: string;
  todayScore: number;
  streak: number;
  radarData: {
    subject: string;
    score: number;
    fullMark: number;
  }[];
}

export const ChildRepository = {
  getChildDetail: async (familyId: string, childId: string): Promise<ChildDetail> => {
    if (AppConfig.isDemo) {
      return {
        id: childId,
        name: 'Arjun',
        avatarUrl: 'avatar_01',
        todayScore: 82,
        streak: 8,
        radarData: [
          { subject: 'Study', score: 17, fullMark: 20 },
          { subject: 'Clean', score: 14, fullMark: 20 },
          { subject: 'Disc', score: 16, fullMark: 20 },
          { subject: 'Screen', score: 12, fullMark: 20 },
          { subject: 'Resp', score: 18, fullMark: 20 },
        ]
      };
    }
    const response = await apiClient.get(`/families/${familyId}/children/${childId}`);
    return response.data;
  },

  getTaskCompletions: async (familyId: string, childId: string): Promise<TaskCompletion[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: '1', title: 'Morning Prayer', status: 'done', time: '06:30 AM', category: 'Spirituality' },
        { id: '2', title: 'Make Bed', status: 'done', time: '07:00 AM', category: 'Responsibility' },
        { id: '3', title: 'Brush Teeth', status: 'done', time: '07:15 AM', category: 'Hygiene' },
        { id: '4', title: 'School Homework', status: 'pending', time: '04:00 PM', category: 'Study', photoUrl: 'https://picsum.photos/seed/homework/400/300' },
        { id: '5', title: 'Reading 20 mins', status: 'pending', time: '05:00 PM', category: 'Study', photoUrl: 'https://picsum.photos/seed/reading/400/300' },
        { id: '6', title: 'Clean Room', status: 'missed', time: '08:00 PM', category: 'Cleanliness' },
      ];
    }
    const response = await apiClient.get(`/families/${familyId}/tasks/completions`, { params: { childId, date: 'today' } });
    return response.data;
  },

  getFeedback: async (familyId: string, childId: string): Promise<Feedback[]> => {
    if (AppConfig.isDemo) {
      return [
        { id: '1', teacherName: 'Mr. Sharma', type: 'Appreciation', message: 'Arjun was very helpful in class today.', date: '2024-04-10', isRead: true },
        { id: '2', teacherName: 'Ms. Gupta', type: 'Complaint', message: 'Arjun missed his math assignment.', date: '2024-04-09', isRead: false },
        { id: '3', teacherName: 'Mr. Khan', type: 'Observation', message: 'Arjun seems a bit distracted lately.', date: '2024-04-08', isRead: true },
      ];
    }
    const response = await apiClient.get(`/families/${familyId}/feedback`, { params: { childId, page: 1, pageSize: 20 } });
    return response.data;
  },

  reviewTask: async (taskId: string, status: 'done' | 'flagged', note?: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.put(`/tasks/completions/${taskId}/review`, { status, reviewNote: note });
  },

  acknowledgeFeedback: async (feedbackId: string, responseText: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.post(`/feedback/${feedbackId}/acknowledge`, { parentResponseText: responseText });
  },

  deductCoins: async (childId: string, amount: number, note: string): Promise<void> => {
    if (AppConfig.isDemo) return;
    await apiClient.post(`/children/${childId}/coin-deduction`, { amount, note });
  }
};
