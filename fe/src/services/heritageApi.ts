import { apiClient } from './apiClient';

export interface CraftVillage {
  id: number;
  name: string;
  slug: string;
  region: string;
  province: string;
  historicalSummary: string;
  foundingYearEstimate: number;
  latitude: number;
  longitude: number;
  coverImageUrl: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  description: string;
  materialInfo: string;
  dimensions: string;
  price: number;
  model3dUrl?: string;
  imageUrl?: string;
  isUniqueArtwork: boolean;
  artisan: {
    id: number;
    title: string;
    bio?: string;
    user: {
      fullName: string;
    };
    craftVillage: {
      name: string;
      province: string;
    };
  };
}

export interface HeritagePassport {
  id: number;
  passportCode: string;
  nfcTagUid?: string;
  craftingVideoUrl?: string;
  artisanStoryQuote?: string;
  blockchainTxHash: string;
  blockchainTokenId: string;
  smartContractAddress: string;
  verificationHash: string;
  scanCount: number;
  status: 'ACTIVE' | 'FLAGGED_ANOMALY' | 'REVOKED';
  product: Product;
}

export interface VillageTreeNode {
  id: string;
  code: string;
  name: string;
  label: string;
  type: 'REGION' | 'PROVINCE' | 'VILLAGE';
  latitude?: number;
  longitude?: number;
  province?: string;
  region?: string;
  children: VillageTreeNode[];
}

export const fetchVillages = async (): Promise<CraftVillage[]> => {
  const res: any = await apiClient.get('/public/villages');
  return res.data;
};

export const fetchVillageTree = async (): Promise<VillageTreeNode[]> => {
  const res: any = await apiClient.get('/public/villages/tree');
  return res.data;
};

export const createVillage = async (data: any): Promise<CraftVillage> => {
  const res: any = await apiClient.post('/public/villages', data);
  return res.data;
};

export const fetchProducts = async (categoryId?: number): Promise<Product[]> => {
  const res: any = await apiClient.get('/public/products', {
    params: { categoryId, size: 50 }
  });
  return res.data?.content || [];
};

export const createProduct = async (data: any): Promise<Product> => {
  const res: any = await apiClient.post('/public/products', data);
  return res.data;
};

export const lookupPassport = async (passportCode: string): Promise<HeritagePassport> => {
  const res: any = await apiClient.get(`/public/passports/${passportCode}`);
  return res.data;
};
