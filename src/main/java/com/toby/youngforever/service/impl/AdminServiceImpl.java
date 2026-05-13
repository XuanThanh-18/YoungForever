package com.toby.youngforever.service.impl;

import com.toby.youngforever.dto.response.OrderResponse;
import com.toby.youngforever.dto.response.PageResponse;
import com.toby.youngforever.dto.response.UserResponse;
import com.toby.youngforever.enums.OrderStatus;
import com.toby.youngforever.exception.AppException;
import com.toby.youngforever.exception.ErrorCode;
import com.toby.youngforever.mapper.OrderMapper;
import com.toby.youngforever.mapper.UserMapper;
import com.toby.youngforever.repository.OrderRepository;
import com.toby.youngforever.repository.ProductRepository;
import com.toby.youngforever.repository.UserRepository;
import com.toby.youngforever.service.AdminService;
import com.toby.youngforever.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderService orderService;
    private final OrderMapper orderMapper;
    private final UserMapper userMapper;

    @Override
    public Map<String, Object> getDashboardStats() {
        LocalDateTime startOfToday = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        Map<String, Object> stats = new HashMap<>();

        // Revenue
        BigDecimal revenueToday  = orderRepository.sumRevenueBetween(startOfToday, now);
        BigDecimal revenueMonth  = orderRepository.sumRevenueBetween(startOfMonth, now);
        stats.put("revenueToday", revenueToday);
        stats.put("revenueThisMonth", revenueMonth);

        // Orders by status
        stats.put("pendingOrders",    orderRepository.countByStatusSince(OrderStatus.PENDING,    startOfToday));
        stats.put("processingOrders", orderRepository.countByStatusSince(OrderStatus.PROCESSING, startOfMonth));
        stats.put("deliveredToday",   orderRepository.countByStatusSince(OrderStatus.DELIVERED,  startOfToday));
        stats.put("cancelledToday",   orderRepository.countByStatusSince(OrderStatus.CANCELLED,  startOfToday));

        // Totals
        stats.put("totalUsers",    userRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalOrders",   orderRepository.count());

        return stats;
    }

    @Override
    public PageResponse<OrderResponse> getAllOrders(OrderStatus status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<?> result = (status != null)
                ? orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : orderRepository.findAll(pageable);

        //noinspection unchecked
        return PageResponse.from(
                ((Page<com.toby.youngforever.entity.Order>) result)
                        .map(orderMapper::toResponse));
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatus status, String note) {
        return orderService.updateStatus(orderId, status, note);
    }

    @Override
    public PageResponse<UserResponse> getAllUsers(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(userRepository.findAll(pageable).map(userMapper::toResponse));
    }

    @Override
    @Transactional
    public void toggleUserActive(UUID userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }
}