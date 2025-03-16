import API from "@/services/api";

export const getClassroomAnalytics = async (classroomId: string) => {
  const response = await API.get(`/analytics/classroom/${classroomId}`);
  return response.data;
};

export const getUserEngagement = async (
  classroomId: string,
  userId: string
) => {
  const response = await API.get(
    `/analytics/classroom/${classroomId}/user/${userId}/engagement`
  );
  return response.data;
};

export const getUserPerformance = async (
  classroomId: string,
  userId: string
) => {
  const response = await API.get(
    `/analytics/classroom/${classroomId}/user/${userId}/performance`
  );
  return response.data;
};

export const getTeacherDashboardStats = async () => {
  const response = await API.get(`/analytics/teacher/dashboard`);
  return response.data;
};

export const getStudentDashboardStats = async () => {
  const response = await API.get(`/analytics/student/dashboard`);
  return response.data;
};

export const logActivity = async (data: {
  userId: string;
  activityType: string;
  resourceId?: string;
  resourceType?: string;
  metadata?: any;
}) => {
  const response = await API.post(`/analytics/activity`, data);
  return response.data;
};
