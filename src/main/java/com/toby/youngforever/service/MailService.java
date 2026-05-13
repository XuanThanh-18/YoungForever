package com.toby.youngforever.service;

public interface MailService {
    void sendEmailVerification(String toEmail, String fullName, String otpCode);
    void sendPasswordResetOtp(String toEmail, String fullName, String otpCode);
    void sendOrderConfirmation(String toEmail, String fullName, String orderNumber);
}