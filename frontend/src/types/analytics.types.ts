export enum EventType {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  VIEW_CLASSROOM = "VIEW_CLASSROOM",
  VIEW_QUIZ = "VIEW_QUIZ",
  START_QUIZ = "START_QUIZ",
  SUBMIT_QUIZ = "SUBMIT_QUIZ",
  CREATE_QUIZ = "CREATE_QUIZ",
  VIEW_MATERIAL = "VIEW_MATERIAL",
  DOWNLOAD_MATERIAL = "DOWNLOAD_MATERIAL",
  CREATE_MATERIAL = "CREATE_MATERIAL",
  JOIN_CLASSROOM = "JOIN_CLASSROOM",
  CREATE_CLASSROOM = "CREATE_CLASSROOM",
  OTHER = "OTHER",
}

export enum ReportType {
  QUIZ_PERFORMANCE = "QUIZ_PERFORMANCE",
  STUDENT_ENGAGEMENT = "STUDENT_ENGAGEMENT",
  CLASSROOM_ACTIVITY = "CLASSROOM_ACTIVITY",
  MATERIAL_USAGE = "MATERIAL_USAGE",
  ATTENDANCE = "ATTENDANCE",
  CUSTOM = "CUSTOM",
}

export interface AnalyticsEvent {
  id: string;
  eventType: EventType;
  userId: string;
  classroomId?: string;
  quizId?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ClassroomActivity {
  totalEvents: number;
  activityByDay: Record<string, Record<string, number>>;
  eventTypes: string[];
}

export interface QuizPerformance {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  questionPerformance: Record<
    string,
    {
      correct: number;
      incorrect: number;
      unanswered: number;
      partiallyCorrect: number;
    }
  >;
  attempts: {
    attemptId: string;
    userId: string;
    userName: string;
    startedAt: string;
    submittedAt?: string;
    score?: number;
  }[];
}

export interface StudentEngagement {
  totalStudents: number;
  activeStudents: number;
  averageEngagementRate: number;
  studentEngagement: {
    studentId: string;
    studentName: string;
    totalEvents: number;
    activityDays: number;
    quizAttempts: number;
    completedQuizzes: number;
    quizCompletionRate: number;
    averageScore: number;
    lastActive: string | null;
  }[];
}

export interface Report {
  id: string;
  title: string;
  reportType: ReportType;
  classroomId: string;
  createdById: string;
  parameters?: Record<string, any>;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  userId: string;
  title: string;
  layout: {
    widgets: {
      id: string;
      type: string;
      position: {
        x: number;
        y: number;
        w: number;
        h: number;
      };
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface WidgetData {
  id: string;
  title: string;
  type: string;
  data: any;
}
