package com.app.food_delivery_app.restaurant.dto;

import lombok.Data;

@Data
public class RestaurantRequest {

    private String name;
    private String address;
    private String phone;
    private String cuisineType;

}
