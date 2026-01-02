package com.app.food_delivery_app.order.dto;

import com.app.food_delivery_app.order.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String customerName;
    private String restaurantName;
    private OrderStatus status;
    private Double totalAmount;
    private String deliveryAddress;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}