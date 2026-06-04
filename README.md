# Leather Goods Store — Project Documentation

## 📌 Project Overview

**Leather Goods** is a full-stack e-commerce web application for a premium leather goods store. Users can browse products, filter by category, manage their cart, place orders, request custom orders, and track their purchase history. An admin panel allows managing products, categories, custom orders, users, and reviewing all customer orders.

---

## 🏗️ Architecture

```
Leather Store/
├── backend/          # Express + TypeScript REST API
│   ├── config/       # Supabase client
│   ├── middlewares/  # Auth & file upload
│   ├── routes/       # API route handlers (auth, user, product, categories, order, customOrders)
│   ├── index.ts      # Server entry point
│   └── .env          # Environment variables
│
└── frontend/         # React + TypeScript SPA (Vite)
    ├── src/
    │   ├── assets/       # Static assets (images, svgs)
    │   ├── components/   # Reusable UI components (Navbar, Footer, CartDrawer)
    │   ├── config/       # Supabase anon client
    │   ├── context/      # Context providers (AuthContext, CartContext)
    │   ├── pages/        # Route-level components (Shop, Home, Auth, Admin, etc.)
    │   ├── routes/       # Protected route wrappers (AdminRoute, CustomerRoute)
    │   ├── services/     # API client (axios)
    │   ├── utils/        # Utility functions (formatters)
    │   └── App.tsx       # Router + routes
    └── index.html
```

---

## 🛠️ Tech Stack

| Layer          | Technology |
|----------------|------------|
| Backend        | Express.js, TypeScript |
| Frontend       | React 19, TypeScript, Vite |
| Database / BaaS| Supabase (PostgreSQL via Supabase) |
| Auth           | Supabase Auth (email/password + Google OAuth) |
| File Storage   | Supabase Storage (`images` bucket) |
| Styling        | Tailwind CSS v4, Vanilla CSS |
| Animations     | Framer Motion |
| Icons          | Lucide React |
| HTTP Client    | Axios |
| Security       | Helmet, CORS, Express Rate Limiter, bcryptjs, JWT |
| Email          | Nodemailer |

---

## 🔐 Authentication & Roles

- **Authentication** is handled by **Supabase Auth** (email/password + Google OAuth) on the frontend, and via **access token** in the `Authorization: Bearer` header for backend API calls.
- Two roles exist in the `User` table: **CUSTOMER** and **ADMIN**.
- The backend middleware (`authenticate`) verifies the token via Supabase, fetches the user's role from the `User` table, and attaches `req.user` with `{ id, role }`.
- The `isAdmin` middleware restricts routes to ADMIN users only (HTTP 403 otherwise).
- A rate limiter on `/api/auth` limits requests: **10 attempts / 15 minutes**.

### Auth Routes

| Method | Endpoint                        | Auth Required | Admin Only |
|--------|---------------------------------|:---:|:---:|
| POST   | `/api/auth/register`            |  —  |  —  |
| POST   | `/api/auth/login`               |  —  |  —  |
| POST   | `/api/auth/forgot-password`     |  —  |  —  |
| POST   | `/api/auth/reset-password`      |  —  |  —  |

---

## 🗄️ Database Schema (Supabase)

### `User`
| Field     | Type    | Description                |
|-----------|---------|----------------------------|
| `id`      | UUID    | Primary key (from Supabase Auth) |
| `email`   | text    | User email                 |
| `name`    | text    | Full name                  |
| `phone`   | text    | Phone number               |
| `role`    | text    | `CUSTOMER` or `ADMIN`      |

### `Category`
| Field        | Type    | Description              |
|--------------|---------|--------------------------|
| `id`         | UUID    | Primary key              |
| `name`       | text    | Category name            |
| `description`| text    | Category description     |

### `Product`
| Field       | Type    | Description                        |
|-------------|---------|------------------------------------|
| `id`        | UUID    | Primary key                        |
| `name`      | text    | Product name                       |
| `description`| text   | Product description                |
| `price`     | float   | Price                              |
| `stock`     | integer | Available quantity                 |
| `categoryId`| UUID    | FK → `Category.id`                 |
| `imageUrl`  | text    | Public Supabase Storage URL        |

