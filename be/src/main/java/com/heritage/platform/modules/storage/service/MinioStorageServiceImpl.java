package com.heritage.platform.modules.storage.service;

import com.heritage.platform.common.config.MinioProperties;
import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.storage.dto.FileUploadResponse;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioStorageServiceImpl implements StorageService {

    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024L; // 10MB (Theo quy chuẩn Di sản)
    private static final long MAX_VIDEO_SIZE = 100 * 1024 * 1024L; // 100MB (Video chế tác làng nghề)

    private static final String[] ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg"};
    private static final String[] ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v"};

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    @Override
    public FileUploadResponse uploadImage(MultipartFile file) {
        return uploadFile(file, "images", MAX_IMAGE_SIZE, ALLOWED_IMAGE_EXTENSIONS);
    }

    @Override
    public FileUploadResponse uploadVideo(MultipartFile file) {
        return uploadFile(file, "videos", MAX_VIDEO_SIZE, ALLOWED_VIDEO_EXTENSIONS);
    }

    @Override
    public FileUploadResponse uploadFile(MultipartFile file, String folder, long maxSizeBytes, String[] allowedExtensions) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Tệp tin tải lên không được để trống");
        }

        if (file.getSize() > maxSizeBytes) {
            long maxMb = maxSizeBytes / (1024 * 1024);
            throw new BusinessException("Kích thước tệp vượt quá giới hạn cho phép (" + maxMb + "MB)");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            originalFilename = "file_" + System.currentTimeMillis();
        }

        String lowerCaseName = originalFilename.toLowerCase();
        boolean validExtension = Arrays.stream(allowedExtensions).anyMatch(lowerCaseName::endsWith);
        if (!validExtension) {
            throw new BusinessException("Định dạng tệp không được hỗ trợ. Các định dạng hợp lệ: " + Arrays.toString(allowedExtensions));
        }

        // Tạo đường dẫn object dạng: folder/yyyy/MM/uuid-ten-tap-tin
        String safeName = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String objectKey = folder + "/" + datePath + "/" + uniqueId + "-" + safeName;

        try (InputStream inputStream = file.getInputStream()) {
            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = "application/octet-stream";
            }

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .object(objectKey)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(contentType)
                            .build()
            );

            String fileUrl = minioProperties.getPublicUrlPrefix() + "/" + objectKey;
            log.info("[MINIO] Tải lên thành công: {} -> {}", originalFilename, fileUrl);

            return FileUploadResponse.builder()
                    .fileUrl(fileUrl)
                    .objectKey(objectKey)
                    .originalFileName(originalFilename)
                    .contentType(contentType)
                    .sizeBytes(file.getSize())
                    .formattedSize(formatSize(file.getSize()))
                    .build();

        } catch (Exception e) {
            log.error("[MINIO] Lỗi khi tải tệp lên MinIO: {}", e.getMessage(), e);
            throw new BusinessException("Không thể tải tệp lên máy chủ lưu trữ MinIO: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return;
        }

        // Nếu người dùng truyền vào cả URL đầy đủ, bóc tách lấy objectKey
        String normalizedKey = objectKey;
        if (normalizedKey.contains(minioProperties.getBucketName() + "/")) {
            normalizedKey = normalizedKey.substring(normalizedKey.indexOf(minioProperties.getBucketName() + "/") + minioProperties.getBucketName().length() + 1);
        }

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .object(normalizedKey)
                            .build()
            );
            log.info("[MINIO] Đã xóa tệp: {}", normalizedKey);
        } catch (Exception e) {
            log.error("[MINIO] Lỗi khi xóa tệp {}: {}", normalizedKey, e.getMessage());
            throw new BusinessException("Không thể xóa tệp từ MinIO: " + e.getMessage());
        }
    }

    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
