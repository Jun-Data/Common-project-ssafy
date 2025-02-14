package com.hexa.muinus.store.dto.store;

import com.hexa.muinus.common.enums.YesNo;
import com.hexa.muinus.common.validator.StoreFlimarketValidator;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@StoreFlimarketValidator
public class StoreModifyDTO {

    @NotBlank(message = "매장 이름을 입력해주세요.")
    private String name;

    private String storeImageUrl;

    @NotBlank(message = "번호를 입력해주세요.")
    private String phone;

    @NotNull(message = "플리마켓 허용 여부를 선택해주세요.")
    private YesNo flimarketYn;

    // flimarketYn : Y일 때 NotNull
    private String flimarketImageUrl;
    private Integer flimarketSectionCnt;

}
