# 🟡 Golden Thread -- Full Stack E-Commerce Store

A modern WooCommerce-style full-stack eCommerce web application built
using:

-   ⚛️ React (Vite)
-   🎨 Custom Golden Theme UI
-   🟢 Node.js + Express
-   🗄 SQLite (better-sqlite3)
-   🔐 JWT Authentication
-   🛒 Cart → Checkout → Order Flow
-   🛠 Admin Dashboard (Products, Orders, Categories)

------------------------------------------------------------------------

## 🌟 Features

### 🏠 Frontend

-   Separate Homepage (Hero, Featured, Categories, Blogs, Reviews,
    Contact CTA)
-   Shop page with filtering & sorting
-   Single product page
-   Cart page
-   Checkout page (WooCommerce-style flow)
-   Thank You page
-   Order tracking page
-   Blog listing & single blog page
-   Category pages
-   Contact form
-   Fully responsive golden-themed UI
-   Lato font styling

------------------------------------------------------------------------

### 🔐 Authentication

-   User Registration
-   User Login
-   JWT token-based authentication
-   Admin role system

------------------------------------------------------------------------

### 🛠 Admin Panel

-   View all orders
-   Update order status
-   Add products
-   Dynamic category dropdown
-   Create categories
-   View contact messages

------------------------------------------------------------------------

### 📦 Backend API

-   Products CRUD (Admin)
-   Categories
-   Blogs
-   Reviews
-   Orders
-   Contact messages
-   Order tracking
-   Admin-only routes

------------------------------------------------------------------------

## 🗂 Project Structure

golden-thread/ │ ├── golden-thread-frontend/ \# React (Vite) │ ├── src/
│ ├── package.json │ ├── golden-thread-backend/ \# Node + Express +
SQLite │ ├── server.js │ ├── db.js │ ├── auth.js │ ├── store.db │ └──
package.json │ └── README.md

------------------------------------------------------------------------

# 🚀 Installation Guide

## 1️⃣ Clone Repository

git clone https://github.com/yourusername/golden-thread.git cd
golden-thread

------------------------------------------------------------------------

# 🖥 Backend Setup

cd golden-thread-backend

npm install

Create .env file:

PORT=5050 JWT_SECRET=your_super_secret_key

Run backend:

npm run dev

Backend runs at: http://localhost:5050

------------------------------------------------------------------------

# 🌐 Frontend Setup

cd golden-thread-frontend

npm install

npm run dev

Frontend runs at: http://localhost:5173

------------------------------------------------------------------------

# 🔑 Admin Login

Email: admin@golden.local\
Password: admin123

------------------------------------------------------------------------

# 📡 API Endpoints

## Products

GET /api/products\
GET /api/products/:id\
POST /api/products (Admin)

## Categories

GET /api/categories\
POST /api/admin/categories (Admin)\
GET /api/category/:slug/products

## Blogs

GET /api/blogs\
GET /api/blogs/:slug

## Orders

POST /api/orders (User)\
GET /api/orders/:id\
GET /api/admin/orders (Admin)\
PATCH /api/admin/orders/:id/status

## Reviews

GET /api/reviews

## Contact

POST /api/contact\
GET /api/admin/contact (Admin)

------------------------------------------------------------------------

# 🛒 E-Commerce Flow

Home → Shop → Product Page → Cart → Checkout → Thank You → Track Order

------------------------------------------------------------------------

# 🛠 Tech Stack

  Frontend       Backend   Database         Auth
  -------------- --------- ---------------- --------
  React (Vite)   Node.js   SQLite           JWT
  React Router   Express   better-sqlite3   bcrypt

------------------------------------------------------------------------

# 🔮 Future Improvements

-   Stripe integration
-   Multi-category per product
-   Product reviews per product
-   Coupon system
-   Pagination
-   Image upload instead of URL
-   My Account page (order history)
-   Wishlist
-   Product variants

------------------------------------------------------------------------

# 📄 License

MIT License

------------------------------------------------------------------------

# 👨‍💻 Author

Developed by Mayur Bhoi
