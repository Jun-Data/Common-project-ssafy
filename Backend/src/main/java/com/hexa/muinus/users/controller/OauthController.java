package com.hexa.muinus.users.controller;

import com.hexa.muinus.common.jwt.JwtProvider;
import com.hexa.muinus.users.domain.user.Users;
import com.hexa.muinus.users.service.OauthService;
import com.hexa.muinus.users.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class OauthController {

    private final OauthService oauthService;
    private final UserService userService;
    private final JwtProvider jwtProvider;

    // 어느 페이지에서 로그인을 시도했는지 확인용
    private String loginTrialURL;

    @GetMapping("/api/users/login")
    public void getAuthCodeFromKakao(@RequestParam(value = "redirect", required = false) String redirectUrl, HttpServletResponse response) {
        log.info("로그인을 시도한 url : {}", redirectUrl);
        loginTrialURL = redirectUrl != null ? redirectUrl : "/";
        oauthService.getAuthorizationCode(response);
    }

    @GetMapping("/api/users/kauth")
    public void kakaoLogin(@RequestParam("code") String authorizationCode, HttpServletResponse response) throws Exception {
        String accessToken = oauthService.getAccessTokenFromKakao(authorizationCode);
        String userEmail = oauthService.getUserKakaoProfile(accessToken);
        Users user = oauthService.findUser(userEmail, response);
        jwtProvider.issueTokens(user, response);
        oauthService.redirectToMainPage(response, loginTrialURL);
    }

    @GetMapping("/api/users/logout")
    public ResponseEntity<?> kakaoLogout(HttpServletRequest request, HttpServletResponse response){
        String userEmail = jwtProvider.getUserEmailFromAccessToken(request);
        Users user = userService.findUserByEmail(userEmail);

        if(user != null){
            // 쿠키에서 토큰 삭제
            jwtProvider.clearTokens(response);

            // DB에서 refresh token 삭제
            oauthService.deleteRefreshToken(user);
        }
        return ResponseEntity.ok().build();
    }

}
