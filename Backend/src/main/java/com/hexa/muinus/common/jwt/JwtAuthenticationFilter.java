package com.hexa.muinus.common.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        List<String> excludePatterns = List.of(
                "/favicon.ico",
                "api/users/check",
                "/api/users/kauth",
                "/api/users/info",
                "/api/users/consumer",
                "/api/users/store-owner",
                "/api/users/logout",
                "/api/users/login",
                "/api/users/reissue",
                "/api/store/list**",
                "/api/store/detail**",
                "/api/kiosk/**"
        );
        // 특정 경로를 무시하도록 설정
        return excludePatterns.stream().anyMatch(pattern -> path.matches(pattern.replace("**", ".*")));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        log.info("uri : {} ",request.getRequestURI());
        log.info("JWT Authentication Filter");
        String accessToken = jwtProvider.getCookieValue(request, "AccessToken");
        log.info("JWT Access Token: {}", accessToken);
        if (accessToken != null) {
            try {
                // JWT 유효성 검사
                if (jwtProvider.validateToken(accessToken)) {
                    log.info("JWT Authentication Success");
                    // 유효한 토큰이면 Authentication 객체 생성
                    Authentication authentication = jwtProvider.getAuthentication(accessToken);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                log.info("Access Token validation error: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
