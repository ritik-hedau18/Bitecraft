package com.app.food_delivery_app.restaurant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RestaurantResponse {

    private Long id;
    private String name;
    private String address;
    private String phone;
    private String cuisineType;
    private boolean isOpen;
    private String ownerName;
    private String ownerEmail;
    private LocalDateTime createdAt;

}
