package com.toby.youngforever.service;

import com.toby.youngforever.dto.request.ChangePasswordRequest;
import com.toby.youngforever.dto.request.CreateAddressRequest;
import com.toby.youngforever.dto.request.UpdateProfileRequest;
import com.toby.youngforever.dto.response.AddressResponse;
import com.toby.youngforever.dto.response.NotificationResponse;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserResponse getProfile(UUID userId);
    UserResponse updateProfile(UUID userId, UpdateProfileRequest request);
    String uploadAvatar(UUID userId, MultipartFile file);
    void changePassword(UUID userId, ChangePasswordRequest request);

    // Addresses
    List<AddressResponse> getAddresses(UUID userId);
    AddressResponse createAddress(UUID userId, CreateAddressRequest request);
    AddressResponse updateAddress(UUID userId, UUID addressId, CreateAddressRequest request);
    void deleteAddress(UUID userId, UUID addressId);

    // Notifications
    PageResponse<NotificationResponse> getNotifications(UUID userId, int page);
    void markAllNotificationsRead(UUID userId);
}