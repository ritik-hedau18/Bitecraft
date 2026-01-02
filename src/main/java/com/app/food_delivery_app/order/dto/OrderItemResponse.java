package com.app.food_delivery_app.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private String menuItemName;
    private Integer quantity;
    private Double price;
    private Double subtotal;
}