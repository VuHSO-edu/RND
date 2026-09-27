package com.heritage.platform.modules.user.controller;

import com.heritage.platform.common.response.ApiResponse;
import com.heritage.platform.common.response.PagedResponse;
import com.heritage.platform.modules.user.dto.CreateUserRequest;
import com.heritage.platform.modules.user.dto.UpdateUserRequest;
import com.heritage.platform.modules.user.dto.UserDto;
import com.heritage.platform.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ApiResponse<PagedResponse<UserDto>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String unitCode,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(userService.getUsers(keyword, unitCode, role, page, size), "Lấy danh sách người dùng thành công");
    }

    @GetMapping("/{id}")
    public ApiResponse<UserDto> getUserById(@PathVariable Long id) {
        return ApiResponse.ok(userService.getUserById(id), "Lấy thông tin người dùng thành công");
    }

    @PostMapping
    public ApiResponse<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.ok(userService.createUser(request), "Tạo người dùng thành công");
    }

    @PutMapping("/{id}")
    public ApiResponse<UserDto> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return ApiResponse.ok(userService.updateUser(id, request), "Cập nhật người dùng thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.ok("success", "Đã xóa người dùng thành công");
    }
}
