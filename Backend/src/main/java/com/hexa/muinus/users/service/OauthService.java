package com.hexa.muinus.users.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class OauthService {

    @Value("${kakao.auth.client_id}")
    private String clientId;

    @Value("${kakao.auth.redirect_url}")
    private String redirectUrl;

    public String getAccessTokenFromKakao(String authorizationCode) {

        // 카카오로 액세스 토큰 받기 위한 객체 생성
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", clientId);
        body.add("redirect_uri", redirectUrl);
        body.add("code", authorizationCode);

        HttpEntity<MultiValueMap<String, String>> httpEntity = new HttpEntity<>(body, headers);

        // 카카오로 액세스 토큰 발급 요청
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> responseEntity = restTemplate.exchange(
                "https://kauth.kakao.com/oauth/token",
                HttpMethod.POST,
                httpEntity,
                String.class
        );

        // 반환 값에서 액세스 토큰 추출
        ObjectMapper objectMapper = new ObjectMapper();
        String accessToken = "";
        try {
            accessToken = objectMapper.readTree(responseEntity.getBody()).get("access_token").asText();
            log.info("Access token:" + accessToken);
        } catch (Exception e) {
            log.error("카카오 액세스 토큰 교환 오류 발생");
        }
        return accessToken;
    }

    public String getUserKakaoProfile(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();

        // 카카오에 사용자 정보를 요청하기 위해 필요한 설정
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");
        headers.add("Authorization", "Bearer " + accessToken);

        HttpEntity<MultiValueMap<String, String>> userKakaoProfileRequest = new HttpEntity<>(headers);

        // 사용자 정보 요청
        ResponseEntity<String> responseEntity = restTemplate.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.GET,
                userKakaoProfileRequest,
                String.class
        );

        // 카카오로부터 사용자 이메일 수신
        ObjectMapper objectMapper = new ObjectMapper();
        String userEmail = "";
        try {
            userEmail = objectMapper.readTree(responseEntity.getBody()).get("kakao_account").get("email").asText();
            log.info("User Email:" + userEmail);
        } catch (Exception e) {
            log.error("사용자 이메일 정보 요청 실패");
        }
        return userEmail;
    }
}
