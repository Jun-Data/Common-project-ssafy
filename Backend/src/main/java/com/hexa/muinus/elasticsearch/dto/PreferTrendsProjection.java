package com.hexa.muinus.elasticsearch.dto;

public interface PreferTrendsProjection {
    int getItemId();
    String getItemName();
    float getTrendRating(); // 전체 구매 개수 대비 아이템 구매 개수
    int getPurchaseCount(); // 사용자의 구매 횟수
}
