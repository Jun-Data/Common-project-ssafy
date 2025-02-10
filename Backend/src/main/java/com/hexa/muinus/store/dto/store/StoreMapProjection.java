package com.hexa.muinus.store.dto.store;

import java.math.BigDecimal;

public interface StoreMapProjection {
    int getStoreNo();
    String getName();
    Double getLocationX();
    Double getLocationY();
    double getDistance();
}