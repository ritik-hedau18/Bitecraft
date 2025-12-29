package com.app.food_delivery_app.menu.dto;

import lombok.Data;

@Data
public class CategoryRequest {
    private String name;
    private Long restaurantId;
}
