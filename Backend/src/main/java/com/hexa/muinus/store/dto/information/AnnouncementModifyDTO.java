package com.hexa.muinus.store.dto.information;

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
public class AnnouncementModifyDTO {

    @Positive(message = "유효한 boardId 입력해주세요.")
    private Integer boardId;

//    @NotNull(message = "유효한 email을 입력해주세요.")
//    @Email
//    private String userEmail;

    @NotBlank(message = "제목을 입력해주세요")
    private String title;

    @NotNull(message = "내용을 입력해주세요")
    private String content;

    private String boardImageUrl;
}
