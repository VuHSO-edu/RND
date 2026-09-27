package com.heritage.platform.modules.ai3d.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.modules.ai3d.dto.Ai3dGenerateRequest;
import com.heritage.platform.modules.ai3d.dto.Ai3dTaskResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class Ai3dGenerationService {

    private final Ai3dAsyncWorker asyncWorker;

    // Bộ nhớ lưu trạng thái tác vụ sinh 3D
    private final Map<String, Ai3dTaskResponse> taskCache = new ConcurrentHashMap<>();

    public Ai3dTaskResponse submitImageTo3d(Ai3dGenerateRequest request) {
        if (request.getImageUrl() == null || request.getImageUrl().isBlank()) {
            throw new BusinessException("INVALID_IMAGE_URL", "Ảnh chụp tác phẩm không được để trống");
        }

        String taskId = "task_3d_" + UUID.randomUUID().toString().substring(0, 8);

        Ai3dTaskResponse initialTask = Ai3dTaskResponse.builder()
                .taskId(taskId)
                .status("QUEUED")
                .progressPercent(10)
                .message("Đang nạp ảnh tác phẩm và phân tích cấu trúc hình khối...")
                .renderedThumbnailUrl(request.getImageUrl())
                .build();

        taskCache.put(taskId, initialTask);

        // Chạy tiến trình xử lý bất đồng bộ qua Worker riêng
        asyncWorker.executeAi3dPipeline(taskId, request, taskCache);

        return initialTask;
    }

    public Ai3dTaskResponse getTaskStatus(String taskId) {
        Ai3dTaskResponse task = taskCache.get(taskId);
        if (task == null) {
            throw new BusinessException("TASK_NOT_FOUND", "Không tìm thấy tác vụ sinh 3D với mã: " + taskId);
        }
        return task;
    }
}
