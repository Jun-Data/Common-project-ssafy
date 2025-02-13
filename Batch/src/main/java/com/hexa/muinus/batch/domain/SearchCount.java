package com.hexa.muinus.batch.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchCount {
    private int userNo;
    private int itemId;
    private int count;
}
