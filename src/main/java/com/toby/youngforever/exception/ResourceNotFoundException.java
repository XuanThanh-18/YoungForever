package com.toby.youngforever.exception;

public class ResourceNotFoundException extends AppException {
    public ResourceNotFoundException(String resourceName) {
        super(ErrorCode.NOT_FOUND, resourceName + " không tìm thấy");
    }
}
