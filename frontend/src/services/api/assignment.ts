import API from "@/services/api";
import {
  Assignment,
  CreateAssignmentDto,
  Submission,
  CreateSubmissionDto,
  GradeSubmissionDto,
} from "@/types/assignment.types";

export const getClassroomAssignments = async (
  classroomId: string
): Promise<Assignment[]> => {
  const response = await API.get(`/classrooms/${classroomId}/assignments`);
  return response.data;
};

export const getAssignment = async (
  assignmentId: string
): Promise<Assignment> => {
  const response = await API.get(`/assignments/${assignmentId}`);
  return response.data;
};

export const createAssignment = async (
  data: CreateAssignmentDto
): Promise<Assignment> => {
  const response = await API.post("/assignments", data);
  return response.data;
};

export const updateAssignment = async (
  assignmentId: string,
  data: Partial<CreateAssignmentDto>
): Promise<Assignment> => {
  const response = await API.put(`/assignments/${assignmentId}`, data);
  return response.data;
};

export const deleteAssignment = async (assignmentId: string): Promise<void> => {
  await API.delete(`/assignments/${assignmentId}`);
};

export const addAssignmentAttachment = async (
  assignmentId: string,
  attachment: {
    url: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
  }
): Promise<void> => {
  await API.post(`/assignments/${assignmentId}/attachments`, attachment);
};

export const getAssignmentSubmissions = async (
  assignmentId: string
): Promise<Submission[]> => {
  const response = await API.get(`/assignments/${assignmentId}/submissions`);
  return response.data;
};

export const getStudentSubmission = async (
  assignmentId: string,
  studentId: string
): Promise<Submission> => {
  const response = await API.get(
    `/assignments/${assignmentId}/submissions/${studentId}`
  );
  return response.data;
};

export const createSubmission = async (
  data: CreateSubmissionDto
): Promise<Submission> => {
  const response = await API.post("/assignments/submissions", data);
  return response.data;
};

export const addSubmissionAttachment = async (
  submissionId: string,
  attachment: {
    url: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
  }
): Promise<void> => {
  await API.post(
    `/assignments/submissions/${submissionId}/attachments`,
    attachment
  );
};

export const gradeSubmission = async (
  submissionId: string,
  data: GradeSubmissionDto
): Promise<Submission> => {
  const response = await API.post(
    `/assignments/submissions/${submissionId}/grade`,
    data
  );
  return response.data;
};
