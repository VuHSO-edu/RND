package com.heritage.platform.modules.storage.service;

import com.heritage.platform.modules.storage.dto.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    FileUploadResponse uploadImage(MultipartFile file);
    FileUploadResponse uploadVideo(MultipartFile file);
    FileUploadResponse uploadFile(MultipartFile file, String folder, long maxSizeBytes, String[] allowedExtensions);
    void deleteFile(String objectKey);
}