### `Order`
| Field         | Type     | Description                        |
|---------------|----------|------------------------------------|
| `id`          | UUID     | Primary key                        |
| `userId`      | UUID     | FK → `User.id`                     |
| `totalAmount` | float    | Order total                        |
| `paymentMethod` | text   | e.g. `CARD`, `CASH`, `PAYPAL`       |
| `status`      | text     | `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED` |

### `OrderItem`
| Field          | Type    | Description                                   |
|----------------|---------|-----------------------------------------------|
| `id`           | UUID    | Primary key                                   |
| `orderId`      | UUID    | FK → `Order.id`                               |
| `productId`    | UUID    | FK → `Product.id`                             |
| `quantity`     | integer | Quantity ordered                              |
| `priceAtPurchase` | float | Price at time of purchase (snapshot)         |

### `CustomOrder`
| Field          | Type    | Description                                   |
|----------------|---------|-----------------------------------------------|
| `id`           | UUID    | Primary key                                   |
| `userId`       | UUID    | FK → `User.id`                                |
| `description`  | text    | User description of custom request            |
| `imageUrl`     | text    | Public Supabase Storage URL for reference img |
| `status`       | text    | e.g. `PENDING`, `REVIEWING`, `APPROVED`       |

---

## 🌐 API Routes

### Users
| Method | Endpoint                    | Auth  | Admin |
|--------|-----------------------------|:-----:|:-----:|
| GET    | `/api/users`                | ✓     | ✓     |

### Categories
| Method | Endpoint                    | Auth  | Admin |
|--------|-----------------------------|:-----:|:-----:|
| GET    | `/api/categories`           |  —    |  —    |
| POST   | `/api/categories`           | ✓     | ✓     |
| PUT    | `/api/categories/:id`       | ✓     | ✓     |
| DELETE | `/api/categories/:id`       | ✓     | ✓     |

### Products
| Method | Endpoint                    | Auth  | Admin | Notes                      |
|--------|-----------------------------|:-----:|:-----:|----------------------------|
| GET    | `/api/products`             |  —    |  —    | Includes category name     |
| POST   | `/api/products`             | ✓     | ✓     | Accepts `multipart/form-data` image upload |
| PUT    | `/api/products/:id`         | ✓     | ✓     |                            |
| DELETE | `/api/products/:id`         | ✓     | ✓     |                            |

### Orders
| Method | Endpoint                  | Auth  | Admin | Notes                            |
|--------|---------------------------|:-----:|:-----:|----------------------------------|
| POST   | `/api/orders`             | ✓     |  —    | Creates order + order items       |
| GET    | `/api/orders/my-orders`   | ✓     |  —    | User's own orders                 |
| GET    | `/api/orders/admin`       | ✓     | ✓     | All orders with user + items data |
| PUT    | `/api/orders/:id/status`  | ✓     | ✓     | Update order status               |

### Custom Orders
| Method | Endpoint                  | Auth  | Admin | Notes                            |
|--------|---------------------------|:-----:|:-----:|----------------------------------|
| POST   | `/api/customOrders`       | ✓     |  —    | Creates a custom order request    |
| GET    | `/api/customOrders`       | ✓     | ✓     | Fetch custom orders               |

---

## 🖥️ Frontend Pages

