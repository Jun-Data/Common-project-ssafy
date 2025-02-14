package com.hexa.muinus.users.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CouponQRCodeRequestDto {

    @NotNull(message = "쿠폰 ID는 필수 입력 항목입니다.")
    private Integer couponId;

    @NotNull(message = "가게 번호는 필수 입력 항목입니다.")
    private Integer storeNo;

    @NotNull(message = "사용자 번호는 필수 입력 항목입니다.")
    private Integer userNo;


}
