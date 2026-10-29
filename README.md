# Tesla Roadster Pre-Sale Concept Platform

> **Legal Disclaimer:** Concept demonstration only. This application is an independent software project and is **not affiliated with, authorized, or endorsed by Tesla, Inc.** No real vehicle is offered or sold. All prices, discounts, specifications, inventory levels, order numbers, and payment confirmations are illustrative simulations for evaluation and portfolio demonstration.

---

## 🏎️ Overview & UI Reference Implementation

This application implements a futuristic automotive web application matching the selected Tesla Roadster UI design system:

1. **Cinematic Hero**: Sleek dark aesthetic (`#070709`), red laser reflections, metallic red Roadster concept imagery, and real-time interactive spec pills (1.9s 0-60 mph, 620 mi range, 1,250 hp power, 250+ mph top speed).
2. **Registration & Verification**: Clean modal registration with form validation, Google sign-in demo, and simulated email verification.
3. **Vehicle Configuration**: Interactive customizer (Exterior paint colors, 21" Turbofan / 22" Track wheels, interiors, and Founders / SpaceX packages) with image gallery switching.
4. **Server-Side Coupon System**: Validates coupons strictly on the backend (`ROADSTER60` gives 60% off illustrative $200,000 base price → $80,000 final demo price).
5. **Simulated Checkout**: Responsive two-column layout with order summary, customer billing details, and payment gateway selection (Card, Paystack, Flutterwave, USSD).
6. **Payment Processing Simulation**: Multi-outcome test gateway simulator (Success, Decline/Failure, and Cancel) with replay and duplicate order prevention.
7. **Order Confirmation & Digital Receipt**: Celebratory success state with animated confetti, verified order reference, and downloadable/printable demo PDF receipt.
8. **Customer Dashboard**: Track pre-orders, download past invoices, view simulated payments, and review notifications.
9. **Role-Protected Admin Panel**: Overview metrics, live order management, coupon creator, customer directory, and reports.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router 7, Tailwind CSS, Lucide React icons, Canvas Confetti.
- **Backend**: Node.js, Express.js, JWT authentication, bcryptjs password hashing.
- **Data Layer**: Dual-mode storage (Mongoose/MongoDB ready + built-in persistent JSON file store for zero-config local execution).
- **Tooling**: Concurrently for running full-stack development with a single command.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Installation & Startup

1. **Clone or enter project folder**:
   ```bash
   cd "New folder"
   ```

2. **Install all dependencies** (if not already installed):
   ```bash
   npm install
   npm install --prefix backend
   npm install --prefix frontend
   ```

3. **Start both Frontend and Backend concurrently**:
   ```bash
   npm run dev
   ```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Demo Accounts & Sample Coupons

### Default Demo Credentials
Sign in at `/login` with:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **System Admin** | `teslasupporttech@gmail.com` | `Tesla@admin` | Full Admin Panel (`/admin`) |
| **Customer** | `john.doe@example.com` | `Password123!` | Customer Dashboard (`/dashboard`) |

### Sample Coupons (Validated Server-Side)
- `ROADSTER60` — **60% OFF** (Calculates $200,000 → **$80,000**)
- `VIP20` — **20% OFF** (Calculates $200,000 → **$160,000**)

---

## 📡 Backend API Structure

### Authentication
- `POST /api/auth/register` — Create demo account and issue verification code
- `POST /api/auth/verify-email` — Verify email code
- `POST /api/auth/resend-code` — Re-issue verification code
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get authenticated user details

### Vehicles & Coupons
- `GET /api/vehicles` — Get vehicle catalog and configurations
- `GET /api/vehicles/:id` — Get single vehicle configuration
- `POST /api/coupons/validate` — Validate coupon code and compute discount server-side

### Orders & Payments
- `POST /api/orders` — Create pending pre-order with verified pricing
- `GET /api/orders/my-orders` — Customer's order history
- `GET /api/orders/:id` — Order status and details
- `POST /api/payments/initialize` — Initialize payment session
- `POST /api/payments/simulate` — Simulate gateway outcome (`success`, `failure`, `cancel`)

### Admin Management (Protected)
- `GET /api/admin/overview` — Operational metrics and recent orders
- `GET /api/admin/orders` — Order records with search and filter
- `GET /api/admin/customers` — Registered customer accounts
- `GET /api/admin/coupons` — List promotional coupons
- `POST /api/admin/coupons` — Create new coupon
- `PATCH /api/admin/coupons/:id` — Toggle active status or edit coupon
