import { apiClient } from './apiClient';

export interface ProxyArtisanPayload {
  fullName: string;
  phone?: string;
  title: string;
  bio?: string;
  experienceYears?: number;
  workshopAddress?: string;
  specialtySkills?: string;
  villageId?: number;
}

export interface ArtisanItem {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    phone?: string;
    fullName: string;
    role: string;
    status: string;
  };
  craftVillage?: {
    id: number;
    name: string;
    province: string;
    craftType?: string;
  };
  title: string;
  bio?: string;
  specialtySkills?: string;
  experienceYears: number;
  workshopAddress: string;
  verificationStatus: string;
  rejectionReason?: string;
  managedByVillageAdmin: boolean;
  activationToken?: string;
  createdAt: string;
}

export interface VillageStats {
  villageId: number;
  villageName: string;
  totalArtisans: number;
  approvedArtisans: number;
  pendingArtisans: number;
  coverageRadiusMeters: number;
  verificationStatus: string;
}

export const villageAdminApi = {
  getMyVillage: (villageId?: number) => {
    return apiClient.get('/villages/me', { params: { villageId } });
  },
  updateMyVillage: (payload: any, villageId?: number) => {
    return apiClient.put('/villages/me', payload, { params: { villageId } });
  },
  getArtisans: (villageId?: number) => {
    return apiClient.get('/villages/artisans', { params: { villageId } });
  },
  createProxyArtisan: (payload: ProxyArtisanPayload) => {
    return apiClient.post('/villages/artisans', payload);
  },
  reviewArtisan: (artisanId: number, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => {
    return apiClient.put(`/villages/artisans/${artisanId}/review`, { status, rejectionReason });
  },
  getStatistics: (villageId?: number) => {
    return apiClient.get('/villages/statistics', { params: { villageId } });
  },
  verifyVillage: (villageId: number, approved: boolean, villageAdminUserId?: number, rejectionReason?: string) => {
    return apiClient.put(`/admin/villages/${villageId}/verify`, { approved, villageAdminUserId, rejectionReason });
  }
};
