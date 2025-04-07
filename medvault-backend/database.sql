-- Create database (only if it doesn't already exist)
CREATE DATABASE IF NOT EXISTS medvault;

-- Use the database
USE medvault;

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    composition TEXT,
    uses TEXT,
    side_effects TEXT,
    manufacturer VARCHAR(255),
    image_url TEXT,
    excellent_review_percent FLOAT DEFAULT 0,
    average_review_percent FLOAT DEFAULT 0,
    poor_review_percent FLOAT DEFAULT 0
);
