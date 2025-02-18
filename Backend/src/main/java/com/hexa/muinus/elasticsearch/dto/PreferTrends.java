package com.hexa.muinus.elasticsearch.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreferTrends {
    int itemId;
    String itemName;
    float trendRating;
    int purchaseCount;

    public PreferTrends(PreferTrendsProjection projection) {
        this.itemId = projection.getItemId();
        this.itemName = projection.getItemName();
        this.trendRating = projection.getTrendRating();
        this.purchaseCount = projection.getPurchaseCount();
    }

}
