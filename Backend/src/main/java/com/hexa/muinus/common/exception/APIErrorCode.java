package com.hexa.muinus.common.exception;

import lombok.Getter;

//  0 : 기본
// 10 : user
// 20 : store
// 30 : coupon
// 40 : fli/item
// 50 : barcode/qr

@Getter
public enum APIErrorCode implements ErrorCode {
    // 400 Bad Request
    BAD_REQUEST(40000, "Bad Request"),
    INVALID_INPUT(40001, "유효하지 않은 값입니다."),
    INVALID_BARCODE_DATA(40050, "유효하지 않은 바코드 데이터입니다."),
    INVALID_QR_DATA(40051, "유효하지 않은 QR코드입니다."),

    // 401 Unauthorized
    UNAUTHORIZED(40100, "Unauthorized"),
    REFRESH_TOKEN_REQUIRED(40110, "Refresh Token이 존재하지 않습니다."),
    INVALID_REFRESH_TOKEN(40111, "유효하지 않은 Refresh Token입니다."),
    INVALID_ACCESS_TOKEN(40112, "유효하지 않은 Access Token입니다."),
    UNREGISTERED_USER(40113, "등록되지 않은 사용자입니다."),

    // 403 Forbidden
    FORBIDDEN(40300, "Forbidden"),
    USER_NOT_FORBIDDEN(40311, "접근이 허용되지 않은 사용자입니다."),
    STORE_NOT_FORBIDDEN(40321, "매장 정보에 접근할 권한이 없습니다."),
    BOARD_FORBIDDEN(40322, "공지사항을 수정할 권한이 없습니다."),
    COUPON_ACCESS_FORBIDDEN(40330, "쿠폰 생성 권한이 없습니다."),

    // 404 Not Found
    NOT_FOUND(40400, "Not Found"),
    USER_NOT_FOUND(40410, "존재하지 않는 사용자입니다."),
    STORE_NOT_FOUND(40420, "존재하지 않는 매장입니다."),
    COUPON_NOT_FOUND(40430, "존재하지 않는 쿠폰입니다."),
    COUPON_NOT_ISSUED(40431, "발행되지 않은 쿠폰입니다."),
    AVAILABLE_COUPON_NOT_FOUND(40432, "사용 가능한 쿠폰이 없습니다."),
    ITEM_NOT_FOR_SALE(40440, "존재하지 않는 상품입니다."),
    STORE_ITEM_NOT_FOR_SALE(40441, "판매하지 않는 상품입니다."),
    FLI_ITEM_NOT_FOUND(40442, "판매하지 않는 플리마켓 상품입니다."),
    SECTION_FLI_ITEM_NOT_FOUND(40443, "해당 섹션에는 상품이 없습니다."),

    // 409 Conflict
    CONFLICT(40900, "Conflict"),
    USER_EMAIL_DUPLICATE(40910, "이미 가입된 이메일입니다."),
    FAVORITE_STORE_DUPLICATE(40911, "이미 즐겨찾기 목록에 추가된 매장입니다."),
    STORE_LOCATION_DUPLICATE(40920, "이미 매장으로 등록된 위치입니다."),
    STORE_REGISTRATION_NO_DUPLICATE(40921, "이미 등록된 사업자등록번호 입니다."),
    STORE_ALREADY_REGISTERED(40922, "이미 매장이 등록된 사용자입니다."),
    COUPON_ALREADY_CLAIMED(40930, "이미 쿠폰을 수령하였습니다."),
    COUPON_ALREADY_USED(40931, "이미 사용된 쿠폰입니다."),
    USER_ALREADY_REQUESTED_ITEM(40932, "하루 1회만 입고 요청이 가능합니다."),


    // 410 Gone
    GONE(41000, "Gone"),
    COUPON_EXPIRED(41030, "쿠폰의 유효 기간이 만료되었습니다."),
    COUPON_OUT_OF_STOCK(41030, "더 이상 발급 가능한 쿠폰이 없습니다."),

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR(50000, "Internal server error"),
    BARCODE_GENERATION_FAILED(50050, "바코드 생성에 실패했습니다."),
    BARCODE_PARSING_ERROR(50051, "바코드 데이터 파싱 중 오류가 발생했습니다."),
    QR_GENERATION_FAILED(50052, "QR코드 생성에 실패했습니다."),
    QR_PARSING_ERROR(50053, "QR코드 데이터 파싱 중 오류가 발생했습니다."),

    ;

    private final int code;
    private final String message;

    APIErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

}
