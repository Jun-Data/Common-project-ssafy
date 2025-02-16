package com.hexa.muinus.store.controller;

import com.hexa.muinus.store.dto.coupon.CouponTypeResponseDto;
import com.hexa.muinus.store.dto.coupon.CouponRequestDto;
import com.hexa.muinus.store.dto.coupon.CouponListResponseDto;
import com.hexa.muinus.store.service.CouponService;
import com.hexa.muinus.users.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/coupon")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    // 쿠폰 종류 전체 조회
    @GetMapping("/type")
    public ResponseEntity<List<CouponTypeResponseDto>> getCouponType(){
        return ResponseEntity.ok().body(couponService.getCouponType());
    }


    // 쿠폰 생성
    @PostMapping("/create")
    public ResponseEntity<?> createCoupon(HttpServletRequest request, @Valid @RequestBody CouponRequestDto couponRequestDto){
        couponService.createCoupon(request, couponRequestDto);
        return ResponseEntity.ok("쿠폰 생성이 완료되었습니다.");
    }

    // 가게 쿠폰 전체 조회(점주)
    @GetMapping("/list")
    public ResponseEntity<List<CouponListResponseDto>> getCouponList(HttpServletRequest request){
        return ResponseEntity.ok().body(couponService.getCouponList(request));
    }

    // 가게 쿠폰 전체 조회(소비자)
    @GetMapping("/store/list")
    public ResponseEntity<List<CouponListResponseDto>> getCoupons(@RequestParam("storeNo") int storeNo){
        return ResponseEntity.ok().body(couponService.getCoupons(storeNo));
    }

    // 쿠폰 수령
    @PostMapping("/receive")
    public ResponseEntity<?> receiveCoupon(HttpServletRequest request, @Valid @RequestBody ReceiveCouponRequestDto receiveCouponRequestDto){
        couponService.receiveCoupon(request, receiveCouponRequestDto);
        return ResponseEntity.ok("쿠폰 수령이 완료되었습니다.");
    }

    // 보유 쿠폰 전체 조회(소비자)
    @GetMapping("/receive/list")
    public ResponseEntity<List<ReceiveCouponResponseDto>> getUserCoupons(HttpServletRequest request){
        List<ReceiveCouponResponseDto> userCoupons = couponService.getUserCoupons(request);
        return ResponseEntity.ok(userCoupons);
    }

    // 쿠폰 바코드 생성
    @PostMapping("/qrcode")
    public ResponseEntity<CouponQRCodeResponseDto> createCouponQR(@Valid @RequestBody CouponQRCodeRequestDto couponQRCodeRequestDto){
        CouponQRCodeResponseDto responseDto = couponService.createCouponQR(couponQRCodeRequestDto);
        return ResponseEntity.status(HttpStatus.OK)
                .body(responseDto);
    }

    // 쿠폰 바코드 인식
    @PostMapping("/check")
        public ResponseEntity<CouponQRCodeCheckResponseDto> checkCouponBarcode(HttpServletRequest request, @Valid @RequestBody CouponQRCodeCheckRequestDto couponQRCodeCheckRequestDto){
        CouponQRCodeCheckResponseDto responseDto = couponService.checkCouponBarcode(request, couponQRCodeCheckRequestDto);
        return ResponseEntity.status(HttpStatus.OK).body(responseDto);
    }
}
