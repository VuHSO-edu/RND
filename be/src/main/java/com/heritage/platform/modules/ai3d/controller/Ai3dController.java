package com.heritage.platform.modules.ai3d.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.modules.ai3d.dto.Ai3dGenerateRequest;
import com.heritage.platform.modules.ai3d.dto.Ai3dTaskResponse;
import com.heritage.platform.modules.ai3d.service.Ai3dGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/ai-3d")
@RequiredArgsConstructor
public class Ai3dController {

    private final Ai3dGenerationService ai3dService;

    @PostMapping("/generate")
    public ApiResponse<Ai3dTaskResponse> submitImageTo3d(@RequestBody Ai3dGenerateRequest request) {
        Ai3dTaskResponse task = ai3dService.submitImageTo3d(request);
        return ApiResponse.ok(task, "Đã tiếp nhận yêu cầu số hóa 3D tác phẩm");
    }

    @GetMapping("/task/{taskId}")
    public ApiResponse<Ai3dTaskResponse> getTaskProgress(@PathVariable String taskId) {
        Ai3dTaskResponse task = ai3dService.getTaskStatus(taskId);
        return ApiResponse.ok(task, "Cập nhật tiến trình AI 3D");
    }
}
