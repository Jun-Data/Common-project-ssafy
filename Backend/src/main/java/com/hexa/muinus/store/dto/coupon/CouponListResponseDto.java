package com.hexa.muinus.store.dto.coupon;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CouponListResponseDto {
    private Integer storeNo;
    private Integer couponId;
    private String name;
    private Integer discountRate;
    private Integer count;
    private String content;
    private LocalDateTime expirationDate;
}
