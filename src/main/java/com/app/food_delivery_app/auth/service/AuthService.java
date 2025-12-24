package com.app.food_delivery_app.auth.service;

import com.app.food_delivery_app.auth.dto.AuthResponse;
import com.app.food_delivery_app.auth.dto.LoginRequest;
import com.app.food_delivery_app.auth.dto.RegisterRequest;
import com.app.food_delivery_app.auth.entity.User;
import com.app.food_delivery_app.auth.repository.UserRepository;
import com.app.food_delivery_app.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Register

    public AuthResponse register(RegisterRequest registerRequest) {

        // Email already registered ?

        if(userRepository.existsByEmail(registerRequest.getEmail())) {

            throw new RuntimeException("Email already registered");
        }

      User user =  User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phone(registerRequest.getPhone())
                .role(registerRequest.getRole())
                .build();

        userRepository.save(user);

        return new AuthResponse(
                null,
                user.getEmail(),
                user.getRole().name(),
                "Registered Successfully"
        );

    }

    // Login

    public AuthResponse login(LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name(),
                "Login Successful"
        );

    }

    public AuthResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new AuthResponse(
                null,
                user.getEmail(),
                user.getRole().name(),
                "Welcome " + user.getName()
        );
    }

}
