package com.hexa.muinus.common.exception.coupon;

import com.hexa.muinus.common.exception.APIErrorCode;
import com.hexa.muinus.common.exception.MuinusException;

public class CouponAlreadyClaimedException extends MuinusException {
    public CouponAlreadyClaimedException() {
        super(APIErrorCode.COUPON_ALREADY_CLAIMED);
    }
    public CouponAlreadyClaimedException(int storeNo, int couponId, int userNo) {
        super(APIErrorCode.COUPON_ALREADY_CLAIMED, String.format("storeNo: %d, couponId %d, userNo: %d", storeNo, couponId, userNo));
    }
}