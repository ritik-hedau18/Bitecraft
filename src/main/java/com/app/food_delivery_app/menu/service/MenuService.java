package com.app.food_delivery_app.menu.service;

import com.app.food_delivery_app.menu.Repository.CategoryRepository;
import com.app.food_delivery_app.menu.Repository.MenuItemRepository;
import com.app.food_delivery_app.menu.dto.*;
import com.app.food_delivery_app.menu.entity.Category;
import com.app.food_delivery_app.menu.entity.MenuItem;
import com.app.food_delivery_app.restaurant.entity.Restaurant;
import com.app.food_delivery_app.restaurant.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;


    public CategoryResponse addCategory(CategoryRequest request) {

        Restaurant restaurant = restaurantRepository
                .findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Category category = Category.builder()
                .name(request.getName())
                .restaurant(restaurant)
                .build();

        Category saved = categoryRepository.save(category);
        return toCategoryResponse(saved);
    }


    public List<CategoryResponse> getCategoriesByRestaurant(Long restaurantId) {
        return categoryRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }


    public MenuItemResponse addMenuItem(MenuItemRequest request) {

        Restaurant restaurant = restaurantRepository
                .findById(request.getRestaurantId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        MenuItem item = MenuItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .restaurant(restaurant)
                .build();

        MenuItem saved = menuItemRepository.save(item);
        return toMenuItemResponse(saved);
    }


    public List<MenuItemResponse> getMenuByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::toMenuItemResponse)
                .collect(Collectors.toList());
    }


    public List<MenuItemResponse> getAvailableMenu(Long restaurantId) {
        return menuItemRepository
                .findByRestaurantIdAndAvailableTrue(restaurantId)
                .stream()
                .map(this::toMenuItemResponse)
                .collect(Collectors.toList());
    }


    public MenuItemResponse toggleAvailability(Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        item.setAvailable(!item.isAvailable());
        MenuItem saved = menuItemRepository.save(item);
        return toMenuItemResponse(saved);
    }

    private CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getRestaurant().getId(),
                category.getRestaurant().getName()
        );
    }

    private MenuItemResponse toMenuItemResponse(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.isAvailable(),
                item.getCategory().getName(),
                item.getRestaurant().getId(),
                item.getRestaurant().getName()
        );
    }
}