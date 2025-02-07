package com.hexa.muinus.users.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponBarcodeCheckResponseDto {
    private Integer couponId;
    private Integer storeNo;
    private Integer userNo;
    private String message;// 해당 가게에 유효한 쿠폰 바코드인지 아닌지
}
