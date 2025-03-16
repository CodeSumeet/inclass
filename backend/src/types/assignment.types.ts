export enum AssignmentStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

export enum SubmissionStatus {
  ASSIGNED = "ASSIGNED",
  SUBMITTED = "SUBMITTED",
  LATE = "LATE",
  TURNED_IN = "TURNED_IN",
  RETURNED = "RETURNED",
  GRADED = "GRADED",
}

export interface CreateAssignmentDto {
  title: string;
  description: string;
  instructions: string;
  points?: number;
  dueDate?: Date;
  topicId?: string;
  classroomId: string;
  status?: string;
}

export interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  instructions?: string;
  points?: number;
  dueDate?: Date;
  topicId?: string;
  status?: string;
}

export interface CreateSubmissionDto {
  assignmentId: string;
  comment?: string;
}

export interface GradeSubmissionDto {
  points: number;
  feedback?: string;
}

export interface AttachmentDto {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}
