# Secure Messaging System

## Overview
A secure, real-time messaging application built with React, Node.js, Express, and MySQL. Users can sign up, log in, and exchange encrypted messages that are transmitted in real-time, ensuring confidentiality, integrity, and authenticity.

## Features
- **User Authentication & Authorization**: Sign-up and login with hashed passwords and JWT-based sessions.
- **End-to-End Encryption**: Choose from supported algorithms (e.g., AES-256-CBC, RSA). Messages are encrypted on the sender's side and decrypted on the receiver's side.
- **Real-time Chat**: Leveraging WebSockets (Socket.IO) for instant message delivery.
- **Message Integrity & Tamper-Proofing**: HMAC or digital signatures to detect any alteration.
- **Secure Transport**: All API requests are served over HTTPS/TLS.

## Architecture
```
[React Frontend] <── HTTPS ──> [Express API Server] <── MySQL Database
     │                                      │
     └── WebSocket (socket.io) ─────────────┘
```

## Tech Stack
- **Frontend**: React, Redux (for state management), Socket.IO-client
- **Backend**: Node.js, Express, Socket.IO, jsonwebtoken, bcrypt
- **Database**: MySQL
- **Security**: HTTPS/TLS, bcrypt for password hashing, JWT for auth, crypto module for encryption/HMAC

## Security Model
### Authentication
- **Sign-up**: Passwords are hashed with bcrypt before storage.
- **Login**: Users receive a JWT upon successful authentication, stored in HTTP-only cookies or local storage.

### Authorization
- Protect routes with JWT middleware, verifying token and user identity.

### Encryption & Integrity
1. **Key Exchange**: Use Diffie–Hellman (ECDH) to agree on a shared secret per conversation.
2. **Message Encryption**: AES-256-CBC with a random IV for each message.
3. **Tamper Detection**: Compute HMAC-SHA256 on the ciphertext and IV, attach to the message payload.
4. **Decryption & Verification**: Receiver verifies HMAC, then decrypts.

## Real-time Communication
- Establish a Socket.IO connection after login.
- On `sendMessage`, encrypt the plaintext, compute HMAC, then emit:
  ```js
  socket.emit('message', { to, iv, ciphertext, hmac });
  ```
- On `message` event, verify HMAC, decrypt ciphertext, update UI.

## Database Schema
```sql
-- schema.sql
CREATE DATABASE IF NOT EXISTS secure_chat;
USE secure_chat;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  iv VARCHAR(24) NOT NULL,
  ciphertext TEXT NOT NULL,
  hmac VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Endpoints
### Authentication
| Method | Endpoint       | Description                      |
| ------ | -------------- | -------------------------------- |
| POST   | `/api/signup`  | Register a new user              |
| POST   | `/api/login`   | Authenticate and receive a JWT   |

### Chat
| Method | Endpoint                   | Description                             |
| ------ | -------------------------- | --------------------------------------- |
| GET    | `/api/users`               | List all registered users (for chat)    |
| GET    | `/api/messages/:userId`    | Fetch message history with a user       |
| POST   | `/api/messages`           | Send an encrypted message               |

## Getting Started
### Prerequisites
- Node.js v14+
- MySQL server
- npm or yarn

### Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/FediMechergui/secure-messaging.git
   cd secure-messaging
   ```
2. Install dependencies:
   ```bash
   # Backend
   cd server && npm install

   # Frontend
   cd ../client && npm install
   ```
3. Configure environment variables in `server/.env`:
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD= 
   DB_NAME=secure_chat
   JWT_SECRET=gqhthbtjrvvt
   ```

### Running the Application
1. Start MySQL and import schema:
   ```bash
   mysql -u root -p < server/schema.sql
   ```
2. Start the backend server:
   ```bash
   cd server && npm start
   ```
3. Start the frontend:
   ```bash
   cd client && npm start
   ```
4. Open your browser at `http://localhost:3000`.

## Encryption Options
Users can select from supported algorithms in settings (default: AES-256-CBC). The key exchange is handled transparently via ECDH.

## Security Considerations
- **Replay Attacks**: Include timestamps or nonces in HMAC input.
- **Rate Limiting**: Prevent brute-force login attempts.
- **CORS**: Restrict origins to your frontend domain.

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License
MIT License. See [LICENSE](LICENSE) for details.

