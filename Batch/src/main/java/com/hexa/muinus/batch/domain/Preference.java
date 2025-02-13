package com.hexa.muinus.batch.domain;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
public class Preference {
    private PreferenceId id;
    private BigDecimal dailyScore;
    private BigDecimal monthlyScore;

    public Long getUserNo() {
        return id != null ? id.getUserNo() : null;
    }

    public Long getItemId() {
        return id != null ? id.getItemId() : null;
    }

    public LocalDate getUpdatedDate() { return id != null ? id.getUpdatedAt() : null; }

}
