package com.hexa.muinus.common.exception.store;

import com.hexa.muinus.common.exception.ErrorCode;
import com.hexa.muinus.common.exception.MuinusException;

public class StoreRegistrationNoDuplicateException extends MuinusException {
    public StoreRegistrationNoDuplicateException(String registrationNo) {
        super(ErrorCode.STORE_REGISTRATION_NO_DUPLICATE, "registrationNo: " + registrationNo);
    }
}
