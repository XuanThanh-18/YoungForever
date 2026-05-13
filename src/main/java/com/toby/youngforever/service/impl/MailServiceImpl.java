package com.toby.youngforever.service.impl;

import com.toby.youngforever.config.AppProperties;
import com.toby.youngforever.service.MailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    @Async
    @Override
    public void sendEmailVerification(String toEmail, String fullName, String otpCode) {
        String subject = "YoungForever – Xác thực email của bạn";
        String html = buildOtpEmail(fullName, otpCode,
                "Mã xác thực email của bạn",
                "Nhập mã bên dưới để hoàn tất đăng ký tài khoản YoungForever:");
        send(toEmail, subject, html);
    }

    @Async
    @Override
    public void sendPasswordResetOtp(String toEmail, String fullName, String otpCode) {
        String subject = "YoungForever – Đặt lại mật khẩu";
        String html = buildOtpEmail(fullName, otpCode,
                "Đặt lại mật khẩu",
                "Nhập mã bên dưới để đặt lại mật khẩu của bạn. Mã có hiệu lực trong 15 phút:");
        send(toEmail, subject, html);
    }

    @Async
    @Override
    public void sendOrderConfirmation(String toEmail, String fullName, String orderNumber) {
        String subject = "YoungForever – Xác nhận đơn hàng #" + orderNumber;
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                  <h2 style="color:#e91e63;">YoungForever 🌸</h2>
                  <p>Xin chào <strong>%s</strong>,</p>
                  <p>Cảm ơn bạn đã đặt hàng tại YoungForever!</p>
                  <p>Mã đơn hàng của bạn: <strong style="font-size:18px;">%s</strong></p>
                  <p>Chúng tôi sẽ thông báo khi đơn hàng được giao đi.</p>
                  <hr/>
                  <p style="color:#999;font-size:12px;">YoungForever – Premium Beauty</p>
                </div>
                """.formatted(fullName, orderNumber);
        send(toEmail, subject, html);
    }

    // ── Private helpers ──────────────────────────────────────
    private String buildOtpEmail(String fullName, String otpCode,
                                 String heading, String instruction) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
                  <h2 style="color:#e91e63;">YoungForever 🌸</h2>
                  <h3>%s</h3>
                  <p>Xin chào <strong>%s</strong>,</p>
                  <p>%s</p>
                  <div style="text-align:center;margin:30px 0;">
                    <span style="font-size:36px;font-weight:bold;letter-spacing:8px;
                                 color:#e91e63;border:2px dashed #e91e63;padding:12px 24px;">
                      %s
                    </span>
                  </div>
                  <p style="color:#888;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
                  <hr/>
                  <p style="color:#999;font-size:12px;">YoungForever – Premium Beauty</p>
                </div>
                """.formatted(heading, fullName, instruction, otpCode);
    }

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(
                    appProperties.getMail().getFrom(),
                    appProperties.getMail().getFromName());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Mail sent to {}: {}", to, subject);
        } catch (Exception ex) {
            log.error("Failed to send mail to {}: {}", to, ex.getMessage());
        }
    }
}