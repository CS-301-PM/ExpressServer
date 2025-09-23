-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `central_stores`
/*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */
/*!80016 DEFAULT ENCRYPTION='N' */;

USE `central_stores`;

-- ------------------------
-- Table structure for users
-- ------------------------
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
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- ------------------------
-- Table structure for stocks
-- ------------------------
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
    `location_reason` TEXT DEFAULT NULL,
    `available` TINYINT (1) DEFAULT 1,
    `category` VARCHAR(50) DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- ------------------------
-- Table structure for requests
-- ------------------------
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
      'IN_PROGRESS'
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

-- ------------------------
-- Table structure for blockchain
-- ------------------------
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
      'IN_PROGRESS'
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