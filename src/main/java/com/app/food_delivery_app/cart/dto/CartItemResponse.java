package com.app.food_delivery_app.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private String menuItemName;
    private Integer quantity;
    private Double price;
    private Double subtotal;
}