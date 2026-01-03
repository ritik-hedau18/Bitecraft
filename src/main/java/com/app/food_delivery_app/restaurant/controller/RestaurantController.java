package com.app.food_delivery_app.restaurant.controller;

import com.app.food_delivery_app.config.ApiResponse;
import com.app.food_delivery_app.restaurant.dto.RestaurantRequest;
import com.app.food_delivery_app.restaurant.dto.RestaurantResponse;
import com.app.food_delivery_app.restaurant.service.RestaurantService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@Tag(name = "2. Restaurant", description = "Restaurant management")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<ApiResponse<RestaurantResponse>> addRestaurant(
            @RequestBody RestaurantRequest request,
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Restaurant added successfully",
                        restaurantService.addRestaurant(request, principal.getName())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getAllOpen() {
        return ResponseEntity.ok(
                ApiResponse.success("Restaurants fetched",
                        restaurantService.getAllOpenRestaurants()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> getMyRestaurants(
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("My restaurants fetched",
                        restaurantService.getMyRestaurants(principal.getName())));
    }

    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('RESTAURANT_OWNER')")
    public ResponseEntity<ApiResponse<RestaurantResponse>> toggleStatus(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Status updated",
                        restaurantService.toggleStatus(id, principal.getName())));
    }
}