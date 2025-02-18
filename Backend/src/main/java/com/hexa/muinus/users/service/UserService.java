package com.hexa.muinus.users.service;

import com.hexa.muinus.common.exception.user.InvalidRefreshTokenException;
import com.hexa.muinus.common.exception.user.RefreshTokenRequiredException;
import com.hexa.muinus.common.exception.user.UserEmailDuplicateException;
import com.hexa.muinus.common.jwt.JwtProvider;
import com.hexa.muinus.common.s3.service.S3ImageService;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.domain.store.repository.StoreRepository;
import com.hexa.muinus.store.service.StoreService;
import com.hexa.muinus.users.domain.user.FliUser;
import com.hexa.muinus.users.domain.user.Users;
import com.hexa.muinus.users.domain.user.repository.FliUserRepository;
import com.hexa.muinus.users.domain.user.repository.UserRepository;
import com.hexa.muinus.users.dto.*;
import com.nimbusds.openid.connect.sdk.claims.UserInfo;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final FliUserRepository fliUserRepository;
    private final JwtProvider jwtProvider;
    private final S3ImageService s3ImageService;

    @Transactional
    public Users registerConsumer(ConsumerRegisterRequestDto requestDto, HttpServletResponse response) {
        // 이미 가입한 회원인지 이메일로 확인
        isEmailDuplicated(requestDto.getUserEmail());

        // 신규 사용자(소비자) 생성
        Users user = Users.createConsumer(requestDto);

        // 회원 가입 시 토큰 발급
        jwtProvider.issueTokens(user, response);
        return userRepository.save(user);
    }

    /**
     * 점주 회원가입 시 정보 받아와 Users 테이블에 저장, 또한 Store 테이블에도 저장
     */
    @Transactional
    public Store registerStoreOwner(StoreOwnerRegisterRequestDto requestDto, HttpServletResponse response) {
        // 이미 가입한 회원인지 이메일로 확인
        isEmailDuplicated(requestDto.getUserEmail());

        // 신규 사용자(점주) 생성
        Users user = Users.createStoreOwner(requestDto);

        // 회원 가입 시 토큰 발급
        jwtProvider.issueTokens(user, response);

        Users savedUser = userRepository.save(user);
        // 신규 매장 생성
        String imageUrl = s3ImageService.Base64toImageUrl(requestDto.getStoreImageUrl());
        Store store = Store.create(savedUser, requestDto);
        store.setStoreImageUrl(imageUrl);

        return storeRepository.save(store);
    }

    /**
     * refresh token 유효성 검증 후 access token 재발급
     */
    @Transactional
    public void reissueAccessToken(HttpServletRequest request, HttpServletResponse response, ReissueAccessTokenRequestDto requestDto) {
        String refreshToken = jwtProvider.getCookieValue(request, "RefreshToken");

        // RefreshToken 유효한지 확인
        if (refreshToken != null && !refreshToken.isEmpty() && jwtProvider.validateToken(refreshToken)) {
            // DB에 저장된 refresh 토큰과 일치하는지 확인 후 AccessToken 재발급
            Users user = findUserByEmail(requestDto.getUserEmail());
            if (refreshToken.equals(user.getRefreshToken())) {
                jwtProvider.issueTokens(user, response);
            } else if (!refreshToken.equals(user.getRefreshToken())) {
                throw new InvalidRefreshTokenException();
            }
        } else {
            throw new RefreshTokenRequiredException();
        }
    }

    /**
     * 이메일 중복 검사
     */
    @Transactional(readOnly = true)
    public void isEmailDuplicated(String email) {
        if (userRepository.existsByEmail(email)) {
            log.info("User already exists with email {}", email);
            throw new UserEmailDuplicateException(email);
        }
    }

    @Transactional
    public Users findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * 소비자 정보 수정
     */
    @Transactional
    public void updateUser(String userTelephone, HttpServletRequest request) {
        // 이메일 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);

        Users user = findUserByEmail(email);

        user.setTelephone(userTelephone);
    }

    /**
     * 마이페이지 이동
     */
    @Transactional
    public UserPageResponseDto getMyPage(HttpServletRequest request) {
        //이메일 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);

        // 로그인 유저 조회
        Users user = findUserByEmail(email);
        FliUser fliUser = fliUserRepository.findById(user.getUserNo()).orElse(null);

        // 일반유저
        if(user.getUserType() == Users.UserType.U){
            if(fliUser != null){
                //fliUser
                return new UserPageResponseDto(user, fliUser);
            } else{
                return new UserPageResponseDto(user, null);
            }

        } else {// 점주
            if(fliUser != null){
                return new UserPageResponseDto(user, fliUser);
            }
        }
        return new UserPageResponseDto(user, null);
    }

    @Transactional
    public UserInfoResponseDto getUserInfo(HttpServletRequest request) {
        // 쿠키에 담긴 토큰 값으로 유저 확인
        String userEmail = jwtProvider.getUserEmailFromAccessToken(request);
        Users user = findUserByEmail(userEmail);

        // 사용자 타입이 만약 점주라면 storeNo 설정
        Store store = new Store();
        if (user.getUserType() == Users.UserType.A) {
            store = storeRepository.findByUser(user);
        }

        return UserInfoResponseDto.builder()
                .userNo(user.getUserNo())
                .userName(user.getUserName())
                .storeNo(store.getStoreNo())
                .userEmail(user.getEmail())
                .userType(user.getUserType())
                .build();
    }
}
