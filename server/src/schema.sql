-- schema.sql

CREATE DATABASE IF NOT EXISTS secure_chat;
USE secure_chat;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  ecdh_public TEXT,
  rsa_public TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  iv VARCHAR(24) NOT NULL,
  ciphertext TEXT NOT NULL,
  hmac TEXT NOT NULL,
  algorithm VARCHAR(20) NOT NULL DEFAULT 'AES-256-CBC',
  publicKey TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
