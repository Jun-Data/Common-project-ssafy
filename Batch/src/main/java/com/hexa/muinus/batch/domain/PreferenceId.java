package com.hexa.muinus.batch.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
public class PreferenceId {
    private Long userNo;
    private Long itemId;
    private LocalDate updatedAt;
}
