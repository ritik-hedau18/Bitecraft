package com.app.food_delivery_app.cart.repository;

import com.app.food_delivery_app.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndMenuItemId(Long cartId, Long menuItemId);
}