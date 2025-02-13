package com.hexa.muinus.store.domain.coupon.repository;

import com.hexa.muinus.store.domain.coupon.Coupon;
import com.hexa.muinus.store.domain.coupon.CouponHistory;
import com.hexa.muinus.store.domain.coupon.CouponHistoryId;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.store.dto.coupon.CouponListResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CouponHistoryRepository extends JpaRepository<CouponHistory, CouponHistoryId> {

    Optional<CouponHistory> findById(CouponHistoryId id);

    Optional<CouponHistory> findByStoreAndCoupon(Store store, Coupon coupon);

    List<CouponHistory> findById_StoreNo(Integer storeNo);

    @Modifying
    @Query("UPDATE CouponHistory c SET c.count = c.count - 1, c.version = c.version + 1 WHERE c.id = :couponHistoryId AND c.count > 0")
    int decreaseCouponCount(@Param("couponHistoryId") CouponHistoryId couponHistoryId);

}
