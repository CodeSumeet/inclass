import { UpdateUserDto } from "@/types/user.types";
import api from ".";

export const updateProfile = async (userId: string, data: UpdateUserDto) => {
  const response = await api.put(`/users/${userId}`, data);
  return response.data;
};

export const getUserClassrooms = async (userId: string) => {
  const response = await api.get(`/users/${userId}/classrooms`);
  return response.data;
};

export const getUserEnrollments = async (userId: string) => {
  const response = await api.get(`/users/${userId}/enrollments`);
  return response.data;
};
