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
                                .requestMatchers("/", "/api/items/**").permitAll()
                                .requestMatchers("/api/users/kauth**", "/api/users/consumer", "/api/users/store-owner", "/api/users/logout", "/api/users/login", "/api/users/reissue", "/oauth2/**").permitAll() // 회원 관리
                                .requestMatchers( "/api/coupon/**", "/api/store/detail**").permitAll() // 매장 리스트 조회 및 상세 페이지 조회
                                .requestMatchers("/api/kiosk/**").permitAll()  // 키오스크 관련
                                .anyRequest().authenticated()  // 그 외 모든 요청은 인증 필요
                )
                .csrf(csrf -> csrf.disable())
                .formLogin(formLogin -> formLogin.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .headers(headers ->
                        headers.defaultsDisabled()
                                .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.UNSAFE_URL))
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}