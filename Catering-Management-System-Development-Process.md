# Catering Management System — Development Process

## 1. Project Overview

The **Catering Management System (CMS)** is a web application that connects customers with a catering business, allowing customers to browse and book services, staff to manage customer onboarding and bookings, and admins to oversee and approve staff actions and the overall business.

**Tech Stack**

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js (Express) |
| Database | MySQL (managed via SQLyog Ultimate v9.62) |

---

## 2. User Roles

The system has **three roles**, each with its own dashboard and permission scope.

### 2.1 Customer
- Registered **only by Staff** (no public self-signup).
- Can log in once the account is **verified by Admin**.
- Browses services by category on the landing page.
- Creates bookings, tracks booking/order status, views invoices/payments, updates own profile & password.

### 2.2 Staff
- Creates customer accounts by encoding the customer's profile:
  - `Firstname`, `Lastname`, `Gender`, `Age`, `Number (Contact No.)`, `Email`, `Password`
- Newly created customer accounts are saved with status **`pending`** and routed to the **Admin** for verification/approval.
- Manages bookings assigned to them (confirm schedules, update order status, coordinate delivery/setup).
- Has a Staff Dashboard showing pending verifications, assigned bookings, and daily event schedules.

### 2.3 Admin
- Verifies/approves or rejects customer accounts created by Staff.
- Manages Staff accounts (create/deactivate).
- Manages Services, Categories, Packages, and Equipment inventory.
- Views full booking/order records, payments, and reports.
- Has an Admin Dashboard with system-wide analytics (total bookings, pending verifications, revenue, upcoming events).

### 2.4 Role Access Summary

| Feature | Customer | Staff | Admin |
|---|:---:|:---:|:---:|
| Self-registration | ❌ | ❌ | ❌ |
| Create customer account | ❌ | ✅ | ✅ |
| Verify/approve customer account | ❌ | ❌ | ✅ |
| Browse services & book | ✅ | ❌ | ❌ |
| Manage bookings (assigned) | ❌ | ✅ | ✅ |
| Manage services/categories | ❌ | ❌ | ✅ |
| Manage staff accounts | ❌ | ❌ | ✅ |
| View system reports | ❌ | ❌ | ✅ |
| Own Dashboard | ✅ | ✅ | ✅ |

---

## 3. Core Workflow — Input, Process, Output (I‑P‑O)

### 3.1 Workflow A: Customer Account Creation & Verification

| Stage | Details |
|---|---|
| **Input** | Staff encodes: Firstname, Lastname, Gender, Age, Number, Email, Password (via Staff Dashboard → "Add Customer" form) |
| **Process** | 1. Backend validates required fields & email format.<br>2. Password is hashed (bcrypt).<br>3. Record inserted into `users` table with `role = 'customer'` and `account_status = 'pending'`.<br>4. A notification/entry is queued for Admin review (`verification_logs` / `notifications`). |
| **Output** | Customer account appears in **Admin Dashboard → Pending Verifications**. Admin approves → `account_status = 'verified'` (customer can now log in). Admin rejects → `account_status = 'rejected'` (with remarks), Staff is notified to correct/re-submit. |

### 3.2 Workflow B: Customer Login & Landing Page Browsing

| Stage | Details |
|---|---|
| **Input** | Email + Password (login) or anonymous visit to the public landing page |
| **Process** | 1. Landing page fetches active `service_categories` and their `services` for public display (no login required to browse).<br>2. On login, backend authenticates credentials, checks `account_status = 'verified'`, issues JWT. |
| **Output** | Landing page renders services grouped by category (Event Catering, Food Delivery & On-Site Setup, Dessert & Beverage Packages, Equipment & Utensil Rental). Verified customers land on their Customer Dashboard after login. |

### 3.3 Workflow C: Service Booking (Customer)

| Stage | Details |
|---|---|
| **Input** | Customer selects services/packages, event type, event date, venue, guest count, and optional add-ons (dessert/beverage, equipment rental items) via a booking form. |
| **Process** | 1. Backend validates event date availability.<br>2. Creates a `bookings` record (`status = 'pending'`).<br>3. Inserts each selected service/item into `booking_items`.<br>4. Computes total amount via stored procedure. |
| **Output** | Booking appears in Customer Dashboard (status: *Pending Confirmation*) and in the Staff Dashboard queue for processing. A total cost summary/invoice draft is generated. |

