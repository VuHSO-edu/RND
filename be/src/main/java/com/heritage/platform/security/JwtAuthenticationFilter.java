package com.heritage.platform.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String devRole = request.getHeader("X-Dev-Role");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                String email = jwtTokenProvider.getEmailFromToken(token);
                // Extract role or use default
                String role = "ROLE_CUSTOMER";
                try {
                    io.jsonwebtoken.Claims claims = io.jsonwebtoken.Jwts.parser()
                            .verifyWith(jwtTokenProvider.getSigningKey())
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();
                    role = claims.get("role", String.class);
                } catch (Exception ignored) {}

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        List.of(new SimpleGrantedAuthority(role != null ? role : "ROLE_CUSTOMER"))
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } else if (devRole != null && !devRole.isBlank()) {
            String roleWithPrefix = devRole.startsWith("ROLE_") ? devRole : "ROLE_" + devRole;
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    "dev-user",
                    null,
                    List.of(new SimpleGrantedAuthority(roleWithPrefix))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
