package com.app.food_delivery_app.order.controller;

import com.app.food_delivery_app.config.ApiResponse;
import com.app.food_delivery_app.order.dto.*;
import com.app.food_delivery_app.order.enums.OrderStatus;
import com.app.food_delivery_app.order.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "5. Order", description = "Order lifecycle management")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request,
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Order placed successfully",
                        orderService.placeOrder(request, principal.getName())));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Orders fetched",
                        orderService.getMyOrders(principal.getName())));
    }

    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getRestaurantOrders(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(
                ApiResponse.success("Restaurant orders fetched",
                        orderService.getRestaurantOrders(restaurantId)));
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status,
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Status updated",
                        orderService.updateStatus(orderId, status, principal.getName())));
    }

    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long orderId,
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Order cancelled",
                        orderService.cancelOrder(orderId, principal.getName())));
    }
}