### 3.4 Workflow D: Booking Handling (Staff)

| Stage | Details |
|---|---|
| **Input** | Staff reviews pending bookings, confirms schedule/logistics (delivery time, crew assignment, equipment reserved). |
| **Process** | 1. Staff updates `bookings.status` (`confirmed` → `preparing` → `on the way` → `completed`).<br>2. Equipment/stock quantities are decremented if rental items are involved.<br>3. System logs status-change history. |
| **Output** | Customer sees live status updates on their dashboard. Admin sees the booking reflected in overall reports. |

### 3.5 Workflow E: Payment Recording

| Stage | Details |
|---|---|
| **Input** | Staff/Admin records a payment (mode, amount, reference no.) against a booking, or customer submits proof of payment. |
| **Process** | Backend inserts into `payments`, recalculates `balance = total_amount - SUM(payments)`, updates `payment_status` (`unpaid`/`partial`/`paid`). |
| **Output** | Updated invoice/receipt visible to Customer; payment ledger visible to Admin for financial reporting. |

### 3.6 Workflow F: Admin Oversight

| Stage | Details |
|---|---|
| **Input** | Admin reviews pending customer verifications, staff performance, service catalog updates. |
| **Process** | Approve/reject accounts, add/edit/deactivate services & categories, manage staff accounts, generate reports (revenue, bookings per category, upcoming events). |
| **Output** | Updated system-wide data reflected across Staff and Customer dashboards in real time. |

---

## 4. Services Offered (Landing Page Categories)

The landing page displays services **grouped by category**, pulled from the `service_categories` and `services` tables.

1. **Event Catering (Special Occasions)**
   - Full-service food preparation and serving for personal celebrations.
   - Examples: Weddings (Kasal), Birthdays, Baptismal, Anniversaries, Family Reunions.

2. **Food Delivery & On-Site Setup**
   - Reliable delivery of food to the venue with professional setup.
   - Examples: Buffet station setup, chafing dish provision, optional serving staff/crew.

3. **Dessert & Beverage Packages**
   - Add-on packages to complement the main meal.
   - Examples: Custom cakes, pastry platters, drink stations (juice, coffee, tea), dessert bars.

4. **Equipment & Utensil Rental**
   - Provision of necessary dining and serving equipment.
   - Examples: Tables, chairs, tablecloths, plates, glasses, cutlery, serving trays.

---

## 5. Folder Structure

Only two top-level folders as required: **frontend** (React) and **backend** (Node.js). Each includes its own `.gitignore` and `.env`.

```
catering-management-system/
│
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                      # images, icons, logo
│   │   ├── components/
│   │   │   ├── common/                  # Navbar, Footer, Loader, ProtectedRoute
│   │   │   ├── customer/                # BookingForm, ServiceCard, InvoiceCard
│   │   │   ├── staff/                   # CustomerAccountForm, BookingQueue
│   │   │   └── admin/                   # VerificationTable, ServiceManager, StaffManager
│   │   ├── pages/
│   │   │   ├── LandingPage/             # Public landing page w/ service categories
│   │   │   ├── auth/                    # Login.jsx
│   │   │   ├── customer/                # CustomerDashboard, MyBookings, Profile
│   │   │   ├── staff/                   # StaffDashboard, AddCustomer, ManageBookings
│   │   │   └── admin/                   # AdminDashboard, VerifyAccounts, ManageServices, Reports
│   │   ├── context/                     # AuthContext.jsx
│   │   ├── hooks/                       # useAuth.js, useFetch.js
│   │   ├── services/                    # api.js (axios instance), authService.js, bookingService.js
│   │   ├── routes/                      # AppRoutes.jsx, RoleBasedRoute.jsx
│   │   ├── utils/                       # validators.js, formatCurrency.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── src/
    │   ├── config/
    │   │   └── db.js                    # MySQL connection pool
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── customerController.js
    │   │   ├── staffController.js
    │   │   ├── adminController.js
    │   │   ├── serviceController.js
    │   │   ├── bookingController.js
    │   │   └── paymentController.js
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── customerRoutes.js
    │   │   ├── staffRoutes.js
    │   │   ├── adminRoutes.js
    │   │   ├── serviceRoutes.js
    │   │   ├── bookingRoutes.js
    │   │   └── paymentRoutes.js
    │   ├── middlewares/
    │   │   ├── authMiddleware.js         # JWT verification
    │   │   ├── roleMiddleware.js         # role-based access control
    │   │   └── errorHandler.js
    │   ├── models/                       # optional query builders/helpers per table
    │   │   ├── userModel.js
    │   │   ├── serviceModel.js
    │   │   ├── bookingModel.js
    │   │   └── paymentModel.js
    │   ├── utils/
    │   │   ├── hashPassword.js
    │   │   └── generateToken.js
    │   └── app.js
    ├── server.js
    ├── .env
    ├── .gitignore
    └── package.json
```

