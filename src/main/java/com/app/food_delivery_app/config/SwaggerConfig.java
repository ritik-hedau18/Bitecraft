package com.app.food_delivery_app.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI myCustomConfig() {
        return new OpenAPI().info(
                new Info().title("Food Delivery Backend API")
                        .description("Production-ready REST API for a Food Delivery Platform — " +
                                "covers Auth, Restaurant, Menu, Cart, and Order management")
                        .contact(new Contact()
                                .name("Ritik Hedau")
                                .email("ritikhedau18@gmail.com")
                                .url("https://github.com/ritik-hedau18/bitecraft")))
                        .addSecurityItem(new SecurityRequirement()
                                .addList("Bearer Authentication"))
                        .components(new Components()
                                .addSecuritySchemes("Bearer Authentication",
                                        new SecurityScheme()
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                        .description("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyaXRpa0BnbWFpbC5jb20iLCJyb2xlIjoiUkVTVEFVUkFOVF9PV05FUiIsImlhdCI6MTc3NDYwOTI2NCwiZXhwIjoxNzc0Njk1NjY0fQ.VG9xpENIC_FU--1mc0kLIYXSbCPrscgAan7IIVjOJmE")
                                ));
    }

}
