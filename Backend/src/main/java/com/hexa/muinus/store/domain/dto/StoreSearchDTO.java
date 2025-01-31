package com.hexa.muinus.store.domain.dto;

import com.hexa.muinus.store.domain.Store;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

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
    private int salePrice;
    private int discountRate;
    private int discountPrice;
    private int quantity;
    private Store.YesNo flimarketYn;
}
