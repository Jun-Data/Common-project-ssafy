package com.hexa.muinus.elasticsearch.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchNativeDTO {
    @NotNull(message = "검색어가 없을 때는 다른 검색을 요청해주세요.")
    private String query;
}