### 5.1 `frontend/.gitignore`
```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
```

### 5.2 `frontend/.env`
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 5.3 `backend/.gitignore`
```
node_modules/
.env
*.log
uploads/
.DS_Store
```

### 5.4 `backend/.env`
```
PORT=5000
DB_HOST=localhost
DB_USER=cms_db
DB_PASS=cms_db
DB_NAME=cms
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
```

---

## 6. Database Design

Database name: **`cms`** (as configured in `.env`, credentials: `cms_db` / `cms_db`).

### 6.1 Entity Overview

| Table | Purpose |
|---|---|
| `users` | Stores Customer, Staff, and Admin accounts (single table, differentiated by `role`) |
| `verification_logs` | Audit trail of Admin approving/rejecting Staff-created customer accounts |
| `service_categories` | The 4 service categories shown on the landing page |
| `services` | Individual services/packages under each category |
| `bookings` | Customer bookings/orders |
| `booking_items` | Line items (services/equipment) attached to a booking |
| `payments` | Payment records per booking |
| `notifications` | In-app notifications (e.g., pending verification alerts) |

### 6.2 SQL — Table Creation

```sql
CREATE DATABASE IF NOT EXISTS cms;
USE cms;

-- =========================================
-- USERS (Customer, Staff, Admin)
-- =========================================
CREATE TABLE users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    firstname       VARCHAR(50)  NOT NULL,
    lastname        VARCHAR(50)  NOT NULL,
    gender          ENUM('Male', 'Female', 'Other') NOT NULL,
    age             INT NOT NULL,
    contact_number  VARCHAR(20)  NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    role            ENUM('customer', 'staff', 'admin') NOT NULL DEFAULT 'customer',
    account_status  ENUM('pending', 'verified', 'rejected', 'active', 'inactive')
                    NOT NULL DEFAULT 'active',
    created_by      INT NULL,                    -- staff_id who created a customer account
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- =========================================
-- VERIFICATION LOGS (Admin approves Staff-created customers)
-- =========================================
CREATE TABLE verification_logs (
    log_id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,                  -- the customer account being verified
    reviewed_by   INT NOT NULL,                  -- admin user_id
    action        ENUM('approved', 'rejected') NOT NULL,
    remarks       VARCHAR(255) NULL,
    action_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vl_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_vl_admin FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

-- =========================================
-- SERVICE CATEGORIES
-- =========================================
CREATE TABLE service_categories (
    category_id     INT AUTO_INCREMENT PRIMARY KEY,
    category_name   VARCHAR(100) NOT NULL UNIQUE,
    description     VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- SERVICES (under each category)
-- =========================================
CREATE TABLE services (
    service_id      INT AUTO_INCREMENT PRIMARY KEY,
    category_id     INT NOT NULL,
    service_name    VARCHAR(150) NOT NULL,
    description     VARCHAR(500),
    base_price      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    unit            VARCHAR(30) DEFAULT 'package',   -- e.g., per head, per unit, per package
    image_url       VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES service_categories(category_id)
);

-- =========================================
-- BOOKINGS
-- =========================================
CREATE TABLE bookings (
    booking_id      INT AUTO_INCREMENT PRIMARY KEY,
    customer_id     INT NOT NULL,
    handled_by      INT NULL,                         -- staff_id assigned
    event_type      VARCHAR(100) NOT NULL,             -- Wedding, Birthday, Baptismal, etc.
    event_date      DATE NOT NULL,
    venue_address   VARCHAR(255) NOT NULL,
    guest_count     INT NOT NULL,
    status          ENUM('pending','confirmed','preparing','on_the_way','completed','cancelled')
                    NOT NULL DEFAULT 'pending',
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(user_id),
    CONSTRAINT fk_bookings_staff FOREIGN KEY (handled_by) REFERENCES users(user_id)
);

-- =========================================
-- BOOKING ITEMS (services/equipment selected per booking)
-- =========================================
CREATE TABLE booking_items (
    item_id         INT AUTO_INCREMENT PRIMARY KEY,
    booking_id      INT NOT NULL,
    service_id      INT NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_bi_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_bi_service FOREIGN KEY (service_id) REFERENCES services(service_id)
);

-- =========================================
-- PAYMENTS
-- =========================================
CREATE TABLE payments (
    payment_id      INT AUTO_INCREMENT PRIMARY KEY,
    booking_id      INT NOT NULL,
    amount_paid     DECIMAL(10,2) NOT NULL,
    payment_method  ENUM('cash','gcash','bank_transfer','card') NOT NULL DEFAULT 'cash',
    reference_no    VARCHAR(100),
    recorded_by     INT NOT NULL,                    -- staff/admin user_id
    payment_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    CONSTRAINT fk_payments_user FOREIGN KEY (recorded_by) REFERENCES users(user_id)
);

-- =========================================
-- NOTIFICATIONS
-- =========================================
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,                    -- recipient (e.g., admin or staff)
    message         VARCHAR(255) NOT NULL,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### 6.3 Seed Data — Service Categories & Sample Services

```sql
INSERT INTO service_categories (category_name, description) VALUES
('Event Catering (Special Occasions)', 'Full-service food preparation and serving for personal celebrations.'),
('Food Delivery & On-Site Setup', 'Reliable delivery of food to the venue with professional setup.'),
('Dessert & Beverage Packages', 'Add-on packages to complement the main meal.'),
('Equipment & Utensil Rental', 'Provision of necessary dining and serving equipment.');

