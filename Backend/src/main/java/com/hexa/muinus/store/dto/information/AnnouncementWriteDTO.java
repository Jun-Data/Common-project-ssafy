package com.hexa.muinus.store.dto.information;

import com.hexa.muinus.store.domain.information.Announcement;
import com.hexa.muinus.store.domain.store.Store;
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
public class AnnouncementWriteDTO {

//    @NotNull(message = "유효한 email을 입력해주세요.")
//    @Email
//    private String userEmail;

    @NotBlank(message = "제목을 입력해주세요")
    private String title;

    @NotNull(message = "내용을 입력해주세요")
    private String content;

    private String boardImageUrl;

    public Announcement toEntity(Store store){
        return Announcement.builder()
                .store(store)
                .title(title)
                .content(content)
                .boardImageUrl(boardImageUrl)
                .build();
    }
}
