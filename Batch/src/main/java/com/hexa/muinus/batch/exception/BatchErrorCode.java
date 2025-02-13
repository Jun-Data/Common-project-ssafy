package com.hexa.muinus.batch.exception;

import lombok.Getter;

@Getter
public enum BatchErrorCode {
    API_CALL_FAILED(60001, "배치 처리 중 API 호출 실패"),
    DATABASE_QUERY_FAILED(60002, "배치 처리 중 DB 조회 실패"),
    DATA_PROCESSING_ERROR(60003, "배치 데이터 처리 중 오류 발생"),
    FILE_READ_ERROR(60004, "파일을 읽는 중 오류 발생"),
    FILE_WRITE_ERROR(60005, "파일을 저장하는 중 오류 발생"),
    JOB_EXECUTION_FAILED(60006, "배치 Job 실행 실패"),
    STEP_EXECUTION_FAILED(60007, "배치 Step 실행 실패"),
    ROW_MAPPER_ERROR(60008, "RowMapper 변환 중 오류 발생"),
    SQL_EXECUTION_ERROR(60009, "SQL 실행 중 오류 발생"),
    JOB_REPOSITORY_INIT_FAILED(60010, "JobRepository 초기화 실패"),
    JOB_CREATION_FAILED(60011, "배치 Job 생성 실패"),
    STEP_CREATION_FAILED(60012, "배치 Step 생성 실패"),
    READER_INITIALIZATION_FAILED(60013, "Reader 초기화 실패"),
    WRITER_INITIALIZATION_FAILED(60014, "Writer 초기화 실패"),
    DATABASE_CONNECTION_FAILED(60015, "메타 데이터 DB 연결 실패"),
    TRANSACTION_MANAGER_INIT_FAILED(60016, "트랜잭션 매니저 초기화 실패"),
    ENTITY_MANAGER_INIT_FAILED(60017, "EntityManager 초기화 실패"),
    SCHEMA_INITIALIZATION_FAILED(60018, "배치 스키마 초기화 실패"),
    UNKNOWN_ERROR(69999, "배치 처리 중 알 수 없는 오류 발생")
    ;

    private final int code;
    private final String message;

    BatchErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
