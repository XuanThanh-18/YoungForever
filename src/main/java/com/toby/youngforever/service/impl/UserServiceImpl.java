package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.request.ChangePasswordRequest;
import com.toby.youngforever.dto.request.CreateAddressRequest;
import com.toby.youngforever.dto.request.UpdateProfileRequest;
import com.toby.youngforever.dto.response.AddressResponse;
import com.toby.youngforever.dto.response.NotificationResponse;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.dto.response.UserResponse;
import com.toby.youngforever.entity.Address;
import com.toby.youngforever.entity.User;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.mapper.UserMapper;
import com.toby.youngforever.repository.AddressRepository;
import com.toby.youngforever.repository.NotificationRepository;
import com.toby.youngforever.repository.UserRepository;
import com.toby.youngforever.service.NotificationService;
import com.toby.youngforever.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    // ── Profile ──────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(UUID userId) {
        return userMapper.toResponse(findUser(userId));
    }

    @Override
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUser(userId);
        if (request.getFullName() != null) user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null)    user.setPhone(request.getPhone());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public String uploadAvatar(UUID userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED);
        }
        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }
        if (file.getSize() > 5 * 1024 * 1024) { // 5 MB limit
            throw new AppException(ErrorCode.FILE_TOO_LARGE);
        }

        // For now store as data-URI; replace with Cloudinary when configured
        try {
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
            String dataUri = "data:" + contentType + ";base64," + base64;

            User user = findUser(userId);
            user.setAvatarUrl(dataUri);
            userRepository.save(user);
            return dataUri;
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    @Override
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = findUser(userId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        // Invalidate all refresh tokens
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        userRepository.save(user);
    }

    // ── Addresses ────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(UUID userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream().map(this::toAddressResponse).toList();
    }

    @Override
    public AddressResponse createAddress(UUID userId, CreateAddressRequest request) {
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.clearDefaultByUserId(userId);
        }

        User user = findUser(userId);
        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .street(request.getStreet())
                .ward(request.getWard())
                .district(request.getDistrict())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        return toAddressResponse(addressRepository.save(address));
    }

    @Override
    public AddressResponse updateAddress(UUID userId, UUID addressId, CreateAddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (request.getFullName() != null)  address.setFullName(request.getFullName());
        if (request.getPhone() != null)     address.setPhone(request.getPhone());
        if (request.getStreet() != null)    address.setStreet(request.getStreet());
        if (request.getWard() != null)      address.setWard(request.getWard());
        if (request.getDistrict() != null)  address.setDistrict(request.getDistrict());
        if (request.getCity() != null)      address.setCity(request.getCity());
        if (request.getPostalCode() != null) address.setPostalCode(request.getPostalCode());

        if (Boolean.TRUE.equals(request.getIsDefault()) && !address.getIsDefault()) {
            addressRepository.clearDefaultByUserId(userId);
            address.setIsDefault(true);
        }

        return toAddressResponse(addressRepository.save(address));
    }

    @Override
    public void deleteAddress(UUID userId, UUID addressId) {
        addressRepository.softDeleteByIdAndUserId(addressId, userId);
    }

    // ── Notifications ────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getNotifications(UUID userId, int page) {
        return notificationService.getUserNotifications(userId, page, 20);
    }

    @Override
    public void markAllNotificationsRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    // ── Helpers ──────────────────────────────────────────────
    private User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private AddressResponse toAddressResponse(Address a) {
        return AddressResponse.builder()
                .id(a.getId())
                .fullName(a.getFullName())
                .phone(a.getPhone())
                .street(a.getStreet())
                .ward(a.getWard())
                .district(a.getDistrict())
                .city(a.getCity())
                .country(a.getCountry())
                .isDefault(a.getIsDefault())
                .build();
    }
}