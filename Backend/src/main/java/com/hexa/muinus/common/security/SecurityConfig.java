package com.hexa.muinus.common.security;

import com.hexa.muinus.common.jwt.JwtAuthenticationFilter;
import com.hexa.muinus.common.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final JwtProvider jwtProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authorizeRequests ->
                        authorizeRequests
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                // 로그인/회원가입 관련
                                .requestMatchers("/api/users/kauth","/api/users/store-owner", "/api/users/consumer", "/api/users/login", "/api/users/logout", "/api/users/reissue").permitAll()
                                // 검색 관련
                                .requestMatchers("/api/items/**", "/api/item", "/api/item/detail").permitAll() // 상품 검색
                                .requestMatchers("/api/store/list/**").permitAll() // 매장 검색
                                // 쿠폰
                                .requestMatchers("/api/coupon/qrcode").permitAll()
                                .requestMatchers("/api/coupon/check").permitAll()
                                // 매장 관련
                                .requestMatchers("/api/store/detail").permitAll()
                                // 키오스크
                                .requestMatchers("/api/kiosk/**").permitAll()
                                // openvidu
//                                .requestMatchers("/api/sessions/**", "/api/sessions").permitAll()
                                .anyRequest().authenticated()  // 그 외 모든 요청은 인증 필요
                )
                .csrf(csrf -> csrf.disable())
                .formLogin(formLogin -> formLogin.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}