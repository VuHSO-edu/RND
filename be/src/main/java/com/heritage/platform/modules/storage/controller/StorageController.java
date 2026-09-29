package com.heritage.platform.modules.storage.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.storage.dto.FileUploadResponse;
import com.heritage.platform.modules.storage.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/public/storage")
@RequiredArgsConstructor
public class StorageController {

    private final StorageService storageService;

    @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        FileUploadResponse response = storageService.uploadImage(file);
        return ApiResponse.ok(response, "Tải ảnh lên thành công");
    }

    @PostMapping(value = "/upload/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileUploadResponse> uploadVideo(@RequestParam("file") MultipartFile file) {
        FileUploadResponse response = storageService.uploadVideo(file);
        return ApiResponse.ok(response, "Tải video lên thành công");
    }

    @PostMapping(value = "/media/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileUploadResponse> uploadMedia(@RequestParam("file") MultipartFile file) {
        String contentType = file.getContentType();
        FileUploadResponse response;
        if (contentType != null && contentType.startsWith("video/")) {
            response = storageService.uploadVideo(file);
        } else {
            response = storageService.uploadImage(file);
        }
        return ApiResponse.ok(response, "Tải tệp media lên thành công");
    }

    @DeleteMapping
    public ApiResponse<String> deleteFile(@RequestParam("objectKey") String objectKey) {
        storageService.deleteFile(objectKey);
        return ApiResponse.ok("success", "Đã xóa tệp tin thành công");
    }
}
