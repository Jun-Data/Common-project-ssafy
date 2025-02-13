package com.hexa.muinus.batch.exception;

import lombok.Getter;

@Getter
public class BatchProcessingException extends RuntimeException {
    private final BatchErrorCode errorCode;

    public BatchProcessingException(BatchErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BatchProcessingException(BatchErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
    }
}
