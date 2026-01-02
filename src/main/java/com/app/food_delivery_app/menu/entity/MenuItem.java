package com.app.food_delivery_app.menu.entity;

import com.app.food_delivery_app.restaurant.entity.Restaurant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

    @Entity
    @Table(name = "menu_items")
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class MenuItem {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false)
        private String name;

        private String description;

        @Column(nullable = false)
        private Double price;

        @Builder.Default
        private boolean available = true;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "category_id", nullable = false)
        private Category category;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "restaurant_id", nullable = false)
        private Restaurant restaurant;

}
