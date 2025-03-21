export interface Classroom {
  id: string;
  name: string;
  description?: string;
  section: string;
  subject: string;
  coverImage?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClassroomDto {
  name: string;
  description?: string;
  section: string;
  subject: string;
  coverImage?: string;
}

export interface UpdateClassroomDto {
  name?: string;
  description?: string;
  section?: string;
  subject?: string;
  coverImage?: string;
}
