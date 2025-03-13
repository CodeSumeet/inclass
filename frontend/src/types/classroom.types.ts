// frontend/src/types/classroom.ts
export interface Classroom {
  id: string;
  name: string;
  section?: string;
  subject?: string;
  description?: string;
  code: string;
  ownerId: string;
  // other properties
}

export interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
}
