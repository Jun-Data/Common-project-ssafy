package com.hexa.muinus.common.exception.item;

import com.hexa.muinus.common.exception.ErrorCode;
import com.hexa.muinus.common.exception.MuinusException;

public class BarcodeGenerationFailedException extends MuinusException {
    public BarcodeGenerationFailedException() {
        super(ErrorCode.BARCODE_GENERATION_FAILED);
    }
}