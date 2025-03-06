export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePic: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  profilePic?: string | null;
}

export interface UserClassroom {
  id: string;
  name: string;
  section: string | null;
  subject: string | null;
  createdAt: Date;
  studentsCount: number;
}

export interface UserEnrollment {
  id: string;
  name: string;
  section: string | null;
  subject: string | null;
  createdAt: Date;
  teacherName: string;
}
