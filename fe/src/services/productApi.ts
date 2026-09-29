import { apiClient } from './apiClient';
import { compressImageClientSide } from '../utils/imageCompressor';

export interface SkuPayload {
  name: string;
  skuCode?: string;
  slug?: string;
  artisanId?: number;
  villageId?: number;
  categoryId?: number;
  description: string;
  materialInfo: string;
  artisanStory?: string;
  creationProcessVideoUrl?: string;
  dimensions?: string;
  weightGram?: number;
  price: number;
  stockQuantity?: number;
  imageUrl?: string;
  model3dUrl?: string;
}

export const productApi = {
  createSku: (payload: SkuPayload) => {
    return apiClient.post('/products', payload);
  },
  getMyArtisanProducts: (artisanId?: number) => {
    return apiClient.get('/artisans/products', { params: { artisanId } });
  },
  getPendingVillageProducts: (villageId?: number) => {
    return apiClient.get('/villages/products/pending', { params: { villageId } });
  },
  reviewSku: (id: number, approved: boolean, rejectionReason?: string) => {
    return apiClient.put(`/villages/products/${id}/approve`, { approved, rejectionReason });
  },
  uploadMedia: async (file: File) => {
    let uploadFile = file;
    if (file.type.startsWith('image/')) {
      // Nén ảnh canvas nhẹ <= 1.5MB tuân thủ Rule 6
      uploadFile = await compressImageClientSide(file, 1.5);
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    return apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};
