package com.hexa.muinus.users.domain.coupon.repository;

import com.hexa.muinus.users.domain.coupon.UserCouponHistory;
import com.hexa.muinus.users.domain.coupon.UserCouponHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCouponHistoryRepository extends JpaRepository<UserCouponHistory, UserCouponHistoryId> {

    Optional<UserCouponHistory> findById_UserNoAndId_CouponIdAndId_StoreNoAndUsedAtIsNull(Integer userNo, Integer couponId, Integer storeNo);

    boolean existsByIdAndUsedAtIsNull(UserCouponHistoryId id);

    boolean existsById(UserCouponHistoryId id);

    //특정 사용자의 모든 쿠폰을 조회
    List<UserCouponHistory> findByUser_userNo(Integer userNo);

}
