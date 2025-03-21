import API from "./index";

export const fetchClassroomDetails = async (classroomId: string) => {
  const response = await API.get(`/classrooms/${classroomId}`);
  return response.data;
};

export const postAnnouncement = async (
  classroomId: string,
  content: string
) => {
  const response = await API.post(`/classrooms/${classroomId}/announcements`, {
    content,
  });
  return response.data;
};
