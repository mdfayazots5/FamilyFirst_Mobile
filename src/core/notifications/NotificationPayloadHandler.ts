import { useNavigate } from 'react-router-dom';

export enum NotificationType {
  Attendance = 'Attendance',
  Feedback = 'Feedback',
  TaskVerification = 'TaskVerification',
  RewardRedemption = 'RewardRedemption',
  RewardApproved = 'RewardApproved',
  Birthday = 'Birthday',
  Appreciation = 'Appreciation',
  UrgentFeedback = 'UrgentFeedback',
  WeeklyDigest = 'WeeklyDigest',
  SOS = 'SOS',
}

export interface NotificationPayload {
  type: NotificationType;
  referenceId?: string;
  childId?: string;
  memberName?: string;
  rewardName?: string;
  weekStartDate?: string;
  timestamp?: string;
}

export const useNotificationNavigation = () => {
  const navigate = useNavigate();

  const handleNotificationTap = (payload: NotificationPayload) => {
    console.log('Handling notification tap:', payload);

    switch (payload.type) {
      case NotificationType.Attendance:
        if (payload.childId) {
          navigate(`/parent/children/${payload.childId}`);
        }
        break;
      case NotificationType.Feedback:
      case NotificationType.UrgentFeedback:
        if (payload.referenceId) {
          navigate(`/parent/feedback/${payload.referenceId}`);
        }
        break;
      case NotificationType.TaskVerification:
        navigate('/parent/verification-queue');
        break;
      case NotificationType.RewardRedemption:
        navigate('/parent/reward-shop');
        break;
      case NotificationType.RewardApproved:
        navigate('/child/coins');
        break;
      case NotificationType.Birthday:
        navigate('/parent/calendar');
        break;
      case NotificationType.Appreciation:
        navigate('/child/family');
        break;
      case NotificationType.WeeklyDigest:
        navigate('/reports/weekly');
        break;
      case NotificationType.SOS:
        navigate('/parent/safety');
        break;
      default:
        console.warn('Unknown notification type:', payload.type);
    }
  };

  return { handleNotificationTap };
};
