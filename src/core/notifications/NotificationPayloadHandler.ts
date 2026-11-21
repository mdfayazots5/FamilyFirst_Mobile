import { useDeepLinkHandler } from '../router/DeepLinkHandler';

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
  const { handleDeepLink: navigate } = useDeepLinkHandler();

  const handleNotificationTap = (payload: NotificationPayload) => {
    switch (payload.type) {
      case NotificationType.Attendance:
        if (payload.childId) {
          navigate(`/parent/children/${encodeURIComponent(payload.childId)}`);
        }
        break;
      case NotificationType.Feedback:
      case NotificationType.UrgentFeedback:
        if (payload.referenceId) {
          navigate(`/parent/feedback/${encodeURIComponent(payload.referenceId)}`);
        }
        break;
      case NotificationType.TaskVerification:
        navigate('/parent/verification');
        break;
      case NotificationType.RewardRedemption:
        navigate('/parent/rewards');
        break;
      case NotificationType.RewardApproved:
        navigate('/child/coins');
        break;
      case NotificationType.Birthday:
        navigate('/calendar');
        break;
      case NotificationType.Appreciation:
        navigate('/child/family');
        break;
      case NotificationType.WeeklyDigest:
        navigate('/reports/weekly');
        break;
      case NotificationType.SOS:
        navigate('/safety');
        break;
    }
  };

  return { handleNotificationTap };
};
