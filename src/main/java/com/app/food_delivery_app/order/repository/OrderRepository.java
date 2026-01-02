package com.app.food_delivery_app.order.repository;

import com.app.food_delivery_app.order.entity.Order;
import com.app.food_delivery_app.order.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerId(Long customerId);

    List<Order> findByRestaurantId(Long restaurantId);

    List<Order> findByRestaurantIdAndStatus(Long restaurantId, OrderStatus status);
}