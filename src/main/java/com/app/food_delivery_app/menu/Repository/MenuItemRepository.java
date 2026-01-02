package com.app.food_delivery_app.menu.Repository;

import com.app.food_delivery_app.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurantId(Long restaurantId);

    List<MenuItem> findByCategoryId(Long categoryId);

    List<MenuItem> findByRestaurantIdAndAvailableTrue(Long restaurantId);

}
