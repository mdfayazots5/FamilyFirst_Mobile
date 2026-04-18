import apiClient from '../../../core/network/apiClient';
import { AppConfig } from '../../../core/config/appConfig';

export type EventType = 
  | 'DoctorAppointment' 
  | 'SchoolEvent' 
  | 'Tuition' 
  | 'Birthday' 
  | 'Medicine' 
  | 'Exam' 
  | 'FamilyTravel';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  visibilityScope: string[]; // ['Family', 'Parent', 'Child', 'Elder']
  isRecurring: boolean;
  recurrenceRule?: string;
  reminders: string[]; // ['5min', '1hr', etc]
  description?: string;
  location?: string;
}

export const CalendarRepository = {
  getEvents: async (familyId: string, fromDate: string, toDate: string): Promise<CalendarEvent[]> => {
    if (AppConfig.isDemo) {
      const today = new Date();
      const formatDate = (days: number, hours = 10) => {
        const d = new Date(today);
        d.setDate(d.getDate() + days);
        d.setHours(hours, 0, 0, 0);
        return d.toISOString();
      };

      return [
        {
          id: 'e1',
          title: 'Doctor Appointment',
          type: 'DoctorAppointment',
          startDateTime: formatDate(1, 9),
          endDateTime: formatDate(1, 10),
          isAllDay: false,
          visibilityScope: ['Family', 'Parent'],
          isRecurring: false,
          reminders: ['1hr', '1day'],
          description: 'Regular checkup for Arjun'
        },
        {
          id: 'e2',
          title: 'Math Tuition',
          type: 'Tuition',
          startDateTime: formatDate(2, 16),
          endDateTime: formatDate(2, 18),
          isAllDay: false,
          visibilityScope: ['Family', 'Parent', 'Child'],
          isRecurring: true,
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU,TH',
          reminders: ['30min']
        },
        {
          id: 'e3',
          title: 'Zara Science Exam',
          type: 'Exam',
          startDateTime: formatDate(3, 8),
          endDateTime: formatDate(3, 11),
          isAllDay: false,
          visibilityScope: ['Family', 'Parent', 'Child'],
          isRecurring: false,
          reminders: ['1day']
        },
        {
          id: 'e4',
          title: 'Arjun Birthday',
          type: 'Birthday',
          startDateTime: formatDate(5, 0),
          endDateTime: formatDate(5, 23),
          isAllDay: true,
          visibilityScope: ['Family', 'Parent', 'Child', 'Elder'],
          isRecurring: false,
          reminders: ['1day']
        },
        {
          id: 'e5',
          title: 'Family Outing',
          type: 'FamilyTravel',
          startDateTime: formatDate(7, 10),
          endDateTime: formatDate(8, 18),
          isAllDay: false,
          visibilityScope: ['Family', 'Parent', 'Child', 'Elder'],
          isRecurring: false,
          reminders: ['1day']
        },
        {
          id: 'e6',
          title: 'Morning Medicine',
          type: 'Medicine',
          startDateTime: formatDate(0, 8),
          endDateTime: formatDate(0, 8),
          isAllDay: false,
          visibilityScope: ['Family', 'Parent', 'Elder'],
          isRecurring: true,
          recurrenceRule: 'FREQ=DAILY',
          reminders: ['5min']
        },
        {
          id: 'e7',
          title: 'School Annual Day',
          type: 'SchoolEvent',
          startDateTime: formatDate(10, 9),
          endDateTime: formatDate(10, 15),
          isAllDay: false,
          visibilityScope: ['Family', 'Parent', 'Child'],
          isRecurring: false,
          reminders: ['1day']
        },
        {
          id: 'e8',
          title: 'Piano Class',
          type: 'Tuition',
          startDateTime: formatDate(-1, 17),
          endDateTime: formatDate(-1, 18),
          isAllDay: false,
          visibilityScope: ['Family', 'Parent', 'Child'],
          isRecurring: true,
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR',
          reminders: ['30min']
        }
      ];
    }
    const response = await apiClient.get(`/families/${familyId}/calendar/events`, { params: { fromDate, toDate } });
    return response.data;
  },

  getUpcomingEvents: async (familyId: string, days = 7): Promise<CalendarEvent[]> => {
    if (AppConfig.isDemo) {
      const all = await CalendarRepository.getEvents(familyId, '', '');
      return all.slice(0, 4);
    }
    const response = await apiClient.get(`/families/${familyId}/calendar/upcoming`, { params: { days } });
    return response.data;
  },

  createEvent: async (familyId: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    if (AppConfig.isDemo) return { id: `e_${Math.random()}`, ...data } as CalendarEvent;
    const response = await apiClient.post(`/families/${familyId}/calendar/events`, data);
    return response.data;
  },

  updateEvent: async (familyId: string, eventId: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    if (AppConfig.isDemo) return { id: eventId, ...data } as CalendarEvent;
    const response = await apiClient.put(`/families/${familyId}/calendar/events/${eventId}`, data);
    return response.data;
  },

  deleteEvent: async (familyId: string, eventId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.delete(`/families/${familyId}/calendar/events/${eventId}`);
    return response.data;
  }
};
