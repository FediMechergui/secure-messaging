const express = require('express');
const fs = require('fs');
const https = require('https');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const { authenticateSocket } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const sslOptions = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.cert'),
};
const server = https.createServer(sslOptions, app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', authRoutes);
app.use('/api', chatRoutes);

// Socket.io
io.use((socket, next) => authenticateSocket(socket, next));
io.on('connection', (socket) => {
  const userId = socket.user.id;
  socket.join(`user_${userId}`);

  socket.on('message', (data) => {
    // data: { to, iv, ciphertext, hmac }
    io.to(`user_${data.to}`).emit('message', data);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
