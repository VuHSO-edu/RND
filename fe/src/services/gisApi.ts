import { apiClient } from './apiClient';

export interface OrgUnitTreeNode {
  id: number;
  code: string;
  name: string;
  label: string;
  parentCode?: string;
  level: number;
  type: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  status: string;
  children: OrgUnitTreeNode[];
}

export interface OrgUnit {
  id: number;
  code: string;
  name: string;
  parentCode?: string;
  level: number;
  type: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
  status: string;
}

export interface PowerAsset {
  id: number;
  code: string;
  name: string;
  assetType: 'UNIT' | 'LINE' | 'DEVICE';
  unitCode?: string;
  unitName?: string;
  voltageLevel?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  notes?: string;
}

export interface CreatePowerAssetRequest {
  code: string;
  name: string;
  assetType: string;
  unitCode?: string;
  unitName?: string;
  voltageLevel?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  notes?: string;
}

export interface CreateOrgUnitRequest {
  code: string;
  name: string;
  parentCode?: string;
  level?: number;
  type?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  phone?: string;
}

export const fetchOrgUnitTree = async (): Promise<OrgUnitTreeNode[]> => {
  const res: any = await apiClient.get('/gis/units/tree');
  return res.data || [];
};

export const fetchOrgUnits = async (): Promise<OrgUnit[]> => {
  const res: any = await apiClient.get('/gis/units');
  return res.data || [];
};

export const createOrgUnit = async (data: CreateOrgUnitRequest): Promise<OrgUnit> => {
  const res: any = await apiClient.post('/gis/units', data);
  return res.data;
};

export const fetchPowerAssets = async (params?: {
  assetType?: string;
  unitCode?: string;
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<{ content: PowerAsset[]; totalElements: number }> => {
  const res: any = await apiClient.get('/gis/assets', { params });
  return res.data || { content: [], totalElements: 0 };
};

export const fetchAssetCounts = async (): Promise<Record<string, number>> => {
  const res: any = await apiClient.get('/gis/assets/counts');
  return res.data || {};
};

export const createPowerAsset = async (data: CreatePowerAssetRequest): Promise<PowerAsset> => {
  const res: any = await apiClient.post('/gis/assets', data);
  return res.data;
};

export const deletePowerAsset = async (id: number): Promise<boolean> => {
  const res: any = await apiClient.delete(`/gis/assets/${id}`);
  return res.success;
};
