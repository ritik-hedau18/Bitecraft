package com.app.food_delivery_app.cart.repository;

import com.app.food_delivery_app.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.menuItem WHERE c.user.id = :userId")
    Optional<Cart> findByUserId(@Param("userId") Long userId);
}