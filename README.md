# 🍕 Food Delivery App (Full-Stack Zomato/Swiggy-Style)

> A full-stack, production-ready food delivery platform (Swiggy/Zomato-style), built with a Java Spring Boot 3 REST API and a premium React + Vite frontend. Supports multi-role authentication, interactive menu catalogs, cart states, real-time status flows, and customer tracking boards.

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-brightgreen?style=flat-square&logo=springboot)
![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-blue?style=flat-square&logo=springsecurity)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-336791?style=flat-square&logo=postgresql)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-Vite--Project-646CFF?style=flat-square&logo=vite)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203-85EA2D?style=flat-square&logo=swagger)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)

---

## Architecture

![Food Delivery Backend Architecture](./docs/food-delivery-architecture.svg)

The application follows a decoupled model:
- **Backend API**: Structured in modular domain folders using Spring Boot, JPA/Hibernate, and PostgreSQL database.
- **Frontend SPA**: Powered by React, Vite, and React Router, styled with a premium custom design system in Vanilla CSS.

---

## Tech Stack

### Backend
- **Language/Framework**: Java 17, Spring Boot 3
- **Security**: Spring Security + JWT
- **ORM & DB**: Spring Data JPA / Hibernate, PostgreSQL
- **Validation**: Jakarta Bean Validation (`@Valid`)
- **Documentation**: Swagger / OpenAPI 3

### Frontend
- **Framework/Bundler**: React 18, Vite
- **Routing**: React Router DOM (Declarative client routing)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom properties, Glassmorphism, animations)
- **Services**: Custom API fetch client with automated auth token interceptors

---

## User Roles & Permissions

| Role | Permissions |
|---|---|
| `CUSTOMER` | Browse restaurants, manage cart quantities, checkout COD, cancel and track order status |
| `RESTAURANT_OWNER` | Manage restaurant profiles, menu categories & items, control item stock, accept and advance orders |
| `DELIVERY_AGENT` | *(Future scope)* Accept & track deliveries |
| `ADMIN` | *(Future scope)* Platform-level management |

---

## API Endpoints

### Auth
- `POST /api/auth/register` (Public) - Register new users
- `POST /api/auth/login` (Public) - Login & receive JWT token
- `GET /api/auth/me` (Authenticated) - Get current user profile

### Restaurants
- `POST /api/restaurants` (Owner) - Create restaurant
- `GET /api/restaurants` (Public) - Fetch all open restaurants
- `GET /api/restaurants/my` (Owner) - Fetch owner's restaurants
- `PUT /api/restaurants/{id}/toggle` (Owner) - Open/Close kitchen status

### Menu
- `POST /api/menu/category` (Owner) - Add menu categories
- `GET /api/menu/category/restaurant/{id}` (Public) - List categories
- `POST /api/menu/item` (Owner) - Add menu item
- `GET /api/menu/restaurant/{id}` (Public) - List all menu items
- `GET /api/menu/restaurant/{id}/available` (Public) - List available menu items
- `PUT /api/menu/item/{id}/toggle` (Owner) - Toggle item availability (Sold out/In stock)

### Cart
- `POST /api/cart/add` (Customer) - Add item to cart (updates quantities)
- `GET /api/cart` (Customer) - Retrieve customer cart details
- `DELETE /api/cart/item/{id}` (Customer) - Delete cart item
- `DELETE /api/cart/clear` (Customer) - Clear cart

### Orders
- `POST /api/orders/place` (Customer) - Checkout & place COD order
- `GET /api/orders/my` (Customer) - Fetch order history & tracking details
- `GET /api/orders/restaurant/{id}` (Owner) - Fetch orders incoming to a restaurant
- `PUT /api/orders/{id}/status` (Owner) - Advance order status in lifecycle
- `PUT /api/orders/{id}/cancel` (Customer) - Cancel order (only if status is `PENDING`)

---

## Order Lifecycle

```
PENDING → CONFIRMED → PREPARING → OUT_FOR_DELIVERY → DELIVERED
    ↓
CANCELLED  (only from PENDING state)
```

---

## Project Structure

```
food_delivery_app/
│
├── src/main/java/com/app/food_delivery_app/  → Backend Spring Boot
│   ├── auth/           → Auth controller, registration & login DTOs
│   ├── restaurant/     → Restaurant profile management
│   ├── menu/           → Categories & menu item catalogs
│   ├── cart/           → Shopping cart operations
│   ├── order/          → Order states & lifecycles
│   └── config/         → CORS configurations, Security & Swagger setups
│
├── frontend/                                 → Frontend React Application
│   ├── src/
│   │   ├── components/  → Common Navbar and ProtectedRoute wrappers
│   │   ├── context/     → AuthContext and CartContext states
│   │   ├── pages/       → Home, Auth, RestaurantDetail, Cart, Orders, OwnerDashboard
│   │   ├── services/    → API services client (api.js)
│   │   ├── App.css      → Modal, sidebar, timeline styles
│   │   ├── index.css    → Core color palettes, variables, typography
│   │   └── main.jsx     → Entry mounting point
│   ├── index.html       → HTML entry template
│   └── vite.config.js   → Development proxy & bundling configs
│
└── pom.xml                                   → Maven dependency configuration
```

---

## Getting Started

### Prerequisites
- **Java 17+**
- **PostgreSQL**
- **Node.js (v18+)**
- **Maven**

### Setup Steps

#### 1. Setup Backend
1. **Clone the repository**:
   ```bash
   git clone https://github.com/ritik-hedau18/bitecraft.git
   cd bitecraft
   ```
2. **Create PostgreSQL Database**:
   ```sql
   CREATE DATABASE food_delivery_db;
   ```
3. **Configure Database Settings**:
   Edit `src/main/resources/application.properties` to connect to your PostgreSQL database:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/food_delivery_db
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   ```
4. **Compile and Run Backend**:
   ```bash
   mvn spring-boot:run
   ```
   *The API will be live at `http://localhost:8080`.*
   *Swagger documentation will be available at `http://localhost:8080/swagger-ui/index.html`.*

#### 2. Setup Frontend
1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install node packages**:
   ```bash
   npm install
   ```
3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   *The React App will be running at `http://localhost:5173`.*

---

## Author

**Ritik Hedau** — Java & React Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-ritik--hedau18-181717?style=flat-square&logo=github)](https://github.com/ritik-hedau18)
