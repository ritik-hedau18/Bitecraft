package com.app.food_delivery_app.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CartResponse {
    private Long id;
    private String restaurantName;
    private List<CartItemResponse> items;
    private Double totalAmount;
}