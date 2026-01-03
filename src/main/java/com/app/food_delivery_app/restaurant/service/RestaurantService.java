package com.app.food_delivery_app.restaurant.service;

import com.app.food_delivery_app.auth.entity.User;
import com.app.food_delivery_app.auth.repository.UserRepository;
import com.app.food_delivery_app.restaurant.dto.RestaurantRequest;
import com.app.food_delivery_app.restaurant.dto.RestaurantResponse;
import com.app.food_delivery_app.restaurant.entity.Restaurant;
import com.app.food_delivery_app.restaurant.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public RestaurantResponse addRestaurant(RestaurantRequest restaurantRequest, String ownerEmail) {

     User owner =   userRepository.findByEmail(ownerEmail).orElseThrow(() -> new RuntimeException("User not found"));

        Restaurant restaurant = Restaurant.builder()
                .name(restaurantRequest.getName())
                .address(restaurantRequest.getAddress())
                .phone(restaurantRequest.getPhone())
                .cuisineType(restaurantRequest.getCuisineType())
                .owner(owner)
                .build();

        Restaurant saved = restaurantRepository.save(restaurant);

        return  toResPonse(saved);
    }

    public List<RestaurantResponse> getAllOpenRestaurants() {
        return restaurantRepository.findByOpenTrue()
                .stream()
                .map(this::toResPonse)
                .collect(Collectors.toList());
    }

    public List<RestaurantResponse> getMyRestaurants(String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail).orElseThrow(() -> new RuntimeException("User not found"));
        return restaurantRepository.findByOwnerId(owner.getId())
                .stream()
                .map(this::toResPonse)
                .collect(Collectors.toList());
    }

    public RestaurantResponse toggleStatus(Long restaurantId, String ownerEmail) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if(!restaurant.getOwner().getEmail().equals(ownerEmail)) {
            throw new RuntimeException("Unauthorized request");
        }

        restaurant.setOpen(!restaurant.isOpen());
        Restaurant saved = restaurantRepository.save(restaurant);

        return toResPonse(saved);
    }

    private RestaurantResponse toResPonse(Restaurant restaurant) {
        return new RestaurantResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getPhone(),
                restaurant.getCuisineType(),
                restaurant.isOpen(),
                restaurant.getOwner().getName(),
                restaurant.getOwner().getEmail(),
                restaurant.getCreatedAt()
        );

    }

}