INSERT INTO services (category_id, service_name, description, base_price, unit) VALUES
(1, 'Wedding Catering Package', 'Full catering service for weddings (Kasal).', 25000.00, 'package'),
(1, 'Birthday Catering Package', 'Catering package for birthday celebrations.', 12000.00, 'package'),
(1, 'Baptismal Catering Package', 'Catering package for baptismal events.', 10000.00, 'package'),
(1, 'Family Reunion Package', 'Catering package for family reunions.', 15000.00, 'package'),
(2, 'Buffet Station Setup', 'Professional buffet station setup at the venue.', 5000.00, 'package'),
(2, 'Chafing Dish Provision', 'Rental and setup of chafing dishes.', 150.00, 'unit'),
(2, 'Serving Crew (per head)', 'Optional professional serving staff.', 800.00, 'per head'),
(3, 'Custom Cake', 'Personalized custom cake for the event.', 2500.00, 'unit'),
(3, 'Pastry Platter', 'Assorted pastry platter.', 1800.00, 'platter'),
(3, 'Drink Station (Juice/Coffee/Tea)', 'Beverage station for guests.', 3500.00, 'package'),
(3, 'Dessert Bar', 'Assorted dessert bar setup.', 4500.00, 'package'),
(4, 'Table Rental', 'Rental of event tables.', 100.00, 'unit'),
(4, 'Chair Rental', 'Rental of event chairs.', 30.00, 'unit'),
(4, 'Tablecloth Rental', 'Rental of tablecloths.', 50.00, 'unit'),
(4, 'Plates & Glasses Set', 'Rental of plates and glasses per set.', 20.00, 'set'),
(4, 'Cutlery Set', 'Rental of cutlery per set.', 15.00, 'set'),
(4, 'Serving Tray Rental', 'Rental of serving trays.', 40.00, 'unit');
```

### 6.4 Stored Procedures

```sql
DELIMITER $$