| Route            | Component          | Description                              | Access               |
|------------------|--------------------|------------------------------------------|----------------------|
| `/`              | `Home.tsx`         | Landing page for the store               | Public               |
| `/shop`          | `Shop.tsx`         | Product grid, search bar, category filter | Public               |
| `/about`         | `about.tsx`        | About us page                            | Public               |
| `/product/:id`   | `ProductPage.tsx`  | Individual product detail page           | Public               |
| `/login`         | `Login.tsx`        | Email/password + Google OAuth login      | Public               |
| `/register`      | `Register.tsx`     | Account registration                     | Public               |
| `/forgot-password`| `ForgotPassword.tsx`| Password reset email request            | Public               |
| `/reset-password`| `ResetPassword.tsx` | New password form via token link        | Public               |
| `/profile`       | `Profile.tsx`      | User profile, view/edit info             | Protected (CUSTOMER) |
| `/checkout`      | `CheckOut.tsx`     | Checkout flow with payment choices       | Protected (CUSTOMER) |
| `/my-orders`     | `MyOrders.tsx`     | Order history                            | Protected (CUSTOMER) |
| `/custom-order`  | `CustomOrder.tsx`  | Customer portal for requesting custom items| Protected (CUSTOMER) |
| `/admin`         | `adminHome.tsx`    | Admin landing overview                   | Protected (ADMIN)    |
| `/admin/dashboard`| `adminDashboard.tsx`| Admin statistics dashboard               | Protected (ADMIN)    |
| `/admin/products`| `adminProducts.tsx`| Table CRUD for products                  | Protected (ADMIN)    |
| `/admin/categories`| `adminCategories.tsx`| Table CRUD for categories              | Protected (ADMIN)    |
| `/admin/orders`  | `adminOrder.tsx`   | Admin order management                   | Protected (ADMIN)    |
| `/admin/customers`| `adminCustomers.tsx`| Admin user management                  | Protected (ADMIN)    |
| `/admin/custom-orders`| `adminCustomOrders.tsx`| Admin custom order management       | Protected (ADMIN)    |

### Routing Overview
- **CustomerRoute**: Wraps routes intended for authenticated customers (e.g., checkout, profile, my-orders).
- **AdminRoute**: Wraps all `/admin/*` routes to ensure only users with the `ADMIN` role can access them.
- Auth forms (`/login`, `/register`, `/forgot-password`, `/reset-password`) are fully public.

### Global Components
- **CartDrawer (`CartDrawer.tsx`)**: Slide-out panel for cart management.
- **Navbar (`Navbar.tsx`)**: Global header with navigation and cart toggle.
- **Footer (`Footer.tsx`)**: Global footer links and branding.

### Contexts
- **AuthContext (`AuthContext.tsx`)**: Manages `user`, `token`, and `loading` state globally.
- **CartContext (`CartContext.tsx`)**: Manages shopping cart state across the application.

---

## 🎨 Design Style

The brand aesthetic is **minimal luxury / editorial leather goods**:

| Token           | Value        | Usage                        |
|-----------------|-------------|------------------------------|
| `#F7F5F0`       | Warm off-white | Page background              |
| `#2C1810`       | Rich dark brown | Primary text, CTAs          |
| `#8B7355`       | Warm tan      | Secondary text, labels       |
| `#D4C5B0`       | Light sand    | Borders, dividers            |
| `#8B6914`       | Golden brown  | Hover states, accents        |

- **Typography**: Playfair Display (serif, headings) + Inter (sans-serif, body)
- Animations: Framer Motion page transitions + hover states
- Layout: Split-panel auth pages, centered forms, generous whitespace

---

## 🔑 Environment Variables

### Backend (`.env`)
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
PORT=5000
```

### Frontend (`.env`)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 🚀 Run the Project

```bash
# Backend
cd backend
npm install
npm run dev        # Runs on http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev        # Runs on http://localhost:5173
```

---

## ✅ Completed Features

- [x] User registration (email/password)
- [x] User login (email/password)
- [x] Google OAuth login
- [x] Password reset flow (forgot + reset)
- [x] JWT/Token-based API auth middleware
- [x] Role-based access control (CUSTOMER / ADMIN)
- [x] Category CRUD (admin)
- [x] Product CRUD with image upload (admin)
- [x] Order creation (customer)
- [x] Order status management (admin)
- [x] Public Shop / Home page (`/shop` & `/`)
- [x] Single Product Page (`/product/:id`)
- [x] Auth pages — Login / Register / Forgot Password / Reset Password
- [x] Cart System (Context + Drawer UI)
- [x] Checkout Flow
- [x] My Orders (Customer history)
- [x] Profile Management
- [x] Custom Orders System (Customer request + Admin review)
- [x] Admin Dashboard — Overview stats
- [x] Admin Products — Table CRUD
- [x] Admin Categories — Table CRUD
- [x] Admin Orders — Order list with status management
- [x] Admin Customers — User list management
- [x] Navigation bar and Global Footer

## 🔲 Remaining Frontend Pages (UI/UX TODO)

- [ ] **Wishlist** — Saved products page
- [ ] **Not Found / 404** page
- [ ] **Review Pages**  Review page
