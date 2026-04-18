/**
 * Master API Reference - FamilyFirst Platform
 * 
 * This file documents all 103 endpoints across the platform.
 * In the current implementation, these are mapped to Repository methods.
 */

export const MASTER_API_REFERENCE = {
  AUTH: {
    SEND_OTP: '/api/auth/send-otp', // POST: { phone }
    VERIFY_OTP: '/api/auth/verify-otp', // POST: { phone, code }
    CHILD_LOGIN: '/api/auth/child-login', // POST: { username, pin }
    LOGOUT: '/api/auth/logout', // POST
    REFRESH_TOKEN: '/api/auth/refresh', // POST
  },
  FAMILY: {
    CREATE: '/api/family/create', // POST: { name, members }
    GET_DETAILS: '/api/family/:id', // GET
    UPDATE_SETTINGS: '/api/family/:id/settings', // PATCH
    JOIN_REQUEST: '/api/family/join', // POST: { joinCode }
    GENERATE_JOIN_CODE: '/api/family/:id/code', // POST
    GET_MEMBERS: '/api/family/:id/members', // GET
    REMOVE_MEMBER: '/api/family/:id/members/:userId', // DELETE
    UPDATE_MEMBER_ROLE: '/api/family/:id/members/:userId/role', // PATCH
    GET_GOALS: '/api/family/:id/goals', // GET
    UPDATE_GOALS: '/api/family/:id/goals', // POST
  },
  PARENT: {
    GET_DASHBOARD: '/api/parent/dashboard', // GET
    GET_CHILDREN: '/api/parent/children', // GET
    GET_CHILD_DETAIL: '/api/parent/children/:id', // GET
    VERIFY_TASK: '/api/parent/tasks/:id/verify', // POST: { approved, comment }
    GET_VERIFICATION_QUEUE: '/api/parent/verification-queue', // GET
    APPROVE_REWARD: '/api/parent/rewards/:id/approve', // POST
    GET_REWARD_SHOP: '/api/parent/reward-shop', // GET
    UPDATE_ROUTINE: '/api/parent/children/:id/routine', // POST
  },
  CHILD: {
    GET_MY_DAY: '/api/child/my-day', // GET
    SUBMIT_TASK: '/api/child/tasks/:id/submit', // POST: { proofUrl }
    GET_REWARDS: '/api/child/rewards', // GET
    REDEEM_REWARD: '/api/child/rewards/:id/redeem', // POST
    GET_SCORES: '/api/child/scores', // GET
    GET_FAMILY_CIRCLE: '/api/child/family', // GET
  },
  TEACHER: {
    GET_CLASSES: '/api/teacher/classes', // GET
    GET_STUDENTS: '/api/teacher/classes/:id/students', // GET
    MARK_ATTENDANCE: '/api/teacher/attendance', // POST: { date, classId, records }
    SUBMIT_FEEDBACK: '/api/teacher/feedback', // POST: { studentId, type, content }
    GET_FEEDBACK_HISTORY: '/api/teacher/feedback/history', // GET
  },
  ELDER: {
    GET_DASHBOARD: '/api/elder/dashboard', // GET
    SEND_APPRECIATION: '/api/elder/appreciation', // POST: { recipientId, type }
    GET_FAMILY_UPDATES: '/api/elder/updates', // GET
  },
  CALENDAR: {
    GET_EVENTS: '/api/calendar/events', // GET
    CREATE_EVENT: '/api/calendar/events', // POST
    UPDATE_EVENT: '/api/calendar/events/:id', // PATCH
    DELETE_EVENT: '/api/calendar/events/:id', // DELETE
    GET_EVENT_DETAIL: '/api/calendar/events/:id', // GET
  },
  NOTIFICATIONS: {
    GET_HISTORY: '/api/notifications/history', // GET
    UPDATE_PREFERENCES: '/api/notifications/preferences', // PATCH
    REGISTER_FCM_TOKEN: '/api/notifications/fcm-token', // POST
    SEND_CAMPAIGN: '/api/admin/notifications/campaign', // POST (Admin)
  },
  REPORTS: {
    GET_WEEKLY_DIGEST: '/api/reports/weekly', // GET
    GET_ATTENDANCE_SUMMARY: '/api/reports/attendance', // GET
    GET_PERFORMANCE_SCORES: '/api/reports/scores', // GET
  },
  ADMIN: {
    GET_ANALYTICS: '/api/admin/analytics', // GET
    GET_SUPPORT_TICKETS: '/api/admin/support', // GET
    UPDATE_TICKET: '/api/admin/support/:id', // PATCH
    UPDATE_CONTENT: '/api/admin/content', // POST
    GET_PLAN_SETTINGS: '/api/admin/plans', // GET
    UPDATE_APP_CONFIG: '/api/admin/config', // POST
  }
};
