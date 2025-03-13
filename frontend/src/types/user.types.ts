// Base user interface
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePic?: string;
}

// Interface for profile update
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  profilePic?: File;
}

// Interface for profile form data
export interface ProfileFormData {
  firstName: string;
  lastName: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  phone?: string;
}
