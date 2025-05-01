require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

// Database setup
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './sentinelid.db'
});

// Models
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  isMaster: DataTypes.BOOLEAN
});

const Alert = sequelize.define('Alert', {
  faceId: DataTypes.STRING,
  cameraId: DataTypes.STRING,
  alertType: DataTypes.STRING,
  description: DataTypes.TEXT
});

// Create master user on startup
async function initialize() {
  await sequelize.sync();
  const masterUser = await User.findOne({ where: { isMaster: true } });
  if (!masterUser) {
    await User.create({
      username: 'admin',
      password: bcrypt.hashSync('password123', 10),
      isMaster: true
    });
  }
}

// Auth middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Routes
app.post('/login', async (req, res) => {
  const user = await User.findOne({ where: { username: req.body.username } });
  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET);
  res.json({ token });
});

app.get('/alerts', authenticateToken, async (req, res) => {
  const alerts = await Alert.findAll();
  res.json(alerts);
});

// Start server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, async () => {
  await initialize();
  console.log(`Server running on port ${PORT}`);
});

// WebSocket setup
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
