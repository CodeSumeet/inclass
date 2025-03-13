import API from "./index";

export const getAnnouncements = async (classroomId: string) => {
  const response = await API.get(`/classrooms/${classroomId}/announcements`);
  return response.data;
};

export const createAnnouncement = async (
  classroomId: string,
  content: string
) => {
  const response = await API.post(`/classrooms/${classroomId}/announcements`, {
    content,
  });
  return response.data;
};

export const deleteAnnouncement = async (announcementId: string) => {
  const response = await API.delete(`/announcements/${announcementId}`);
  return response.data;
};
