import { apiClient } from './apiClient';

export interface FileUploadResult {
  fileUrl: string;
  objectKey: string;
  originalFileName: string;
  contentType: string;
  sizeBytes: number;
  formattedSize: string;
}

/**
 * Tải ảnh lên máy chủ lưu trữ MinIO (Tối đa 10MB, hỗ trợ jpg, png, webp, svg)
 */
export const uploadImageToMinio = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<FileUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response: any = await apiClient.post('/public/storage/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data;
};

/**
 * Tải video lên máy chủ lưu trữ MinIO (Tối đa 100MB, hỗ trợ mp4, webm, mov)
 */
export const uploadVideoToMinio = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<FileUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response: any = await apiClient.post('/public/storage/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data;
};

/**
 * Xóa file trên MinIO
 */
export const deleteFileFromMinio = async (objectKey: string): Promise<boolean> => {
  const response: any = await apiClient.delete('/public/storage', {
    params: { objectKey },
  });
  return response.success;
};
