package com.app.food_delivery_app.menu.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private Long restaurantId;
    private String restaurantName;

}
