-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `central_stores`;

USE `central_stores`;

DROP TABLE IF EXISTS `users`;

CREATE TABLE
  `users` (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    role ENUM (
      'ADMIN',
      'STORES_MANAGER',
      'DEPARTMENT_DEAN',
      'PROCUREMENT_OFFICER',
      'CFO'
    ) NOT NULL,
    last_name VARCHAR(100),
    first_name VARCHAR(100),
    email VARCHAR(100),
    username VARCHAR(50),
    department VARCHAR(100) DEFAULT '',
    blockchain_address VARCHAR(255),
    encrypted_private_key TEXT,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `stocks`;

CREATE TABLE
  `stocks` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `item_name` VARCHAR(100) NOT NULL,
    `original_quantity` INT NOT NULL,
    `current_quantity` INT NOT NULL,
    `cost_each` DECIMAL(10, 2) NOT NULL,
    `prev_location` VARCHAR(100) DEFAULT NULL,
    `curr_location` VARCHAR(100) DEFAULT NULL,
    -- `location_reason` TEXT DEFAULT NULL,
    `available` TINYINT (1) DEFAULT 1,
    -- `category` VARCHAR(50) DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

INSERT INTO
  `stocks` (
    item_name,
    original_quantity,
    current_quantity,
    cost_each,
    prev_location,
    curr_location,
    available,
    created_at,
    updated_at
  )
VALUES
  -- Office Supplies
  (
    'Printer Paper A4',
    200,
    150,
    150.00,
    'Supplier',
    'Central Stores',
    1,
    '2025-01-10 09:15:00',
    '2025-02-05 14:30:00'
  ),
  (
    'Pens Blue',
    500,
    420,
    2.50,
    'Supplier',
    'Central Stores',
    1,
    '2025-01-12 11:05:00',
    '2025-02-12 16:45:00'
  ),
  (
    'Staplers',
    50,
    45,
    75.00,
    'Supplier',
    'Central Stores',
    1,
    '2025-01-18 10:20:00',
    '2025-02-15 09:50:00'
  ),
  -- Cleaning Materials
  (
    'Mops',
    40,
    38,
    85.00,
    'Supplier',
    'Central Stores',
    1,
    '2025-02-01 08:10:00',
    '2025-03-01 12:25:00'
  ),
  (
    'Buckets',
    30,
    27,
    65.00,
    'Supplier',
    'Central Stores',
    1,
    '2025-02-05 13:00:00',
    '2025-03-05 15:40:00'
  ),
  (
    'Detergent 5L',
    25,
    20,
    120.00,
    'Supplier',
    'Central Stores',
    1,
    '2025-02-08 09:35:00',
    '2025-03-07 10:15:00'
  ),
  -- ICT Equipment
  (
    'Laptops HP',
    20,
    18,
    9500.00,
    'Warehouse A',
    'ICT Office',
    1,
    '2025-02-15 14:10:00',
    '2025-03-15 16:50:00'
  ),
  (
    'Desktops Dell',
    15,
    12,
    8000.00,
    'Warehouse A',
    'ICT Office',
    1,
    '2025-02-20 11:25:00',
    '2025-03-18 09:40:00'
  ),
  (
    'Projectors Epson',
    10,
    9,
    5000.00,
    'Warehouse A',
    'Lecture Theatres',
    1,
    '2025-02-22 10:00:00',
    '2025-03-20 14:30:00'
  ),
  -- Furniture
  (
    'Office Chairs',
    60,
    55,
    600.00,
    'Supplier',
    'Central Stores',
    1,
    '2025-03-01 09:45:00',
    '2025-03-22 13:15:00'
  ),
  (
    'Office Desks',
    40,
    35,
    1200.00,
    'Supplier',
    'Central Stores',
    1,
    '2025-03-05 15:00:00',
    '2025-03-25 16:00:00'
  ),
  (
    'Bookshelves',
    20,
    18,
    900.00,
    'Supplier',
    'Library',
    1,
    '2025-03-08 08:20:00',
    '2025-03-28 11:50:00'
  ),
  -- Safety and Miscellaneous
  (
    'First Aid Kits',
    15,
    14,
    250.00,
    'Supplier',
    'Clinic',
    1,
    '2025-03-12 14:00:00',
    '2025-04-01 10:30:00'
  ),
  (
    'Fire Extinguishers',
    25,
    24,
    850.00,
    'Supplier',
    'Central Stores',
    1,
    '2025-03-15 09:10:00',
    '2025-04-03 12:15:00'
  ),
  (
    'Safety Helmets',
    100,
    95,
    150.00,
    'Supplier',
    'Engineering Dept.',
    1,
    '2025-03-20 13:30:00',
    '2025-04-05 15:25:00'
  );

DROP TABLE IF EXISTS `requests`;

CREATE TABLE
  `requests` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `stock_id` INT NOT NULL,
    `item_name` VARCHAR(100) NOT NULL,
    `quantity` INT NOT NULL,
    `priority` ENUM ('LOW', 'MEDIUM', 'HIGH') DEFAULT 'LOW',
    `reason` TEXT,
    `department` VARCHAR(50) NOT NULL,
    `status` ENUM (
      'PENDING',
      'APPROVED',
      'REJECTED',
      'FULFILLED',
      'IN_PROGRESS',
      'IN PROGRESS'
    ) DEFAULT 'PENDING',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `user_id` (`user_id`),
    KEY `stock_id` (`stock_id`),
    blockchain_address VARCHAR(255) NOT NULL,
    CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `blockchain`;

CREATE TABLE
  `blockchain` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `transaction_id` VARCHAR(255) NOT NULL UNIQUE,
    `request_id` INT NOT NULL,
    `block_number` INT NOT NULL,
    `status` ENUM (
      'PENDING',
      'APPROVED',
      'REJECTED',
      'FULFILLED',
      'IN_PROGRESS',
      'IN PROGRESS'
    ) DEFAULT 'PENDING',
    `user_id` INT NOT NULL,
    `stock_id` INT NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `request_id` (`request_id`),
    KEY `user_id` (`user_id`),
    KEY `stock_id` (`stock_id`),
    CONSTRAINT `blockchain_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE,
    CONSTRAINT `blockchain_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `blockchain_ibfk_3` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `departments`;

CREATE TABLE
  `departments` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

INSERT INTO
  `departments` (`name`)
VALUES
  ('Computer Science'),
  ('Information Technology'),
  ('Mathematics'),
  ('Physics'),
  ('Chemistry'),
  ('Biology'),
  ('Civil Engineering'),
  ('Electrical Engineering'),
  ('Mechanical Engineering'),
  ('Economics'),
  ('Accounting'),
  ('Law');