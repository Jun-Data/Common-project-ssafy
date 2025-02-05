package com.hexa.muinus.store.dto.fli;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FliRequestDTO {
    private int storeId;
    private int userId;

    @Positive(message = "유효한 계좌번호를 입력해주세요.")
    private String userAccount;
    @Positive(message = "유효한 은행명을 입력해주세요.")
    private String userBank;
    @Positive(message = "유효한 소유주를 입력해주세요.")
    private String accountName;
    @Positive(message = "유효한 상품 이름을 입력해주세요.")
    private String itemName;
    @Positive(message = "유효한 양을 입력해주세요.")
    private int quantity;
    @Positive(message = "유효한 가격을 입력해주세요.")
    private int price;
    @Positive(message = "유효한 구역을 입력해주세요.")
    private int sectionNumber;
    @Positive(message = "유효한 만료기간을 입력해주세요.")
    private int expirationDate;

}
