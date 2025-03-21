import API from "../api";

export const getClassroomAnalytics = async (classroomId: string) => {
  const response = await API.get(`/analytics/classroom/${classroomId}`);
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
  const response = await API.get("/analytics/teacher/dashboard");
  return response.data;
};

export const getStudentDashboardStats = async () => {
  const response = await API.get("/analytics/student/dashboard");
  return response.data;
};

export const getAllStudentPerformances = async (classroomId: string) => {
  const response = await API.get(`/classrooms/${classroomId}/enrollments`);
  const enrollments = response.data;

  const performances = [];
  for (const enrollment of enrollments) {
    if (enrollment.role === "STUDENT") {
      try {
        const perfData = await getUserPerformance(
          classroomId,
          enrollment.userId
        );
        performances.push({
          ...perfData,
          user: {
            firstName: enrollment.user?.firstName || "Unknown",
            lastName: enrollment.user?.lastName || "User",
            userId: enrollment.userId,
            email: enrollment.user?.email || "",
          },
        });
      } catch (err) {
        console.log(
          `Could not get performance for student ${enrollment.userId}`
        );
      }
    }
  }

  return performances;
};

export const isUserTeacher = async (classroomId: string, userId: string) => {
  try {
    const response = await API.get(`/classroom/${classroomId}`);
    return response.data.ownerId === userId;
  } catch (error) {
    return false;
  }
};