-- =====================================================================
-- SP1: Staff creates a Customer account (status = pending)
-- =====================================================================
CREATE PROCEDURE sp_create_customer_account (
    IN p_firstname      VARCHAR(50),
    IN p_lastname       VARCHAR(50),
    IN p_gender         VARCHAR(10),
    IN p_age            INT,
    IN p_contact_number VARCHAR(20),
    IN p_email          VARCHAR(100),
    IN p_password_hash  VARCHAR(255),
    IN p_staff_id       INT
)
BEGIN
    INSERT INTO users (
        firstname, lastname, gender, age, contact_number,
        email, password, role, account_status, created_by
    ) VALUES (
        p_firstname, p_lastname, p_gender, p_age, p_contact_number,
        p_email, p_password_hash, 'customer', 'pending', p_staff_id
    );

    -- Notify all admins of a new account pending verification
    INSERT INTO notifications (user_id, message)
    SELECT user_id, CONCAT('New customer account "', p_firstname, ' ', p_lastname, '" awaiting verification.')
    FROM users WHERE role = 'admin';

    SELECT LAST_INSERT_ID() AS new_user_id;
END$$


-- =====================================================================
-- SP2: Admin verifies (approves/rejects) a Staff-created Customer account
-- =====================================================================
CREATE PROCEDURE sp_verify_customer_account (
    IN p_user_id     INT,
    IN p_admin_id    INT,
    IN p_action      VARCHAR(10),   -- 'approved' or 'rejected'
    IN p_remarks     VARCHAR(255)
)
BEGIN
    UPDATE users
    SET account_status = IF(p_action = 'approved', 'verified', 'rejected')
    WHERE user_id = p_user_id AND role = 'customer';

    INSERT INTO verification_logs (user_id, reviewed_by, action, remarks)
    VALUES (p_user_id, p_admin_id, p_action, p_remarks);
END$$


-- =====================================================================
-- SP3: Get all services grouped by category (for landing page)
-- =====================================================================
CREATE PROCEDURE sp_get_services_by_category ()
BEGIN
    SELECT
        c.category_id,
        c.category_name,
        c.description AS category_description,
        s.service_id,
        s.service_name,
        s.description AS service_description,
        s.base_price,
        s.unit,
        s.image_url
    FROM service_categories c
    JOIN services s ON s.category_id = c.category_id
    WHERE c.is_active = TRUE AND s.is_active = TRUE
    ORDER BY c.category_id, s.service_name;
END$$


-- =====================================================================
-- SP4: Create a new booking (header only)
-- =====================================================================
CREATE PROCEDURE sp_create_booking (
    IN p_customer_id   INT,
    IN p_event_type    VARCHAR(100),
    IN p_event_date    DATE,
    IN p_venue_address VARCHAR(255),
    IN p_guest_count   INT
)
BEGIN
    INSERT INTO bookings (customer_id, event_type, event_date, venue_address, guest_count, status)
    VALUES (p_customer_id, p_event_type, p_event_date, p_venue_address, p_guest_count, 'pending');

    SELECT LAST_INSERT_ID() AS new_booking_id;
END$$


-- =====================================================================
-- SP5: Add a service/equipment line item to a booking
-- =====================================================================
CREATE PROCEDURE sp_add_booking_item (
    IN p_booking_id  INT,
    IN p_service_id  INT,
    IN p_quantity    INT
)
BEGIN
    DECLARE v_price DECIMAL(10,2);

    SELECT base_price INTO v_price FROM services WHERE service_id = p_service_id;

    INSERT INTO booking_items (booking_id, service_id, quantity, unit_price, subtotal)
    VALUES (p_booking_id, p_service_id, p_quantity, v_price, v_price * p_quantity);

    -- Recalculate booking total
    UPDATE bookings b
    SET total_amount = (
        SELECT COALESCE(SUM(subtotal), 0) FROM booking_items WHERE booking_id = p_booking_id
    )
    WHERE b.booking_id = p_booking_id;
END$$


-- =====================================================================
-- SP6: Update booking status (Staff/Admin)
-- =====================================================================
CREATE PROCEDURE sp_update_booking_status (
    IN p_booking_id INT,
    IN p_status     VARCHAR(20),
    IN p_staff_id   INT
)
BEGIN
    UPDATE bookings
    SET status = p_status,
        handled_by = COALESCE(p_staff_id, handled_by)
    WHERE booking_id = p_booking_id;
