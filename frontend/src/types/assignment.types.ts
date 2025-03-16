import { User } from "./user.types";

export enum AssignmentStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

export enum SubmissionStatus {
  SUBMITTED = "SUBMITTED",
  LATE = "LATE",
  GRADED = "GRADED",
}

export interface Attachment {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface Grade {
  id: string;
  points: number;
  feedback?: string;
  gradedAt: string;
  gradedBy: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  instructions?: string;
  points: number;
  dueDate: string;
  status: AssignmentStatus;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  student: User;
  comment?: string;
  submissionDate: string;
  status: SubmissionStatus;
  attachments: Attachment[];
  grade?: Grade;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentDto {
  classroomId: string;
  title: string;
  description: string;
  instructions?: string;
  points: number;
  dueDate: string;
  status: AssignmentStatus;
  attachments?: Omit<Attachment, "id" | "createdAt">[];
}

export interface CreateSubmissionDto {
  assignmentId: string;
  comment?: string;
}

export interface GradeSubmissionDto {
  points: number;
  feedback?: string;
}
