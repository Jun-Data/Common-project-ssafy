package com.hexa.muinus.common.exception;


import lombok.Getter;
import lombok.RequiredArgsConstructor;
/**
 * 800 S3
 */
@Getter
@RequiredArgsConstructor
public enum S3ErrorCode implements ErrorCode {
    EMPTY_FILE_EXCEPTION(80000, "업로드할 파일이 비어있습니다."),
    NO_FILE_EXTENTION(80001, "파일에 확장자가 없습니다."),
    INVALID_FILE_EXTENTION(80002, "지원하지 않는 파일 확장자입니다."),
    IO_EXCEPTION_ON_IMAGE_UPLOAD(80003, "이미지 업로드 중 IO 예외가 발생했습니다."),
    PUT_OBJECT_EXCEPTION(80004, "S3에 객체를 업로드하는 중 예외가 발생했습니다."),
    IO_EXCEPTION_ON_IMAGE_DELETE(80005, "이미지 삭제 중 IO 예외가 발생했습니다."),

    ;
    private final int code;
    private final String message;
}