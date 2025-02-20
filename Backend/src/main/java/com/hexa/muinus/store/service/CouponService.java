package com.hexa.muinus.store.service;

import com.google.zxing.WriterException;
import com.hexa.muinus.common.exception.code.*;
import com.hexa.muinus.common.exception.coupon.*;
import com.hexa.muinus.common.exception.store.StoreNotFoundException;
import com.hexa.muinus.common.jwt.JwtProvider;
import com.hexa.muinus.common.util.QRGenerator;
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
import jakarta.persistence.EntityManager;
import jakarta.persistence.OptimisticLockException;
import jakarta.persistence.PersistenceContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    @PersistenceContext
    private EntityManager entityManager;
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

        // 점주 유저만 쿠폰 생성 가능 -> Store에 userNo가 있는 user만 가능
        Store store = storeService.findStoreByEmail(email);

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

        // 점주 유저만 쿠폰 생성 가능 -> Store에 userNo가 있는 user만 가능
        Store store = storeService.findStoreByEmail(email);

        // 가게 번호와 맞는 쿠폰들 전체 조회
        List<CouponHistory> couponHistories = couponHistoryRepository.findById_StoreNo(store.getStoreNo());
        return couponHistories.stream()
                .map(ch -> {
                    // CouponHistory -> Coupon 참조
                    Coupon coupon = ch.getCoupon();

                    // CouponHistory에서 수량, 만료일, Coupon에서 name, discountRate, content 추출
                    return new CouponListResponseDto(
                            coupon.getCouponId(),
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
    public List<CouponListResponseDto> getCoupons(int storeNo){
        // 가게 번호와 맞는 쿠폰들 전체 조회
        List<CouponHistory> couponHistories = couponHistoryRepository.findById_StoreNo(storeNo);
        return couponHistories.stream()
                .map(ch -> {
                    Coupon coupon = ch.getCoupon();

                    return new CouponListResponseDto(
                            coupon.getCouponId(),
                            coupon.getName(),
                            coupon.getDiscountRate(),
                            ch.getCount(),
                            coupon.getContent(),
                            ch.getExpirationDate()
                    );
                })
                .toList();
    }
    
    /**
     * 쿠폰 발급 처리의 단일 시도를 담당
     * 낙관적 락 충돌이 나면 예외를 그대로 던진다.
     * 재시도는 이 메소드를 감싸는 쪽(Facade)에서 담당.
     * @param receiveCouponRequestDto
     */
    @Transactional
    public void receiveCoupon(HttpServletRequest request, ReceiveCouponRequestDto receiveCouponRequestDto) {
                // 이메일 추출
                String email = jwtProvider.getUserEmailFromAccessToken(request);
                // 로그인 유저 확인
                Users user = userRepository.findByEmail(email);
                Integer userNo = user.getUserNo();

                Integer storeNo = receiveCouponRequestDto.getStoreNo();
                Integer couponId = receiveCouponRequestDto.getCouponId();

                // 가게 존재 여부 확인
                boolean storeExists = storeRepository.existsById(storeNo);
                if (!storeExists) {
                    throw new StoreNotFoundException(storeNo);
                }

                // 쿠폰 존재 여부 확인
                boolean exists = couponRepository.existsById(couponId);
                if (!exists) {
                    throw new CouponNotFoundException();
                }

                // 복합 키 생성
                UserCouponHistoryId userCouponHistoryId = new UserCouponHistoryId(storeNo, couponId, userNo);

                // 중복 수령 방지
                if (userCouponHistoryRepository.existsById(userCouponHistoryId)) {
                    throw new CouponAlreadyClaimedException(storeNo, couponId, userNo);
                }

                // CouponHistoryId 생성
                CouponHistoryId couponHistoryId = new CouponHistoryId(
                        receiveCouponRequestDto.getStoreNo(),
                        receiveCouponRequestDto.getCouponId()
                );

                // 쿠폰 히스토리 조회(이 때는 낙관적 락이 안걸림)
                CouponHistory couponHistory = couponHistoryRepository.findById(couponHistoryId)
                        .orElseThrow(CouponNotIssuedException::new);

                // 발급 가능 수량 확인
                if (couponHistory.getCount() <= 0) {
                    throw new CouponOutOfStock(userCouponHistoryId.getStoreNo(), userCouponHistoryId.getCouponId());
                }

                // 쿠폰 개수 감소
                couponHistory.setCount(couponHistory.getCount() - 1);

                //flush()를 통해 즉시 DB에 반영 -> 데드락 발생 시 여기서 예외
                entityManager.flush();

                // 변경 사항 저장(낙관적 락: @Version 체크됨)
                couponHistoryRepository.save(couponHistory);

                // 새로운 UserCouponHistory 생성.
                UserCouponHistory userCouponHistory = new UserCouponHistory(
                        userCouponHistoryId,
                        couponHistory,
                        user,
                        LocalDateTime.now(),
                        null
                );
                userCouponHistoryRepository.save(userCouponHistory);

                // 다시 flush()해 insert 시 발생할 수 있는 DeadLock도 조기 감지
//                entityManager.flush();

    }

    @Transactional(readOnly = true)
    public List<ReceiveCouponResponseDto> getUserCoupons(HttpServletRequest request){
        // 이메일 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);

        // 로그인 유저 조회
        Users user = userRepository.findByEmail(email);

        // UserCouponHistory 조회
        int userNo = user.getUserNo();
        List<UserCouponHistory> userCouponHistories = userCouponHistoryRepository.findUnusedCouponsByUser(userNo);

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
    public CouponQRCodeResponseDto createCouponQR(CouponQRCodeRequestDto couponQRCodeRequestDto) {

        // 사용 가능한 쿠폰 조회
        UserCouponHistoryId userCouponHistoryId = new UserCouponHistoryId(couponQRCodeRequestDto.getStoreNo(), couponQRCodeRequestDto.getCouponId(), couponQRCodeRequestDto.getUserNo());
        boolean exists = userCouponHistoryRepository.existsByIdAndUsedAtIsNull(userCouponHistoryId);
        if(!exists){
            throw new AvailableCouponNotFoundException();
        }

        // 쿠폰 히스토리 ID 생성
        CouponHistoryId couponHistoryId = new CouponHistoryId(
                couponQRCodeRequestDto.getStoreNo(),
                couponQRCodeRequestDto.getCouponId()
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

        // QR 생성
        String QR;
        try {
            String QRData = generateQRData(couponQRCodeRequestDto);
            QR = QRGenerator.generateQRImage(QRData, 200, 200);//바코드 크기
        } catch (WriterException | IOException e){
            throw new QRGenerationFailedException();
        }

        return new CouponQRCodeResponseDto(QR);
    }

    /**
     * QR에 포함될 데이터를 생성하는 메서드.
     *
     * @param couponQRCodeRequestDto 쿠폰 사용 요청 DTO
     * @return QR 데이터 문자열
     */
    private String generateQRData(CouponQRCodeRequestDto couponQRCodeRequestDto){
        return String.format("coupon_id:%d,store_no:%d,user_no:%d",
                couponQRCodeRequestDto.getCouponId(),
                couponQRCodeRequestDto.getStoreNo(),
                couponQRCodeRequestDto.getUserNo()
        );
    }

    @Transactional
    public CouponQRCodeCheckResponseDto checkCouponQR(HttpServletRequest request, CouponQRCodeCheckRequestDto couponQRCodeCheckRequestDto){

        String qrData = couponQRCodeCheckRequestDto.getQrData();

        // QR 데이터 파싱
        String[] dataParts = qrData.split(",");
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
                throw new InvalidQRDataException();
            }
        } catch (Exception e){
            throw new QRParsingErrorException();
        }

        // 키오스크에 로그인된 email 추출
        String email = jwtProvider.getUserEmailFromAccessToken(request);

        // 점주 유저만 쿠폰 생성 가능 -> Store에 userNo가 있는 user만 가능
        Store store = storeService.findStoreByEmail(email);

        // 이 키오스크(판매점)이랑 쿠폰의 storeNo가 일치하는지
        if(!store.getStoreNo().equals(storeNo)){
            throw new CouponNotFoundException();
        }

        // 조건에 맞는 사용 가능한 쿠폰 조회
        UserCouponHistoryId userCouponHistoryId = new UserCouponHistoryId(storeNo, couponId, userNo);
        boolean exists = userCouponHistoryRepository.existsByIdAndUsedAtIsNull(userCouponHistoryId);
        if(!exists){
            throw new AvailableCouponNotFoundException();
        }

        // 쿠폰 히스토리 조회
        CouponHistoryId couponHistoryId = new CouponHistoryId(storeNo, couponId);
        CouponHistory couponHistory = couponHistoryRepository.findById(couponHistoryId)
                .orElseThrow(CouponNotIssuedException::new);

        // 쿠폰 유효기간 확인
        LocalDateTime now = LocalDateTime.now();
        if(couponHistory.getExpirationDate().isBefore(now)){
            throw new CouponExpiredException(couponHistory.getExpirationDate());
        }

        //discountRate 추출
        Integer discountRate = couponHistory.getCoupon().getDiscountRate();

        return new CouponQRCodeCheckResponseDto(couponId, storeNo, userNo, discountRate, "매장에 유효한 쿠폰입니다.");
    }

    @Transactional
    public Coupon findCouponById(Integer couponId) {
        return couponRepository.findById(couponId)
                .orElseThrow(() -> new CouponNotFoundException(couponId));
    }

}
