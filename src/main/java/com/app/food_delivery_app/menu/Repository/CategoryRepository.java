package com.app.food_delivery_app.menu.Repository;

import com.app.food_delivery_app.menu.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository  extends JpaRepository<Category, Long> {

    List<Category> findByRestaurantId(Long restaurantId);

}
