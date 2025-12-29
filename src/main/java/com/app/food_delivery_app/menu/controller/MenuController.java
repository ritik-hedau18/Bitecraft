package com.app.food_delivery_app.menu.controller;

import com.app.food_delivery_app.menu.dto.*;
import com.app.food_delivery_app.menu.service.MenuService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@Tag(name = "3. Menu", description = "Categories and Menu items")
public class MenuController {

    private final MenuService menuService;

    @PostMapping("/category")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<CategoryResponse> addCategory(
            @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(menuService.addCategory(request));
    }

    @GetMapping("/category/restaurant/{restaurantId}")
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(
                menuService.getCategoriesByRestaurant(restaurantId));
    }

    @PostMapping("/item")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<MenuItemResponse> addMenuItem(
            @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuService.addMenuItem(request));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<MenuItemResponse>> getMenu(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(
                menuService.getMenuByRestaurant(restaurantId));
    }

    @GetMapping("/restaurant/{restaurantId}/available")
    public ResponseEntity<List<MenuItemResponse>> getAvailableMenu(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(
                menuService.getAvailableMenu(restaurantId));
    }

    @PutMapping("/item/{itemId}/toggle")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<MenuItemResponse> toggleItem(
            @PathVariable Long itemId) {
        return ResponseEntity.ok(menuService.toggleAvailability(itemId));
    }
}