package com.hexa.muinus.elasticsearch.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

import java.time.LocalDateTime;

@Data
@Document(indexName = "items")
@JsonIgnoreProperties(ignoreUnknown = true)
@Setting(settingPath = "/elasticsearch/index-settings.json")
public class ESItem {

    @Id
    @Field(name = "item_id", type = FieldType.Long)
    @JsonProperty("item_id")
    private Integer itemId;

    @Field(name = "barcode", type = FieldType.Keyword)
    private String barcode;

    @MultiField(
            mainField = @Field(name = "item_name", type = FieldType.Text, analyzer = "standard", searchAnalyzer = "standard"),
            otherFields = {
                    @InnerField(suffix = "nori", type = FieldType.Text, analyzer = "custom_analyzer", searchAnalyzer = "custom_search_analyzer"),
                    @InnerField(suffix = "nori_shingle", type = FieldType.Text, analyzer = "custom_analyzer", searchAnalyzer = "custom_shingle_search_analyzer"),
                    @InnerField(suffix = "nori_min2", type = FieldType.Text, analyzer = "custom_analyzer", searchAnalyzer = "custom_min2_search_analyzer")
            }
    )
    @JsonProperty("item_name")
    private String itemName;

    @Field(name = "brand", type = FieldType.Keyword)
    private String brand;

    @Field(name = "calories", type = FieldType.Integer)
    private Integer calories;

    @Field(name = "protein", type = FieldType.Integer)
    private Integer protein;

    @Field(name = "fat", type = FieldType.Integer)
    private Integer fat;

    @Field(name = "carbohydrate", type = FieldType.Integer)
    private Integer carbohydrate;

    @Field(name = "sugars", type = FieldType.Integer)
    private Integer sugars;

    @Field(name = "weight", type = FieldType.Integer)
    private Integer weight;

    @Field(name = "item_image_url", type = FieldType.Keyword)
    private String itemImageUrl;

    @Field(name = "updated_at", type = FieldType.Date)
    private LocalDateTime updatedAt;

    @Field(name = "suggest")
    private Object suggest;
}
