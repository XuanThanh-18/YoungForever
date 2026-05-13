package com.toby.youngforever.service.impl;

import com.toby.youngforever.config.AppProperties;
import com.toby.youngforever.dto.request.*;
import com.toby.youngforever.dto.response.AuthResponse;
import com.toby.youngforever.entity.User;
import com.toby.youngforever.enums.UserRole;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.mapper.UserMapper;
import com.toby.youngforever.repository.UserRepository;
import com.toby.youngforever.security.JwtService;
import com.toby.youngforever.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements com.toby.youngforever.service.AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final MailService mailService;
    private final AppProperties appProperties;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .role(UserRole.ROLE_USER)
                .isActive(true)
                .isVerified(false)
                .build();

        // Generate OTP for email verification
        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));

        user = userRepository.save(user);

        // Send verification email (async)
        mailService.sendEmailVerification(user.getEmail(), user.getFullName(), otp);

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            // Spring Security authenticates via UserDetailsServiceImpl (username = userId)
            // We first find user by email, then authenticate by userId
            User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getId().toString(), request.getPassword())
            );

            if (!user.getIsActive()) {
                throw new AppException(ErrorCode.ACCOUNT_DISABLED);
            }

            log.info("User logged in: {}", user.getEmail());
            return buildAuthResponse(user);

        } catch (AuthenticationException ex) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        if (jwtService.isTokenExpired(token)) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        String userId = jwtService.extractSubject(token);
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Validate stored refresh token (rotation)
        if (!token.equals(user.getRefreshToken())) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }

        return buildAuthResponse(user);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail().toLowerCase())
                .ifPresent(user -> {
                    String otp = generateOtp();
                    user.setOtpCode(otp);
                    user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
                    userRepository.save(user);
                    mailService.sendPasswordResetOtp(user.getEmail(), user.getFullName(), otp);
                });
        // Always return OK to prevent email enumeration
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        validateOtp(user, request.getOtpCode());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setRefreshToken(null); // Invalidate all sessions
        userRepository.save(user);
    }

    @Override
    public void verifyEmail(String email, String otpCode) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        validateOtp(user, otpCode);

        user.setIsVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    // ── Helpers ───────────────────────────────────────────
    public AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Rotate refresh token
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(
                LocalDateTime.now().plus(
                        Duration.ofMillis(
                                appProperties.getJwt().getRefreshTokenExpiryMs()
                        )
                )
        );

        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(appProperties.getJwt().getAccessTokenExpiryMs() / 1000)
                .user(userMapper.toResponse(user))
                .build();
    }

    public void validateOtp(User user, String otpCode) {
        if (user.getOtpCode() == null
                || !user.getOtpCode().equals(otpCode)
                || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }
    }

    public String generateOtp() {
        return String.format("%06d", new Random().nextInt(1_000_000));
    }
}
