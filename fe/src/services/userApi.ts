import { apiClient } from './apiClient';

export interface UserDto {
  id: number;
  username: string;
  email: string;
  phone?: string;
  fullName: string;
  unitCode?: string;
  unitName?: string;
  role: string;
  status: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  unitCode?: string;
  unitName?: string;
  role?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  unitCode?: string;
  unitName?: string;
  role?: string;
  status?: string;
  password?: string;
}

export const fetchUsers = async (params?: {
  keyword?: string;
  unitCode?: string;
  role?: string;
  page?: number;
  size?: number;
}): Promise<{ content: UserDto[]; totalElements: number }> => {
  const res: any = await apiClient.get('/users', { params });
  return res.data || { content: [], totalElements: 0 };
};

export const createUser = async (data: CreateUserRequest): Promise<UserDto> => {
  const res: any = await apiClient.post('/users', data);
  return res.data;
};

export const updateUser = async (id: number, data: UpdateUserRequest): Promise<UserDto> => {
  const res: any = await apiClient.put(`/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const res: any = await apiClient.delete(`/users/${id}`);
  return res.success;
};
