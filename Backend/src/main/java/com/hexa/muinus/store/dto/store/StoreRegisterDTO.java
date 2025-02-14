package com.hexa.muinus.store.dto.store;

import com.hexa.muinus.common.enums.YesNo;
import com.hexa.muinus.common.validator.StoreFlimarketValidator;
import com.hexa.muinus.store.domain.store.Store;
import com.hexa.muinus.users.domain.user.Users;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@StoreFlimarketValidator
public class StoreRegisterDTO {

//    @NotBlank(message = "유효하지 않은 email입니다.")
//    @Email
//    private String userEmail;

    @NotBlank(message = "매장 이름을 입력해주세요.")
    private String name;

    @Digits(integer = 3, fraction = 7, message = "경도는 정수 3자리, 소수점 7자리 이내입니다.")
    private BigDecimal locationX;

    @Digits(integer = 3, fraction = 7, message = "위도는 정수 3자리, 소수점 7자리 이내입니다.")
    private BigDecimal locationY;

    @NotBlank(message = "주소를 입력해주세요.")
    private String address;

    private String storeImageUrl;

    @NotBlank(message = "사업자등록번호를 입력해주세요.")
    private String registrationNo;

    @NotBlank(message = "번호를 입력해주세요.")
    private String phone;

    @NotNull(message = "플리마켓 허용 여부를 선택해주세요.")
    private YesNo flimarketYn = YesNo.N;

    private String flimarketImageUrl;

    private Integer flimarketSectionCnt;



    /**
     * Store Regist를 위한 DTO -> Entity 변환
     *
     * @param user 가게를 등록하는 유저 객체(점주)
     * @return Store Entity 객체
     * - storeNo 제외 : Auto Increment
     * - createdAt 제외 : Default
     */
    public Store toEntity(Users user) {
        return Store.builder()
                .user(user)
                .name(this.name)
                .locationX(locationX)
                .locationY(locationY)
                .address(this.address)
                .storeImageUrl(this.storeImageUrl)
                .registrationNo(this.registrationNo)
                .phone(this.phone)
                .flimarketYn(this.flimarketYn)
                .flimarketImageUrl(this.flimarketImageUrl)
                .flimarketSectionCnt(this.flimarketSectionCnt == null ? 0 : this.flimarketSectionCnt)
                .deleted(YesNo.N)
                .build();
    }

}
