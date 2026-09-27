package com.heritage.platform.common.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class MinioConfig {

    private final MinioProperties minioProperties;

    @Bean
    public MinioClient minioClient() {
        MinioClient client = MinioClient.builder()
                .endpoint(minioProperties.getEndpoint())
                .credentials(minioProperties.getAccessKey(), minioProperties.getSecretKey())
                .build();

        // Tự động kiểm tra và khởi tạo Bucket với chính sách Public Read
        try {
            boolean bucketExists = client.bucketExists(
                    BucketExistsArgs.builder().bucket(minioProperties.getBucketName()).build()
            );

            if (!bucketExists) {
                log.info("[MINIO] Tạo mới bucket lưu trữ media: {}", minioProperties.getBucketName());
                client.makeBucket(
                        MakeBucketArgs.builder().bucket(minioProperties.getBucketName()).build()
                );
            }

            // Thiết lập Policy cho phép đọc công khai ảnh và video qua URL
            String publicReadPolicy = """
                    {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Effect": "Allow",
                                "Principal": {"AWS": ["*"]},
                                "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
                                "Resource": ["arn:aws:s3:::%s"]
                            },
                            {
                                "Effect": "Allow",
                                "Principal": {"AWS": ["*"]},
                                "Action": ["s3:GetObject"],
                                "Resource": ["arn:aws:s3:::%s/*"]
                            }
                        ]
                    }
                    """.formatted(minioProperties.getBucketName(), minioProperties.getBucketName());

            client.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .config(publicReadPolicy)
                            .build()
            );

            log.info("[MINIO] Khởi tạo MinIO Client & Bucket [{}] thành công!", minioProperties.getBucketName());
        } catch (Exception e) {
            log.warn("[MINIO] Chưa thể kết nối tới MinIO Server ({}), ứng dụng sẽ tiếp tục chạy và kết nối lại khi MinIO sẵn sàng: {}", 
                    minioProperties.getEndpoint(), e.getMessage());
        }

        return client;
    }
}
