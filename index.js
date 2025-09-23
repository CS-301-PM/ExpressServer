const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const sequelize = require('./sequelize');
const Web3Service = require('./blockchain/Web3Service');

// Import routes
const userRoutes = require('./routes/usersRoutes');
const requestRoutes = require('./routes/requestsRoutes');
const stockRoutes = require('./routes/stocksRoutes');
const departmentRoutes = require('./routes/departments');
const blockchainRoutes = require('./routes/blockchainRoutes');

const app = express();
const PORT = process.env.SERVER_PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(userRoutes);
app.use(requestRoutes);
app.use(stockRoutes);
app.use(departmentRoutes);
app.use(blockchainRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    blockchain: Web3Service.isConnected() ? 'Connected' : 'Disconnected'
  });
});

// Initialize application
async function initializeApp() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');

    // Test blockchain connection
    if (Web3Service.isConnected()) {
      console.log('✅ Blockchain connected successfully');
      Web3Service.subscribeToEvents();
      console.log('✅ Blockchain event listeners activated');
    } else {
      console.log('⚠️  Blockchain not connected - running in offline mode');
    }

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 CBU Central Stores API running on port ${PORT}`);
      console.log(`🔗 Blockchain: ${Web3Service.isConnected() ? 'Connected' : 'Disconnected'}`);
      console.log(`📊 Database: Central Stores`);
      console.log(`🌐 Origin: ${process.env.ORIGIN}`);
    });

  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    process.exit(1);
  }
}

initializeApp();