END$$


-- =====================================================================
-- SP7: Record a payment against a booking
-- =====================================================================
CREATE PROCEDURE sp_record_payment (
    IN p_booking_id     INT,
    IN p_amount_paid    DECIMAL(10,2),
    IN p_payment_method VARCHAR(20),
    IN p_reference_no   VARCHAR(100),
    IN p_recorded_by    INT
)
BEGIN
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_paid  DECIMAL(10,2);

    INSERT INTO payments (booking_id, amount_paid, payment_method, reference_no, recorded_by)
    VALUES (p_booking_id, p_amount_paid, p_payment_method, p_reference_no, p_recorded_by);

    SELECT total_amount INTO v_total FROM bookings WHERE booking_id = p_booking_id;
    SELECT COALESCE(SUM(amount_paid), 0) INTO v_paid FROM payments WHERE booking_id = p_booking_id;

    SELECT v_total AS total_amount, v_paid AS total_paid, (v_total - v_paid) AS balance;
END$$


-- =====================================================================
-- SP8: Admin dashboard summary (counts & revenue)
-- =====================================================================
CREATE PROCEDURE sp_admin_dashboard_summary ()
BEGIN
    SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'customer' AND account_status = 'pending') AS pending_verifications,
        (SELECT COUNT(*) FROM bookings WHERE status = 'pending') AS pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'completed') AS completed_bookings,
        (SELECT COALESCE(SUM(amount_paid), 0) FROM payments) AS total_revenue;
END$$

DELIMITER ;
```

### 6.5 Example Usage

```sql
-- Staff creates a customer account
CALL sp_create_customer_account('Maria', 'Santos', 'Female', 28, '09171234567',
    'maria.santos@example.com', '$2b$10$hashedpasswordvalue', 3);

-- Admin approves the account
CALL sp_verify_customer_account(15, 1, 'approved', 'Documents verified.');

-- Landing page fetch
CALL sp_get_services_by_category();

-- Customer creates a booking
CALL sp_create_booking(15, 'Wedding', '2026-12-12', 'Calinog, Iloilo', 150);

-- Add services to the booking
CALL sp_add_booking_item(1, 1, 1);   -- Wedding Catering Package x1
CALL sp_add_booking_item(1, 8, 1);   -- Custom Cake x1

-- Staff updates booking status
CALL sp_update_booking_status(1, 'confirmed', 3);

-- Record a payment
CALL sp_record_payment(1, 10000.00, 'gcash', 'GC-2026-00021', 3);

-- Admin dashboard summary
CALL sp_admin_dashboard_summary();
```

---

## 7. Dashboard Summary per Role

### 7.1 Customer Dashboard
- Landing page browsing (services by category)
- My Bookings (status tracker: pending → confirmed → preparing → on the way → completed)
- Invoices & payment history
- Profile management

### 7.2 Staff Dashboard
- Add Customer Account (profiling form) → sends to Admin for verification
- Verification status tracker (pending/approved/rejected accounts they created)
- Booking Queue (assigned bookings, update status)
- Daily/weekly event schedule

### 7.3 Admin Dashboard
- Pending Customer Verifications (approve/reject with remarks)
- Staff Account Management
- Service & Category Management (CRUD)
- All Bookings & Payments overview
- Reports/Analytics (revenue, bookings per category, pending items)

---

## 8. Development Process Summary

1. **Planning** — Define roles, permissions, and the Input–Process–Output flow for each module.
2. **Database Design** — Create the `cms` MySQL database, tables, and stored procedures in SQLyog Ultimate.
3. **Backend Development (Node.js)** — Build Express routes/controllers per role, JWT-based auth, role middleware, and stored-procedure calls via a MySQL connection pool.
4. **Frontend Development (React)** — Build the public landing page (services by category), auth pages, and role-specific dashboards (Customer/Staff/Admin).
5. **Integration** — Connect frontend to backend REST APIs; implement the Staff→Admin verification flow end-to-end.
6. **Testing** — Validate account creation/verification, booking flow, payment recording, and role-based access restrictions.
7. **Deployment** — Configure `.env` files for both `frontend` and `backend`, exclude sensitive files via `.gitignore`, and deploy.
