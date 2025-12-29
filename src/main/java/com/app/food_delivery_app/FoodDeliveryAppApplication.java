package com.app.food_delivery_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
public class FoodDeliveryAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodDeliveryAppApplication.class, args);
    }
}