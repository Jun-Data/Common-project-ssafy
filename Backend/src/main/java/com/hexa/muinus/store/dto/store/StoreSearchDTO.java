package com.hexa.muinus.store.dto.store;

import com.hexa.muinus.common.enums.YesNo;
import com.hexa.muinus.store.domain.store.repository.StoreRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreSearchDTO {
    private Integer storeNo;
    private String storeName;
    private Double locationX;
    private Double locationY;
    private String address;
    private String phone;
    private String itemName;
    private Integer salePrice;
    private Integer discountRate;
    private Integer discountPrice; // 할인된 금액
    private Integer finalPrice; // 최종 할인 적용된 금액
    private Integer quantity;
    private YesNo flimarketYn;
    private Double distance; // 검색 위치와의 거리(m)

    public StoreSearchDTO(StoreRepository.StoreSearchProjection projection) {
        this.storeNo = projection.getStoreNo();
        this.storeName = projection.getName();
        this.locationX = projection.getLocationX();
        this.locationY = projection.getLocationY();
        this.address = projection.getAddress();
        this.phone = projection.getPhone();
        this.itemName = projection.getItemName();
        this.salePrice = projection.getSalePrice();
        this.discountRate = projection.getDiscountRate();
        this.quantity = projection.getQuantity();
        this.distance = projection.getDistance();

        this.flimarketYn = flimarketYnConvertYesNo(projection.getFlimarketYn());
        this.discountPrice = calculateDiscountPrice(salePrice, discountRate);
        this.finalPrice = salePrice - this.discountPrice;
    }

    /**
     * convert from Character to YesNo
     * @param flimarketYn
     * @return
     */
    private YesNo flimarketYnConvertYesNo(Character flimarketYn) {
        switch (flimarketYn) {
            case 'Y': return YesNo.Y;
            case 'N': return YesNo.N;
        }
        return YesNo.N;
    }

    /**
     * 할인 금액 계산
     * @param price
     * @param discountRate
     * @return
     */
    private int calculateDiscountPrice(Integer price, Integer discountRate) {
        return (price * discountRate) / 100; // 할인된 금액
    }

}
