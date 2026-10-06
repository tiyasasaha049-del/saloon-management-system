-- LUMINA LUXE SALON & SPA DATABASE INITIALIZATION SCRIPT FOR MYSQL
-- Run this script in MySQL Workbench, phpMyAdmin, or MySQL CLI:
-- Command: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS `lumina_salon` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lumina_salon`;

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `subcategory` VARCHAR(100) DEFAULT NULL,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `barcode` VARCHAR(50) DEFAULT NULL,
  `purchasePrice` DOUBLE DEFAULT 0,
  `costPrice` DOUBLE DEFAULT 0,
  `sellingPrice` DOUBLE DEFAULT 0,
  `retailPrice` DOUBLE DEFAULT 0,
  `tax` DOUBLE DEFAULT 18,
  `stock` INT DEFAULT 0,
  `quantity` INT DEFAULT 0,
  `minimumStock` INT DEFAULT 5,
  `minStockAlert` INT DEFAULT 5,
  `batch` VARCHAR(100) DEFAULT NULL,
  `expiry` VARCHAR(50) DEFAULT NULL,
  `supplier` VARCHAR(255) DEFAULT NULL,
  `type` VARCHAR(50) DEFAULT 'Retail',
  `status` VARCHAR(50) DEFAULT 'Active',
  `image` TEXT DEFAULT NULL,
  `images` JSON DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. SERVICES TABLE
CREATE TABLE IF NOT EXISTS `services` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `subCategory` VARCHAR(100) DEFAULT NULL,
  `price` DOUBLE NOT NULL,
  `duration` INT DEFAULT 30,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `image` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `customerName` VARCHAR(255) NOT NULL,
  `customerPhone` VARCHAR(50) DEFAULT NULL,
  `serviceName` VARCHAR(255) NOT NULL,
  `stylistName` VARCHAR(255) NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `time` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `totalPrice` DOUBLE DEFAULT 0,
  `chairNumber` VARCHAR(50) DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `role` VARCHAR(100) NOT NULL,
  `designation` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `joinDate` VARCHAR(50) DEFAULT NULL,
  `salary` DOUBLE DEFAULT 0,
  `status` VARCHAR(50) DEFAULT 'Active',
  `avatar` TEXT DEFAULT NULL,
  `specialties` JSON DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `employeeId` VARCHAR(50) NOT NULL,
  `employeeName` VARCHAR(255) NOT NULL,
  `date` VARCHAR(50) NOT NULL,
  `checkIn` VARCHAR(50) DEFAULT NULL,
  `checkOut` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Present',
  `workHours` DOUBLE DEFAULT 8.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `gender` VARCHAR(20) DEFAULT NULL,
  `vipStatus` VARCHAR(50) DEFAULT 'Standard',
  `visitsCount` INT DEFAULT 1,
  `totalSpent` DOUBLE DEFAULT 0,
  `lastVisit` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. INVOICES TABLE
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `invoiceNumber` VARCHAR(100) NOT NULL UNIQUE,
  `customerName` VARCHAR(255) NOT NULL,
  `customerPhone` VARCHAR(50) DEFAULT NULL,
  `date` VARCHAR(50) NOT NULL,
  `items` JSON NOT NULL,
  `subtotal` DOUBLE DEFAULT 0,
  `discount` DOUBLE DEFAULT 0,
  `couponCode` VARCHAR(50) DEFAULT NULL,
  `tax` DOUBLE DEFAULT 0,
  `total` DOUBLE DEFAULT 0,
  `paymentMethod` VARCHAR(50) DEFAULT 'Cash',
  `status` VARCHAR(50) DEFAULT 'Paid'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `customerName` VARCHAR(255) NOT NULL,
  `rating` INT DEFAULT 5,
  `comment` TEXT DEFAULT NULL,
  `date` VARCHAR(50) NOT NULL,
  `serviceName` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. OFFERS TABLE
CREATE TABLE IF NOT EXISTS `offers` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `discountPercent` DOUBLE DEFAULT 10.0,
  `validTill` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `time` VARCHAR(50) NOT NULL,
  `read` TINYINT(1) DEFAULT 0,
  `priority` VARCHAR(50) DEFAULT 'medium'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `timestamp` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. PRODUCT PARTNERS TABLE
CREATE TABLE IF NOT EXISTS `product_partners` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `partner_code` VARCHAR(50) NOT NULL UNIQUE,
  `company_name` VARCHAR(255) NOT NULL,
  `brand_name` VARCHAR(255) NOT NULL,
  `contact_person` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT 'India',
  `tax_id` VARCHAR(100) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'Hair Care',
  `partnership_type` VARCHAR(100) DEFAULT 'Product Promotion',
  `start_date` VARCHAR(50) DEFAULT NULL,
  `end_date` VARCHAR(50) DEFAULT NULL,
  `commission_type` VARCHAR(50) DEFAULT 'Percentage',
  `commission_rate` DOUBLE DEFAULT 10.0,
  `revenue_share` DOUBLE DEFAULT 0.0,
  `payment_terms` VARCHAR(100) DEFAULT 'Net 30 Days',
  `status` VARCHAR(50) DEFAULT 'Active',
  `description` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `logo_url` TEXT DEFAULT NULL,
  `contract_url` TEXT DEFAULT NULL,
  `distributor_id` VARCHAR(50) DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. PARTNERSHIP REQUESTS TABLE
CREATE TABLE IF NOT EXISTS `partnership_requests` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `request_code` VARCHAR(50) NOT NULL UNIQUE,
  `company_name` VARCHAR(255) NOT NULL,
  `brand_name` VARCHAR(255) NOT NULL,
  `contact_person` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `product_category` VARCHAR(100) DEFAULT 'Hair Care',
  `partnership_type` VARCHAR(100) DEFAULT 'Product Promotion',
  `proposal` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `submitted_date` VARCHAR(50) DEFAULT NULL,
  `review_notes` TEXT DEFAULT NULL,
  `reviewed_by` VARCHAR(255) DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. PARTNER PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS `partner_products` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `partner_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(50) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `purchase_price` DOUBLE DEFAULT 0.0,
  `selling_price` DOUBLE DEFAULT 0.0,
  `commission_rate` DOUBLE DEFAULT 10.0,
  `start_date` VARCHAR(50) DEFAULT NULL,
  `end_date` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `product_partners`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. PARTNERSHIP CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS `partnership_campaigns` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `campaign_code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `partner_id` VARCHAR(50) NOT NULL,
  `campaign_type` VARCHAR(100) DEFAULT 'Product Promotion',
  `start_date` VARCHAR(50) NOT NULL,
  `end_date` VARCHAR(50) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `discount` DOUBLE DEFAULT 0.0,
  `promo_code` VARCHAR(50) DEFAULT NULL,
  `target_sales` DOUBLE DEFAULT 0.0,
  `budget` DOUBLE DEFAULT 0.0,
  `salon_contribution` DOUBLE DEFAULT 0.0,
  `partner_contribution` DOUBLE DEFAULT 0.0,
  `marketing_channels` JSON DEFAULT NULL,
  `product_ids` JSON DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Active',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `product_partners`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. PARTNERSHIP COMMISSIONS TABLE
CREATE TABLE IF NOT EXISTS `partnership_commissions` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `partner_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) DEFAULT NULL,
  `campaign_id` VARCHAR(50) DEFAULT NULL,
  `invoice_id` VARCHAR(50) DEFAULT NULL,
  `invoice_number` VARCHAR(100) DEFAULT NULL,
  `sale_amount` DOUBLE DEFAULT 0.0,
  `commission_rate` DOUBLE DEFAULT 10.0,
  `commission_amount` DOUBLE DEFAULT 0.0,
  `period` VARCHAR(50) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'Approved',
  `payment_status` VARCHAR(50) DEFAULT 'Pending',
  `notes` TEXT DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `product_partners`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. PARTNERSHIP PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS `partnership_payments` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `payment_code` VARCHAR(50) NOT NULL UNIQUE,
  `partner_id` VARCHAR(50) NOT NULL,
  `commission_id` VARCHAR(50) DEFAULT NULL,
  `amount` DOUBLE DEFAULT 0.0,
  `payment_date` VARCHAR(50) NOT NULL,
  `payment_method` VARCHAR(100) DEFAULT 'Bank Transfer',
  `reference_number` VARCHAR(100) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Paid',
  `notes` TEXT DEFAULT NULL,
  `recorded_by` VARCHAR(255) DEFAULT 'Finance Admin',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `product_partners`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. PARTNERSHIP DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS `partnership_documents` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `partner_id` VARCHAR(50) NOT NULL,
  `document_name` VARCHAR(255) NOT NULL,
  `document_type` VARCHAR(100) DEFAULT 'Agreement',
  `file_url` TEXT DEFAULT NULL,
  `upload_date` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `product_partners`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. PARTNERSHIP ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS `partnership_activity_logs` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `partner_id` VARCHAR(50) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `user_name` VARCHAR(255) DEFAULT 'System',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `product_partners`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

