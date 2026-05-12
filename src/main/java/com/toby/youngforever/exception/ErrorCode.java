package com.toby.youngforever.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // Auth
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token đã hết hạn"),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Token không hợp lệ"),
    ACCOUNT_DISABLED(HttpStatus.FORBIDDEN, "Tài khoản đã bị vô hiệu hóa"),
    EMAIL_NOT_VERIFIED(HttpStatus.FORBIDDEN, "Email chưa được xác thực"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email đã được đăng ký"),
    OTP_INVALID(HttpStatus.BAD_REQUEST, "Mã OTP không hợp lệ hoặc đã hết hạn"),

    // Resource
    NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên"),
    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"),
    ORDER_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"),

    // Business
    OUT_OF_STOCK(HttpStatus.BAD_REQUEST, "Sản phẩm đã hết hàng"),
    INSUFFICIENT_STOCK(HttpStatus.BAD_REQUEST, "Số lượng sản phẩm không đủ"),
    COUPON_NOT_FOUND(HttpStatus.NOT_FOUND, "Mã giảm giá không tồn tại"),
    COUPON_EXPIRED(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết hạn"),
    COUPON_USED(HttpStatus.BAD_REQUEST, "Bạn đã sử dụng mã giảm giá này"),
    COUPON_USAGE_EXCEEDED(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết lượt sử dụng"),
    ORDER_MIN_VALUE(HttpStatus.BAD_REQUEST, "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã"),
    CANNOT_CANCEL_ORDER(HttpStatus.BAD_REQUEST, "Không thể hủy đơn hàng ở trạng thái này"),
    ALREADY_REVIEWED(HttpStatus.CONFLICT, "Bạn đã đánh giá sản phẩm này"),
    REVIEW_NOT_PURCHASED(HttpStatus.FORBIDDEN, "Bạn cần mua sản phẩm để đánh giá"),

    // Validation
    VALIDATION_FAILED(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ"),
    FILE_TOO_LARGE(HttpStatus.BAD_REQUEST, "File quá lớn"),
    INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "Định dạng file không được hỗ trợ"),

    // System
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi hệ thống");

    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }
}
