package com.hexa.muinus.users.domain.coupon.repository;

import com.hexa.muinus.users.domain.coupon.UserCouponHistory;
import com.hexa.muinus.users.domain.coupon.UserCouponHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserCouponHistoryRepository extends JpaRepository<UserCouponHistory, UserCouponHistoryId> {

    Optional<UserCouponHistory> findById_UserNoAndId_CouponIdAndId_StoreNoAndUsedAtIsNull(Integer userNo, Integer couponId, Integer storeNo);

    boolean existsByIdAndUsedAtIsNull(UserCouponHistoryId id);

    boolean existsById(UserCouponHistoryId id);

    @Query("SELECT uch FROM UserCouponHistory uch WHERE uch.user.userNo = :userNo AND uch.usedAt IS NULL")
    List<UserCouponHistory> findUnusedCouponsByUser(@Param("userNo") Integer userNo);


}
