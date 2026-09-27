package com.heritage.platform.modules.user.entity;

import com.heritage.platform.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, unique = true)
    private String username;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20, unique = true)
    private String phone;

    @Column(name = "unit_code", length = 50)
    private String unitCode;

    @Column(name = "unit_name", length = 150)
    private String unitName;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String role = "ROLE_CUSTOMER";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE";
}
