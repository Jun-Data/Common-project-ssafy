package com.hexa.muinus.store.domain.coupon.repository;

import com.hexa.muinus.store.domain.coupon.Coupon;
import com.hexa.muinus.store.domain.coupon.CouponHistory;
import com.hexa.muinus.store.domain.coupon.CouponHistoryId;
import com.hexa.muinus.store.domain.store.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CouponHistoryRepository extends JpaRepository<CouponHistory, CouponHistoryId> {

    Optional<CouponHistory> findById(CouponHistoryId id);

    Optional<CouponHistory> findByStoreAndCoupon(Store store, Coupon coupon);

    List<CouponHistory> findById_StoreNo(Integer storeNo);
}
