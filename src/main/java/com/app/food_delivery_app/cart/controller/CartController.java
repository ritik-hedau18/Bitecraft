package com.app.food_delivery_app.cart.controller;

import com.app.food_delivery_app.cart.dto.*;
import com.app.food_delivery_app.cart.service.CartService;
import com.app.food_delivery_app.config.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "4. Cart", description = "Cart management")
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @Valid @RequestBody CartItemRequest request,
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Item added to cart",
                        cartService.addToCart(request, principal.getName())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Cart fetched",
                        cartService.getCart(principal.getName())));
    }

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @PathVariable Long cartItemId,
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Item removed",
                        cartService.removeFromCart(cartItemId, principal.getName())));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearCart(
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("Cart cleared",
                        cartService.clearCart(principal.getName())));
    }
}