const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
require('dotenv').config();

const { sequelize } = require('./models');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimitMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', aiRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();