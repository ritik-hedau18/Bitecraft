package com.app.food_delivery_app.restaurant.repository;

import com.app.food_delivery_app.restaurant.entity.Restaurant;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository  extends CrudRepository<Restaurant, Long> {

    List<Restaurant> findByOwnerId(Long ownerId);
    List<Restaurant> findByOpenTrue();



}
