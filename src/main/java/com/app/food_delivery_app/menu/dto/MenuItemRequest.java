package com.app.food_delivery_app.menu.dto;

import lombok.Data;

@Data
public class MenuItemRequest {

    private String name;
    private String description;
    private Double price;
    private Long categoryId;
    private Long restaurantId;

}
