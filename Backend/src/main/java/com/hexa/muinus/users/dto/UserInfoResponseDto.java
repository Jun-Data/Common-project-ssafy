package com.hexa.muinus.users.dto;

import com.hexa.muinus.users.domain.user.Users;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserInfoResponseDto {

    private Integer userNo;
    private String userName;
    private Integer storeNo;
    private String userEmail;
    private Users.UserType userType;
}
