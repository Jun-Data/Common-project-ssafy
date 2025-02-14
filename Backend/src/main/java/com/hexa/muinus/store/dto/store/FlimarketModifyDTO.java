package com.hexa.muinus.store.dto.store;

import com.hexa.muinus.common.enums.YesNo;
import com.hexa.muinus.common.validator.StoreFlimarketValidator;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@StoreFlimarketValidator
public class FlimarketModifyDTO {

//    @NotBlank(message = "유효하지 않은 email입니다.")
//    @Email
//    private String userEmail;

    @NotNull(message = "플리마켓 허용 여부를 선택해주세요.")
    private YesNo flimarketYn;

    // flimarketYn : Y일 때 NotNull
    private String flimarketImageUrl;
    private Integer flimarketSectionCnt;
}
