package com.app.food_delivery_app.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MenuItemResponse {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private boolean available;
    private String categoryName;
    private Long restaurantId;
    private String restaurantName;

}
