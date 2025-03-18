import API from "@/services/api";

export const createMeeting = async (classroomId: string) => {
  const response = await API.post(`/video/classroom/${classroomId}/meeting`);
  return response.data;
};

export const joinMeeting = async (meetingId: string) => {
  const response = await API.post(`/video/meeting/${meetingId}/join`);
  return response.data;
};

export const endMeeting = async (meetingId: string) => {
  const response = await API.post(`/video/meeting/${meetingId}/end`);
  return response.data;
};

export const getClassroomMeetings = async (classroomId: string) => {
  const response = await API.get(`/video/classroom/${classroomId}/meetings`);
  return response.data;
};
