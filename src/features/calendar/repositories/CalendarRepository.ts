import apiClient from '../../../core/network/apiClient';
import { MasterApiReference, resolvePath } from '../../../core/api/MasterApiReference';
import { AppConfig } from '../../../core/config/appConfig';
import type { ApiResponse, MasterDataItem } from '../../../core/network/apiTypes';
import { getMasters } from '../../../core/repositories/MasterDataRepository';

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

export interface EventTypeOption {
  id: string;
  label: string;
  value: EventType;
}

interface EventReminderDto {
  ReminderId?: string;
  reminderId?: string;
  RemindBeforeMinutes?: number;
  remindBeforeMinutes?: number;
  Channel?: number;
  channel?: number;
}

interface EventDto {
  EventId?: string;
  eventId?: string;
  EventTitle?: string;
  eventTitle?: string;
  EventType?: number | string;
  eventType?: number | string;
  Description?: string | null;
  description?: string | null;
  StartDateTime?: string;
  startDateTime?: string;
  EndDateTime?: string | null;
  endDateTime?: string | null;
  IsAllDay?: boolean;
  isAllDay?: boolean;
  Location?: string | null;
  location?: string | null;
  ColorHex?: string | null;
  colorHex?: string | null;
  IsRecurring?: boolean;
  isRecurring?: boolean;
  RecurrenceRule?: string | null;
  recurrenceRule?: string | null;
  VisibilityScope?: string;
  visibilityScope?: string;
  LinkedChildProfileId?: string | null;
  linkedChildProfileId?: string | null;
  Reminders?: EventReminderDto[];
  reminders?: EventReminderDto[];
}

const DEMO_EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  { id: 'event-doctor', label: 'Doctor Appointment', value: 'DoctorAppointment' },
  { id: 'event-school', label: 'School Event', value: 'SchoolEvent' },
  { id: 'event-tuition', label: 'Tuition', value: 'Tuition' },
  { id: 'event-birthday', label: 'Birthday', value: 'Birthday' },
  { id: 'event-medicine', label: 'Medicine', value: 'Medicine' },
  { id: 'event-exam', label: 'Exam', value: 'Exam' },
  { id: 'event-travel', label: 'Family Travel', value: 'FamilyTravel' },
];

const EVENT_TYPE_TO_ENUM: Record<EventType, number> = {
  DoctorAppointment: 1,
  SchoolEvent: 2,
  Tuition: 3,
  Birthday: 4,
  Medicine: 5,
  Exam: 6,
  FamilyTravel: 7,
};

const EVENT_TYPE_FROM_ENUM: Record<number, EventType> = {
  1: 'DoctorAppointment',
  2: 'SchoolEvent',
  3: 'Tuition',
  4: 'Birthday',
  5: 'Medicine',
  6: 'Exam',
  7: 'FamilyTravel',
  8: 'FamilyTravel',
};

const REMINDER_MINUTES_TO_LABEL: Record<number, string> = {
  5: '5min',
  10: '10min',
  15: '15min',
  30: '30min',
  60: '1hr',
  120: '2hr',
  480: '8hr',
  1440: '1day',
  4320: '3days',
};

const REMINDER_LABEL_TO_MINUTES: Record<string, number> = Object.entries(REMINDER_MINUTES_TO_LABEL).reduce(
  (acc, [minutes, label]) => ({ ...acc, [label]: Number(minutes) }),
  {} as Record<string, number>,
);

const mapEventType = (value: number | string | undefined): EventType => {
  if (typeof value === 'number') {
    return EVENT_TYPE_FROM_ENUM[value] ?? 'FamilyTravel';
  }

  const normalized = (value ?? '').toString().toLowerCase();
  switch (normalized) {
    case 'doctorappointment':
      return 'DoctorAppointment';
    case 'schoolevent':
      return 'SchoolEvent';
    case 'tuition':
    case 'tuitionclass':
      return 'Tuition';
    case 'birthday':
      return 'Birthday';
    case 'medicine':
    case 'medicinereminder':
      return 'Medicine';
    case 'exam':
    case 'examdate':
      return 'Exam';
    case 'familytravel':
    case 'other':
      return 'FamilyTravel';
    default:
      return 'FamilyTravel';
  }
};

const mapReminderDtoToUi = (reminder: EventReminderDto): string => {
  const minutes = reminder.RemindBeforeMinutes ?? reminder.remindBeforeMinutes ?? 60;
  return REMINDER_MINUTES_TO_LABEL[minutes] ?? `${minutes}min`;
};

