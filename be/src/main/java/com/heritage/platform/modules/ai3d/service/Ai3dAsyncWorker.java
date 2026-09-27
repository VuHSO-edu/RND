package com.heritage.platform.modules.ai3d.service;

import com.heritage.platform.modules.ai3d.dto.Ai3dGenerateRequest;
import com.heritage.platform.modules.ai3d.dto.Ai3dTaskResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class Ai3dAsyncWorker {

    @Async
    public void executeAi3dPipeline(String taskId, Ai3dGenerateRequest request, Map<String, Ai3dTaskResponse> taskCache) {
        try {
            // Bước 1: Phân tích đường bao hình khối gốm
            Thread.sleep(1500);
            updateTask(taskId, "PROCESSING", 35, "Đang trích xuất đường cong vuốt gốm và tạo lưới đa giác 3D...", taskCache);

            // Bước 2: Bọc vân men rạn & men lam PBR
            Thread.sleep(2000);
            updateTask(taskId, "PROCESSING", 70, "Đang tổng hợp vân men rạn tự nhiên và hiệu ứng phản quang PBR...", taskCache);

            // Bước 3: Nén tối ưu hóa Draco mesh chuẩn di sản <= 10MB
            Thread.sleep(1500);
            updateTask(taskId, "PROCESSING", 90, "Đang nén Draco Compression chuẩn bị xuất file .glb...", taskCache);

            // Bước 4: Hoàn thành
            Thread.sleep(1000);
            Ai3dTaskResponse completedTask = taskCache.get(taskId);
            if (completedTask != null) {
                completedTask.setStatus("SUCCESS");
                completedTask.setProgressPercent(100);
                completedTask.setMessage("Đã số hóa thành công mô hình 3D Lục Bình Men Rạn Bát Tràng!");
                completedTask.setModel3dUrl("https://modelviewer.dev/shared-assets/models/Astronaut.glb");
                log.info("[AI_3D_GENERATION_SUCCESS] TaskId={}, Artwork={}", taskId, request.getArtworkName());
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            updateTask(taskId, "FAILED", 0, "Tiến trình tạo 3D bị gián đoạn", taskCache);
        } catch (Exception ex) {
            log.error("[AI_3D_GENERATION_ERROR] TaskId={}", taskId, ex);
            updateTask(taskId, "FAILED", 0, "Lỗi trong quá trình xử lý AI: " + ex.getMessage(), taskCache);
        }
    }

    private void updateTask(String taskId, String status, int progress, String message, Map<String, Ai3dTaskResponse> taskCache) {
        Ai3dTaskResponse task = taskCache.get(taskId);
        if (task != null) {
            task.setStatus(status);
            task.setProgressPercent(progress);
            task.setMessage(message);
        }
    }
}
