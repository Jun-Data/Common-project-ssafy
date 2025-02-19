package com.hexa.muinus.elasticsearch.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.GeoPointField;
import org.springframework.data.elasticsearch.core.geo.GeoPoint;

import java.time.LocalDateTime;

@Data
@Document(indexName = "store_items")
@JsonIgnoreProperties(ignoreUnknown = true)
public class ESStoreItem {

    @Id
    @Field(name = "store_item_id", type = FieldType.Long)
    private Long storeItemId;

    @Field(name = "item_id", type = FieldType.Long)
    private Integer itemId;

    @Field(name = "store_no", type = FieldType.Integer)
    private Integer storeNo;

    @Field(name = "quantity", type = FieldType.Integer)
    private Integer quantity;

    @Field(name = "sale_price", type = FieldType.Integer)
    private Integer salePrice;

    @Field(name = "discount_rate", type = FieldType.Integer)
    private Integer discountRate;

    @Field(name = "updated_at", type = FieldType.Date)
    private LocalDateTime updatedAt;

    @Field(name = "store_name", type = FieldType.Text, analyzer = "korean_analyzer")
    private String storeName;

    @Field(name = "address", type = FieldType.Text, analyzer = "korean_analyzer")
    private String address;

    @Field(name = "lat", type = FieldType.Double)
    private Double lat;

    @Field(name = "lon", type = FieldType.Double)
    private Double lon;

    @GeoPointField
    private GeoPoint location;

    @Transient
    private Integer distance;
}
