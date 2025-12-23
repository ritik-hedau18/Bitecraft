package com.app.food_delivery_app.auth.controller;

import com.app.food_delivery_app.auth.dto.AuthResponse;
import com.app.food_delivery_app.auth.dto.LoginRequest;
import com.app.food_delivery_app.auth.dto.RegisterRequest;
import com.app.food_delivery_app.auth.service.AuthService;
import com.app.food_delivery_app.config.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "1. Auth", description = "Register, Login, JWT Token")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Registration successful",
                        authService.register(request)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Login successful",
                        authService.login(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getMe(
            Principal principal) {
        return ResponseEntity.ok(
                ApiResponse.success("User fetched",
                        authService.getMe(principal.getName())));
    }
}