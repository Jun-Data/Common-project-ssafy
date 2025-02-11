package com.hexa.muinus.store.service;

import com.google.zxing.WriterException;
import com.hexa.muinus.common.exception.coupon.*;
import com.hexa.muinus.common.exception.code.BarcodeGenerationFailedException;
import com.hexa.muinus.common.exception.code.BarcodeParsingErrorException;
import com.hexa.muinus.common.exception.code.InvalidBarcodeDataException;
import com.hexa.muinus.common.exception.store.StoreNotFoundException;
import com.hexa.muinus.common.exception.user.UserNotFoundException;
import com.hexa.muinus.common.jwt.JwtProvider;
import com.hexa.muinus.common.util.BarCodeGenerator;
import com.hexa.muinus.store.domain.coupon.repository.CouponHistoryRepository;
import com.hexa.muinus.store.domain.coupon.repository.CouponRepository;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.dto.coupon.CouponListResponseDto;
import com.hexa.muinus.store.dto.coupon.CouponTypeResponseDto;
import com.hexa.muinus.users.domain.coupon.repository.UserCouponHistoryRepository;
import com.hexa.muinus.store.domain.coupon.Coupon;
import com.hexa.muinus.store.domain.coupon.CouponHistory;
import com.hexa.muinus.store.domain.coupon.CouponHistoryId;
import com.hexa.muinus.store.domain.store.repository.StoreRepository;
import com.hexa.muinus.store.dto.coupon.CouponRequestDto;
import com.hexa.muinus.users.domain.coupon.UserCouponHistory;
import com.hexa.muinus.users.domain.coupon.UserCouponHistoryId;
import com.hexa.muinus.users.domain.user.Users;
import com.hexa.muinus.users.domain.user.repository.UserRepository;
import com.hexa.muinus.users.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponHistoryRepository couponHistoryRepository;
    private final UserCouponHistoryRepository userCouponHistoryRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final StoreService storeService;
    private final JwtProvider jwtProvider;

    @Transactional(readOnly = true)
    public List<CouponTypeResponseDto> getCouponType() {
        List<Coupon> couponType = couponRepository.findAll();
        List<CouponTypeResponseDto> response = couponType.stream()
                .map(coupon -> new CouponTypeResponseDto(coupon.getCouponId(), coupon.getName(), coupon.getDiscountRate(), coupon.getContent()))
                .collect(Collectors.toList());
        return response;
    }

    @Transactional
    public void createCoupon(HttpServletRequest request, CouponRequestDto couponRequestDto) {
        // 이메일 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);

        // 로그인 유저 조회
        Users user = userRepository.findByEmail(email);

        // 점주 유저만 쿠폰 생성 가능
        if(user.getUserType() != Users.UserType.A){
            throw new CouponAccessForbiddenException();
        }
            Store store = storeService.findStoreByUser(user);

            // 쿠폰이 존재하는지 확인
            Coupon coupon = couponRepository.findById(couponRequestDto.getCouponId())
                    .orElseThrow(() -> new CouponNotFoundException(couponRequestDto.getCouponId()));

            // 복합 키 생성
            CouponHistoryId couponHistoryId = CouponHistoryId.builder()
                    .storeNo(store.getStoreNo())
                    .couponId(coupon.getCouponId())
                    .build();

            // 쿠폰 발급 내역 생성
            CouponHistory couponHistory = CouponHistory.builder()
                    .id(couponHistoryId)
                    .store(store)
                    .coupon(coupon)
                    .count(couponRequestDto.getCount())
                    .expirationDate(couponRequestDto.getExpirationDate())
                    .createdAt(LocalDateTime.now())
                    .build();
            couponHistoryRepository.save(couponHistory);

    }

    @Transactional(readOnly = true)
    public List<CouponListResponseDto> getCouponList(HttpServletRequest request) {
        // 이메일 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);

        // 로그인 유저 조회 후 스토어 가져오기
        Users user = userRepository.findByEmail(email);
        Store store = storeRepository.findByUser(user);

        // 가게 번호와 맞는 쿠폰들 전체 조회
        List<CouponHistory> couponHistories = couponHistoryRepository.findById_StoreNo(store.getStoreNo());
        return couponHistories.stream()
                .map(ch -> {
                    // CouponHistory -> Coupon 참조
                    Coupon coupon = ch.getCoupon();

                    // CouponHistory에서 수량, 만료일, Coupon에서 name, discountRate, content 추출
                    return new CouponListResponseDto(
                            coupon.getName(),
                            coupon.getDiscountRate(),
                            ch.getCount(),
                            coupon.getContent(),
                            ch.getExpirationDate()
                    );
                })
                .toList();

    }

    @Transactional
    public void receiveCoupon(ReceiveCouponRequestDto receiveCouponRequestDto) {
        // 가게 존재 여부 확인
        boolean storeExists = storeRepository.existsById(receiveCouponRequestDto.getStoreNo());
        if(!storeExists) {
            throw new StoreNotFoundException(receiveCouponRequestDto.getStoreNo());
        }

        // 쿠폰 존재 여부 확인
        Coupon coupon = couponRepository.findById((receiveCouponRequestDto.getCouponId()))
                .orElseThrow(() -> new CouponNotFoundException(receiveCouponRequestDto.getCouponId()));

        // 사용자 존재 여부 확인
        Users user = userRepository.findById(receiveCouponRequestDto.getUserNo())
                .orElseThrow(() -> new UserNotFoundException(receiveCouponRequestDto.getUserNo()));

        // 복합 키 생성
        UserCouponHistoryId userCouponHistoryId = new UserCouponHistoryId(receiveCouponRequestDto.getStoreNo(), receiveCouponRequestDto.getCouponId(), receiveCouponRequestDto.getUserNo());

        // 중복 수령 방지
        if(userCouponHistoryRepository.existsById(userCouponHistoryId)){
            throw new CouponAlreadyClaimedException(userCouponHistoryId.getStoreNo(), userCouponHistoryId.getCouponId());
        }

        // CouponHistoryId 생성
        CouponHistoryId couponHistoryId = new CouponHistoryId(
                receiveCouponRequestDto.getStoreNo(),
                receiveCouponRequestDto.getCouponId()
        );

        // 쿠폰 히스토리 생성
        CouponHistory couponHistory = couponHistoryRepository.findById(couponHistoryId)
                .orElseThrow(CouponNotIssuedException::new);

        // 발급 가능 수량 감소
        if(couponHistory.getCount() <= 0){
            throw new CouponOutOfStock(userCouponHistoryId.getStoreNo(), userCouponHistoryId.getCouponId());
        }
        couponHistory.setCount(couponHistory.getCount() - 1);
        couponHistoryRepository.save(couponHistory);

        // 새로운 쿠폰 수령
        UserCouponHistory userCouponHistory = new UserCouponHistory(
                userCouponHistoryId,
                couponHistory,
                user,
                LocalDateTime.now(),
                null
        );
        userCouponHistoryRepository.save(userCouponHistory);
    }

    @Transactional(readOnly = true)
    public List<ReceiveCouponResponseDto> getUserCoupons(HttpServletRequest request){
        // 이메일 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);

        // 로그인 유저 조회
        Users user = userRepository.findByEmail(email);

        // UserCouponHistory 조회
        List<UserCouponHistory> userCouponHistories = userCouponHistoryRepository.findByUser_userNo(user.getUserNo());

        // 변환(ReceiveCouponResponseDto)
        return userCouponHistories.stream()
                .map(history -> {
                    CouponHistory couponHistory = history.getCouponHistory();
                    Coupon coupon = couponHistory.getCoupon();
                    return new ReceiveCouponResponseDto(
                            couponHistory.getCoupon().getCouponId(),
                            user.getUserNo(),
                            couponHistory.getStore().getStoreNo(),
                            couponHistory.getStore().getName(),
                            coupon.getName(),
                            coupon.getContent(),
                            coupon.getDiscountRate(),
                            couponHistory.getExpirationDate(),
                            history.getUsedAt()
                    );
                }).toList();

    }

    @Transactional
    public CouponBarcodeResponseDto createCouponBarcode(CouponBarcodeRequestDto couponBarcodeRequestDto) {

        // 사용 가능한 쿠폰 조회
        UserCouponHistory userCouponHistory = userCouponHistoryRepository.findById_UserNoAndId_CouponIdAndId_StoreNoAndUsedAtIsNull(
                couponBarcodeRequestDto.getUserNo(),
                couponBarcodeRequestDto.getCouponId(),
                couponBarcodeRequestDto.getStoreNo()
        ).orElseThrow(AvailableCouponNotFoundException::new);

        // 쿠폰 히스토리 ID 생성
        CouponHistoryId couponHistoryId = new CouponHistoryId(
                couponBarcodeRequestDto.getStoreNo(),
                couponBarcodeRequestDto.getCouponId()
        );

        // 쿠폰 히스토리 조회
        log.info("coupon history start");
        CouponHistory couponHistory = couponHistoryRepository.findById(couponHistoryId)
                .orElseThrow(CouponNotIssuedException::new);
        log.info("coupon history end");
        // 쿠폰 유효 기간 확인
        if(couponHistory.getExpirationDate().isBefore(LocalDateTime.now())){
            throw new CouponExpiredException(couponHistory.getExpirationDate());
        }

        // 바코드 생성
        String barcode;
        try {
            String barcodeData = generateBarCodeData(couponBarcodeRequestDto);
            barcode = BarCodeGenerator.generateBarCodeImage(barcodeData, 300, 100);//바코드 크기
        } catch (WriterException | IOException e){
            throw new BarcodeGenerationFailedException();
        }

        return new CouponBarcodeResponseDto(barcode);
    }

    /**
     * 바코드에 포함될 데이터를 생성하는 메서드.
     *
     * @param couponBarcodeRequestDto 쿠폰 사용 요청 DTO
     * @return 바코드 데이터 문자열
     */
    private String generateBarCodeData(CouponBarcodeRequestDto couponBarcodeRequestDto){
        return String.format("coupon_id:%d,store_no:%d,user_no:%d",
                couponBarcodeRequestDto.getCouponId(),
                couponBarcodeRequestDto.getStoreNo(),
                couponBarcodeRequestDto.getUserNo()
        );
    }

    @Transactional
    public CouponBarcodeCheckResponseDto checkCouponBarcode(HttpServletRequest request, CouponBarcodeCheckRequestDto couponBarcodeCheckRequestDto){

        String barcodeData = couponBarcodeCheckRequestDto.getBarcodeData();

        // 바코드 데이터 파싱
        String[] dataParts = barcodeData.split(",");
        Integer couponId = null;
        Integer storeNo = null;
        Integer userNo = null;

        try {
            for (String part : dataParts) {
                String[] keyValue = part.split(":");
                if(keyValue.length != 2) continue;
                String key = keyValue[0].trim();
                String value = keyValue[1].trim();
                switch(key){
                    case "coupon_id":
                        couponId = Integer.parseInt(value);
                        break;
                    case "store_no":
                        storeNo = Integer.parseInt(value);
                        break;
                    case "user_no":
                        userNo = Integer.parseInt(value);
                        break;
                }
            }
            if(couponId == null || storeNo == null || userNo == null) {
                throw new InvalidBarcodeDataException();
            }
        } catch (Exception e){
            throw new BarcodeParsingErrorException();
        }

        // 키오스크에 로그인된 email 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);
        //로그인 유저 조회
        Users user = userRepository.findByEmail(email);

        // user로 store 조회
        Store store = storeRepository.findByUser(user);

        // 이 키오스크(판매점)이랑 쿠폰의 storeNo가 일치하는지
        if(store.getStoreNo() != storeNo){
            throw new CouponNotFoundException();
        }

        // 조건에 맞는 사용 가능한 쿠폰 조회
        UserCouponHistory userCouponHistory = userCouponHistoryRepository
                .findById_UserNoAndId_CouponIdAndId_StoreNoAndUsedAtIsNull(
                        userNo, couponId, storeNo
                ).orElseThrow(AvailableCouponNotFoundException::new);

        // 쿠폰 히스토리 조회
        CouponHistoryId couponHistoryId = new CouponHistoryId(storeNo, couponId);
        CouponHistory couponHistory = couponHistoryRepository.findById(couponHistoryId)
                .orElseThrow(CouponNotIssuedException::new);

        // 쿠폰 유효기간 확인
        if(couponHistory.getExpirationDate().isBefore(LocalDateTime.now())){
            throw new CouponExpiredException(couponHistory.getExpirationDate());
        }

        //discountRate 추출
        Integer discountRate = couponHistory.getCoupon().getDiscountRate();

        return new CouponBarcodeCheckResponseDto(couponId, storeNo, userNo, discountRate, "매장에 유효한 쿠폰입니다.");
    }

    @Transactional
    public Coupon findCouponById(Integer couponId) {
        return couponRepository.findById(couponId)
                .orElseThrow(() -> new CouponNotFoundException(couponId));
    }

}
