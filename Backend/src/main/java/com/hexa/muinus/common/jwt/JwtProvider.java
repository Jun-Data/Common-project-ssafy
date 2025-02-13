package com.hexa.muinus.common.jwt;

import com.hexa.muinus.users.domain.user.Users;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtProvider {

    @Value("${jwt.secretKey}")
    private String secretKey;

    @Value("${jwt.access.expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh.expiration}")
    private long refreshTokenExpiration;

    public String createAccessToken(Users user) {
        Claims claims = Jwts.claims().setSubject(user.getEmail());
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + accessTokenExpiration);
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(SignatureAlgorithm.HS512, secretKey)
                .compact();
    }

    public String createRefreshToken(Users user) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + refreshTokenExpiration);
        return Jwts.builder()
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.error(e.getMessage());
            return false;
        }
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        String userEmail = claims.getSubject();

        return new UsernamePasswordAuthenticationToken(userEmail, token, null);
    }

    public void setAccessTokensInCookie(HttpServletResponse response, String accessToken) {
        ResponseCookie responseCookie = ResponseCookie.from("AccessToken", accessToken)
                .maxAge(accessTokenExpiration)
                .path("/")
                .sameSite("Lax")
                .httpOnly(true)
                .secure(true)
                .build();

        response.addHeader("Set-Cookie", responseCookie.toString());
    }

    public void setRefreshTokensInCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie responseCookie = ResponseCookie.from("RefreshToken", refreshToken)
                .maxAge(refreshTokenExpiration)
                .path("/")
                .sameSite("None")
                .httpOnly(true)
                .secure(true)
                .build();

        response.addHeader("Set-Cookie", responseCookie.toString());
    }

    /**
     * 쿠키에서 특정 이름의 값을 가져오는 메서드
     */
    public String getCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals(cookieName)) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    /**
     * Access Token으로부터 user email 추출
     */
    public String getUserEmailFromAccessToken(HttpServletRequest request) {
        String accessToken = getCookieValue(request, "AccessToken");
        if (accessToken == null) {
            return null;
        }
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(accessToken)
                .getBody()
                .getSubject();
    }

    /**
     * 토큰을 발급, users 객체에 refresh token 할당, 쿠키에 토큰 심기
     */
    public void issueTokens(Users user, HttpServletResponse response) {
        String accessToken = createAccessToken(user);
        String refreshToken = createRefreshToken(user);
        user.updateRefreshToken(refreshToken);
        setAccessTokensInCookie(response, accessToken);
        setRefreshTokensInCookie(response, refreshToken);
    }

    /**
     * 로그아웃 시 쿠키에서 토큰 삭제
     */
    public void clearTokens(HttpServletResponse response) {
        setAccessTokensInCookie(response, null);
        setRefreshTokensInCookie(response, null);
    }
}
