package com.hexa.muinus.store.dto.store;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreMapDTO {

    private int storeNo;
    private String name;
    private Double locationX; // 경도
    private Double locationY; // 위도
    private Double distance; // 검색 위치와의 거리(m)

    public StoreMapDTO(StoreMapProjection projection) {
        this.storeNo = projection.getStoreNo();
        this.name = projection.getName();
        this.locationX = projection.getLocationX();
        this.locationY = projection.getLocationY();
        this.distance = projection.getDistance();
    }
}
