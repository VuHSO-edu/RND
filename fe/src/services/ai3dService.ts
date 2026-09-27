import { apiClient } from './apiClient';

export interface Ai3dTaskResponse {
  taskId: string;
  status: 'QUEUED' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  progressPercent: number;
  message: string;
  model3dUrl?: string;
  renderedThumbnailUrl?: string;
}

export const generate3dFromImage = async (
  imageUrl: string,
  artworkName: string,
  materialType: string = 'Gốm sứ men rạn Bát Tràng'
): Promise<Ai3dTaskResponse> => {
  const res: any = await apiClient.post('/public/ai-3d/generate', {
    imageUrl,
    artworkName,
    materialType,
    enablePbr: true
  });
  return res.data;
};

export const checkAi3dProgress = async (taskId: string): Promise<Ai3dTaskResponse> => {
  const res: any = await apiClient.get(`/public/ai-3d/task/${taskId}`);
  return res.data;
};
