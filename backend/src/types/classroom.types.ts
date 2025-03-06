export interface Classroom {
  id: string;
  name: string;
  description?: string;
  section: string;
  subject: string;
  coverImage?: string; // Ensure this field exists
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClassroomDto {
  name: string;
  description?: string;
  section: string;
  subject: string;
  coverImage?: string; // Ensure this field exists
}

export interface UpdateClassroomDto {
  name?: string;
  description?: string;
  section?: string;
  subject?: string;
  coverImage?: string; // Ensure this field exists
}
