package com.heritage.platform.modules.user.service;

import com.heritage.platform.common.exception.BusinessException;
import com.heritage.platform.common.response.PagedResponse;
import com.heritage.platform.modules.user.dto.CreateUserRequest;
import com.heritage.platform.modules.user.dto.UpdateUserRequest;
import com.heritage.platform.modules.user.dto.UserDto;
import com.heritage.platform.modules.user.entity.User;
import com.heritage.platform.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PagedResponse<UserDto> getUsers(String keyword, String unitCode, String role, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.findAll(pageable);

        List<UserDto> list = userPage.getContent().stream()
                .filter(u -> !u.isDeleted())
                .filter(u -> keyword == null || keyword.isBlank() || 
                        (u.getUsername() != null && u.getUsername().toLowerCase().contains(keyword.toLowerCase().trim())) ||
                        (u.getFullName() != null && u.getFullName().toLowerCase().contains(keyword.toLowerCase().trim())) ||
                        (u.getEmail() != null && u.getEmail().toLowerCase().contains(keyword.toLowerCase().trim())))
                .filter(u -> unitCode == null || unitCode.isBlank() || (u.getUnitCode() != null && u.getUnitCode().equalsIgnoreCase(unitCode.trim())))
                .filter(u -> role == null || role.isBlank() || (u.getRole() != null && u.getRole().equalsIgnoreCase(role.trim())))
                .map(this::mapToDto)
                .toList();

        return PagedResponse.<UserDto>builder()
                .content(list)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy người dùng với ID: " + id));
        return mapToDto(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        String cleanUsername = request.getUsername().trim();
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(cleanUsername)) {
            throw new BusinessException("DUPLICATE_KEY", "Tên đăng nhập '" + cleanUsername + "' đã tồn tại");
        }
        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BusinessException("DUPLICATE_KEY", "Địa chỉ email '" + cleanEmail + "' đã được sử dụng");
        }

        String rawPassword = request.getPassword();
        if (rawPassword == null || rawPassword.isBlank()) {
            rawPassword = "EvnUser@2026";
        }

        User user = User.builder()
                .username(cleanUsername)
                .email(cleanEmail)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .fullName(request.getFullName().trim())
                .unitCode(request.getUnitCode() != null ? request.getUnitCode().trim() : null)
                .unitName(request.getUnitName() != null ? request.getUnitName().trim() : null)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(request.getRole() != null ? request.getRole() : "ROLE_USER")
                .status("ACTIVE")
                .build();

        User saved = userRepository.save(user);
        log.info("[USER] Tạo người dùng mới thành công: {} ({})", saved.getUsername(), saved.getEmail());
        return mapToDto(saved);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy người dùng"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getUnitCode() != null) {
            user.setUnitCode(request.getUnitCode().trim());
        }
        if (request.getUnitName() != null) {
            user.setUnitName(request.getUnitName().trim());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        }

        User updated = userRepository.save(user);
        log.info("[USER] Cập nhật thông tin người dùng ID: {}", id);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND", "Không tìm thấy người dùng"));
        user.setDeleted(true);
        user.setStatus("DELETED");
        userRepository.save(user);
        log.info("[USER] Đã xóa mềm người dùng ID: {}", id);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .unitCode(user.getUnitCode())
                .unitName(user.getUnitName())
                .role(user.getRole())
                .status(user.getStatus())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
