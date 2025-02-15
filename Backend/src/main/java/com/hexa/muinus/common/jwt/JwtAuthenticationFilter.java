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
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private static final List<String> EXCLUDE_URLS = Collections.unmodifiableList(Arrays.asList(
            "/favicon.ico",
            "/",
            // 로그인/회원가입 관련
            "/api/users/kauth",
            "/api/users/consumer",
            "/api/users/store-owner",
            "/api/users/logout",
            "/api/users/login",
            "/api/users/reissue",

            // 검색 관련
            "/api/items/autocomplete",
            "/api/items/search",
            "/api/items/store-items",
            "/api/items/search-native",

            // 매장 검색
            "/api/store/list",

            // 키오스크
            "/api/kiosk/scan",
            "/api/kiosk/payment",
            "/api/kiosk/flea-item"
    ));

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return EXCLUDE_URLS.stream().anyMatch(exclude -> exclude.equalsIgnoreCase(request.getServletPath()));
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