const mapEventDto = (event: EventDto): CalendarEvent => ({
  id: event.EventId ?? event.eventId ?? '',
  title: event.EventTitle ?? event.eventTitle ?? '',
  type: mapEventType(event.EventType ?? event.eventType),
  startDateTime: event.StartDateTime ?? event.startDateTime ?? '',
  endDateTime: event.EndDateTime ?? event.endDateTime ?? event.StartDateTime ?? event.startDateTime ?? '',
  isAllDay: event.IsAllDay ?? event.isAllDay ?? false,
  visibilityScope: [(event.VisibilityScope ?? event.visibilityScope ?? 'Family') as string],
  isRecurring: event.IsRecurring ?? event.isRecurring ?? false,
  recurrenceRule: event.RecurrenceRule ?? event.recurrenceRule ?? undefined,
  reminders: (event.Reminders ?? event.reminders ?? []).map(mapReminderDtoToUi),
  description: event.Description ?? event.description ?? undefined,
  location: event.Location ?? event.location ?? undefined,
});

const mapMasterDataToEventType = (item: MasterDataItem): EventTypeOption => ({
  id: item.id,
  label: item.name,
  value: mapEventType(item.code),
});

const buildReminderRequests = (reminders: string[]) => {
  const seen = new Set<string>();

  return reminders
    .map((reminder) => REMINDER_LABEL_TO_MINUTES[reminder])
    .filter((minutes): minutes is number => Boolean(minutes))
    .map((minutes) => ({ RemindBeforeMinutes: minutes, Channel: 1 }))
    .filter((reminder) => {
      const key = `${reminder.RemindBeforeMinutes}-${reminder.Channel}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
};

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
    const response = await apiClient.get<ApiResponse<EventDto[]>>(
      resolvePath(MasterApiReference.Calendar.Events, { familyId }),
      { params: { fromDate, toDate } },
    );
    return (response.data.data ?? []).map(mapEventDto);
  },

  getUpcomingEvents: async (familyId: string, days = 7): Promise<CalendarEvent[]> => {
    if (AppConfig.isDemo) {
      const all = await CalendarRepository.getEvents(familyId, '', '');
      return all.slice(0, 4);
    }
    const response = await apiClient.get<ApiResponse<EventDto[]>>(
      resolvePath(MasterApiReference.Calendar.Upcoming, { familyId }),
      { params: { days } },
    );
    return (response.data.data ?? []).map(mapEventDto);
  },

  createEvent: async (familyId: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    if (AppConfig.isDemo) return { id: `e_${Math.random()}`, ...data } as CalendarEvent;
    const response = await apiClient.post<ApiResponse<EventDto>>(
      resolvePath(MasterApiReference.Calendar.Events, { familyId }),
      {
        EventTitle: data.title,
        EventType: EVENT_TYPE_TO_ENUM[data.type ?? 'FamilyTravel'],
        Description: data.description ?? null,
        StartDateTime: data.startDateTime,
        EndDateTime: data.isAllDay ? null : data.endDateTime,
        IsAllDay: data.isAllDay ?? false,
        Location: data.location ?? null,
        VisibilityScope: data.visibilityScope?.[0] ?? 'Family',
        IsRecurring: data.isRecurring ?? false,
        RecurrenceRule: data.isRecurring ? data.recurrenceRule ?? null : null,
        Reminders: buildReminderRequests(data.reminders ?? []),
      },
    );
    return mapEventDto(response.data.data as EventDto);
  },

  updateEvent: async (familyId: string, eventId: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    if (AppConfig.isDemo) return { id: eventId, ...data } as CalendarEvent;
    const response = await apiClient.put<ApiResponse<EventDto>>(
      resolvePath(MasterApiReference.Calendar.Event, { familyId, eventId }),
      {
        EventTitle: data.title,
        EventType: EVENT_TYPE_TO_ENUM[data.type ?? 'FamilyTravel'],
        Description: data.description ?? null,
        StartDateTime: data.startDateTime,
        EndDateTime: data.isAllDay ? null : data.endDateTime,
        IsAllDay: data.isAllDay ?? false,
        Location: data.location ?? null,
        VisibilityScope: data.visibilityScope?.[0] ?? 'Family',
        IsRecurring: data.isRecurring ?? false,
        RecurrenceRule: data.isRecurring ? data.recurrenceRule ?? null : null,
        Reminders: buildReminderRequests(data.reminders ?? []),
      },
    );
    return mapEventDto(response.data.data as EventDto);
  },

  deleteEvent: async (familyId: string, eventId: string): Promise<boolean> => {
    if (AppConfig.isDemo) return true;
    const response = await apiClient.delete<ApiResponse<boolean>>(
      resolvePath(MasterApiReference.Calendar.Event, { familyId, eventId }),
    );
    return response.data.data ?? false;
  },

  getEventTypes: async (): Promise<EventTypeOption[]> => {
    if (AppConfig.isDemo) {
      return DEMO_EVENT_TYPE_OPTIONS;
    }

    return (await getMasters('CalendarEventType')).map(mapMasterDataToEventType);
  },
};
