package com.hexa.muinus.store.dto.kiosk;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PaymentRequestDTO {

    private Integer storeNo;
    private Integer couponId;
    private List<ItemsForPayment> itemsForPayment;
    private List<FliItemsForPayment> fliItemsForPayment;
    private Integer totalPrice;
}
