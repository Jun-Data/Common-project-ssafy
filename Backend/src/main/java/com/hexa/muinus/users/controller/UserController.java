package com.hexa.muinus.users.controller;

import com.hexa.muinus.common.jwt.JwtProvider;
import com.hexa.muinus.users.domain.user.Users;
import com.hexa.muinus.users.dto.*;
import com.hexa.muinus.users.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtProvider jwtProvider;

    @PostMapping("/consumer")
    public ResponseEntity<?> registerConsumer(@RequestBody ConsumerRegisterRequestDto requestDto, HttpServletResponse response) {
        return ResponseEntity.ok(userService.registerConsumer(requestDto, response));
    }

    @PostMapping("/store-owner")
    public ResponseEntity<?> registerStoreOwner(@RequestBody StoreOwnerRegisterRequestDto requestDto, HttpServletResponse response) {
        return ResponseEntity.ok(userService.registerStoreOwner(requestDto, response));
    }

    @PostMapping("/reissue")
    public ResponseEntity<?> reissueAccessToken(HttpServletRequest request, HttpServletResponse response, @RequestBody ReissueAccessTokenRequestDto requestDto) {
        userService.reissueAccessToken(request, response, requestDto);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UserUpdateRequestDto requestDto, HttpServletRequest request){
        userService.updateUser(requestDto.getUserTelephone(), request);
        return ResponseEntity.ok("수정 완료");
    }

    @GetMapping("/mypage")
    public ResponseEntity<UserPageResponseDto> getMyPage(HttpServletRequest request){
        return ResponseEntity.ok().body(userService.getMyPage(request));
    }

    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(HttpServletRequest request){
        return ResponseEntity.ok().body(userService.getUserInfo(request));
    }

}
