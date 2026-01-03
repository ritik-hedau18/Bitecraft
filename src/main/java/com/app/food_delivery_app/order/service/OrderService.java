package com.app.food_delivery_app.order.service;

import com.app.food_delivery_app.auth.entity.User;
import com.app.food_delivery_app.auth.repository.UserRepository;
import com.app.food_delivery_app.cart.entity.Cart;
import com.app.food_delivery_app.cart.repository.CartRepository;
import com.app.food_delivery_app.order.dto.*;
import com.app.food_delivery_app.order.entity.Order;
import com.app.food_delivery_app.order.entity.OrderItem;
import com.app.food_delivery_app.order.enums.OrderStatus;
import com.app.food_delivery_app.order.repository.OrderItemRepository;
import com.app.food_delivery_app.order.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;


    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request, String email) {

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));


        Cart cart = cartRepository.findByUserId(customer.getId())
                .orElseThrow(() -> new RuntimeException("Cart is empty"));


        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }


        Order order = Order.builder()
                .customer(customer)
                .restaurant(cart.getRestaurant())
                .status(OrderStatus.PENDING)
                .totalAmount(cart.getTotalAmount())
                .deliveryAddress(request.getDeliveryAddress())
                .build();

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = cart.getItems()
                .stream()
                .map(cartItem -> OrderItem.builder()
                        .order(savedOrder)
                        .menuItem(cartItem.getMenuItem())
                        .quantity(cartItem.getQuantity())
                        .price(cartItem.getPrice())
                        .build())
                .collect(Collectors.toList());

        orderItemRepository.saveAll(orderItems);

        // 6. Cart clear karo order place hone ke baad
        cart.getItems().clear();
        cart.setRestaurant(null);
        cartRepository.save(cart);

        return toOrderResponse(savedOrder, orderItems);
    }


    public List<OrderResponse> getMyOrders(String email) {

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByCustomerId(customer.getId())
                .stream()
                .map(order -> toOrderResponse(order, order.getItems()))
                .collect(Collectors.toList());
    }


    public List<OrderResponse> getRestaurantOrders(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(order -> toOrderResponse(order, order.getItems()))
                .collect(Collectors.toList());
    }


    @Transactional
    public OrderResponse updateStatus(Long orderId,
                                      OrderStatus newStatus,
                                      String email) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));


        if (!order.getRestaurant().getOwner().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);

        return toOrderResponse(saved, saved.getItems());
    }


    @Transactional
    public OrderResponse cancelOrder(Long orderId, String email) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));


        if (!order.getCustomer().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized");
        }


        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new RuntimeException(
                    "Order cannot be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);

        return toOrderResponse(saved, saved.getItems());
    }


    private OrderResponse toOrderResponse(Order order, List<OrderItem> items) {

        List<OrderItemResponse> itemResponses = items
                .stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getMenuItem().getName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice() * item.getQuantity()
                ))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getCustomer().getName(),
                order.getRestaurant().getName(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getDeliveryAddress(),
                itemResponses,
                order.getCreatedAt()
        );
    }
}