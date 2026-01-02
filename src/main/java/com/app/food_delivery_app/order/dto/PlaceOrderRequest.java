package com.app.food_delivery_app.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlaceOrderRequest {

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;
}