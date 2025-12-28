package com.app.food_delivery_app.cart.service;

import com.app.food_delivery_app.auth.entity.User;
import com.app.food_delivery_app.auth.repository.UserRepository;
import com.app.food_delivery_app.cart.dto.*;
import com.app.food_delivery_app.cart.entity.Cart;
import com.app.food_delivery_app.cart.entity.CartItem;
import com.app.food_delivery_app.cart.repository.CartItemRepository;
import com.app.food_delivery_app.cart.repository.CartRepository;
import com.app.food_delivery_app.menu.Repository.MenuItemRepository;
import com.app.food_delivery_app.menu.entity.MenuItem;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
   private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse addToCart(CartItemRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElse(Cart.builder()
                        .user(user)
                        .restaurant(menuItem.getRestaurant())
                        .build());

        if (cart.getRestaurant() != null &&
                !cart.getRestaurant().getId().equals(menuItem.getRestaurant().getId())) {
            throw new RuntimeException(
                    "Cannot add items from different restaurants. Clear cart first.");
        }

        cart.setRestaurant(menuItem.getRestaurant());
        Cart savedCart = cartRepository.save(cart);

        Optional<CartItem> existingItem = cartItemRepository
                .findByCartIdAndMenuItemId(savedCart.getId(), menuItem.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(savedCart)
                    .menuItem(menuItem)
                    .quantity(request.getQuantity())
                    .price(menuItem.getPrice())
                    .build();
            cartItemRepository.save(newItem);
        }

        Cart freshCart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        return toCartResponse(freshCart);
    }

    @Transactional
    public CartResponse getCart(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        return toCartResponse(cart);
    }


    public CartResponse removeFromCart(Long cartItemId, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cartItemRepository.delete(item);

        Cart updatedCart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        return toCartResponse(updatedCart);
    }


    public String clearCart(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.getItems().clear();
        cart.setRestaurant(null);
        cartRepository.save(cart);

        return "Cart cleared successfully";
    }

    private CartResponse toCartResponse(Cart cart) {

        List<CartItemResponse> itemResponses = cart.getItems()
                .stream()
                .map(item -> new CartItemResponse(
                        item.getId(),
                        item.getMenuItem().getName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice() * item.getQuantity()
                ))
                .collect(Collectors.toList());

        return new CartResponse(
                cart.getId(),
                cart.getRestaurant() != null
                        ? cart.getRestaurant().getName() : null,
                itemResponses,
                cart.getTotalAmount()
        );
    }
}