import { apiClient } from './apiClient';

export interface RegisterPayload {
  email?: string;
  phone?: string;
  password: string;
  fullName: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_ARTISAN' | 'ROLE_VILLAGE_ADMIN' | 'ROLE_SUPER_ADMIN';
  villageName?: string;
  craftType?: string;
  region?: string;
  province?: string;
  district?: string;
  addressLine?: string;
  historicalSummary?: string;
  latitude?: number;
  longitude?: number;
  villageId?: number;
  title?: string;
  bio?: string;
  experienceYears?: number;
  workshopAddress?: string;
  isIndependent?: boolean;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AuthUserData {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  phone?: string;
  fullName: string;
  role: string;
  status: string;
  avatarUrl?: string;
  villageId?: number;
  villageName?: string;
  artisanId?: number;
  artisanTitle?: string;
  verificationStatus?: string;
}

export const authApi = {
  register: (payload: RegisterPayload) => {
    return apiClient.post<{ success: boolean; data: AuthUserData; message: string }>('/auth/register', payload);
  },
  login: (payload: LoginPayload) => {
    return apiClient.post<{ success: boolean; data: AuthUserData; message: string }>('/auth/login', payload);
  }
};
