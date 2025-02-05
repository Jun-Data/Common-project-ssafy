package com.hexa.muinus.users.controller;

import com.hexa.muinus.users.domain.user.Users;
import com.hexa.muinus.users.dto.ConsumerRegisterRequestDto;
import com.hexa.muinus.users.dto.ReissueAccessTokenRequestDto;
import com.hexa.muinus.users.dto.StoreOwnerRegisterRequestDto;
import com.hexa.muinus.users.dto.UserUpdateRequestDto;
import com.hexa.muinus.users.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/api/users/consumer")
    public ResponseEntity<?> registerConsumer(@RequestBody ConsumerRegisterRequestDto requestDto, HttpServletResponse response) {
        return ResponseEntity.ok(userService.registerConsumer(requestDto, response));
    }

    @PostMapping("/api/users/store-owner")
    public ResponseEntity<?> registerStoreOwner(@RequestBody StoreOwnerRegisterRequestDto requestDto, HttpServletResponse response) {
        return ResponseEntity.ok(userService.registerStoreOwner(requestDto, response));
    }

    @PostMapping("/api/users/reissue")
    public ResponseEntity<?> reissueAccessToken(HttpServletRequest request, HttpServletResponse response, @RequestBody ReissueAccessTokenRequestDto requestDto) {
        userService.reissueAccessToken(request, response, requestDto);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("api/users/update")
    public ResponseEntity<?> updateUser(@RequestBody UserUpdateRequestDto requestDto, HttpServletRequest request){
        userService.updateUser(requestDto.getUserTelephone(), request);
        return ResponseEntity.ok("수정 완료");
    }

}
