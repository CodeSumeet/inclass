import API from "@/services/api";
import {
  AnalyticsEvent,
  ClassroomActivity,
  QuizPerformance,
  StudentEngagement,
  Report,
  Dashboard,
} from "@/types/analytics.types";

// Event tracking
export const trackEvent = async (data: {
  eventType: string;
  classroomId?: string;
  quizId?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}): Promise<AnalyticsEvent> => {
  const response = await API.post("/analytics/events", data);
  return response.data;
};

// Classroom activity
export const getClassroomActivity = async (
  id: string, // Changed from classroomId to id to match schema
  days: number = 30
): Promise<ClassroomActivity> => {
  const response = await API.get(
    `/analytics/classrooms/${id}/activity?days=${days}`
  );
  return response.data;
};

// Quiz performance
export const getQuizPerformance = async (
  id: string, // Changed from classroomId to id
  quizId?: string
): Promise<QuizPerformance> => {
  const url = `/analytics/classrooms/${id}/quiz-performance${
    quizId ? `?quizId=${quizId}` : ""
  }`;
  const response = await API.get(url);
  return response.data;
};

// Student engagement
export const getStudentEngagement = async (
  id: string, // Changed from classroomId to id
  days: number = 30
): Promise<StudentEngagement> => {
  const response = await API.get(
    `/analytics/classrooms/${id}/student-engagement?days=${days}`
  );
  return response.data;
};

// Reports
export const createReport = async (data: {
  title: string;
  reportType: string;
  classroomId: string; // This is fine as it's the field name in Report model
  parameters?: Record<string, any>;
}): Promise<Report> => {
  const response = await API.post("/analytics/reports", data);
  return response.data;
};

export const getReports = async (classroomId: string): Promise<Report[]> => {
  const response = await API.get(
    `/analytics/classrooms/${classroomId}/reports`
  );
  return response.data;
};

export const getReport = async (reportId: string): Promise<Report> => {
  const response = await API.get(`/analytics/reports/${reportId}`);
  return response.data;
};

// Dashboard
export const getDashboard = async (): Promise<Dashboard> => {
  const response = await API.get("/analytics/dashboard");
  return response.data;
};

export const updateDashboard = async (data: {
  title?: string;
  layout: any;
}): Promise<Dashboard> => {
  const response = await API.put("/analytics/dashboard", data);
  return response.data;
};
