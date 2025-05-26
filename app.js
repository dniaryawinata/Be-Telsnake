const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/authRoutes');
const leaderBoardRoutes = require('./routes/leaderBoardRoutes');

const app = express();

// Security Middleware
app.use(helmet()); // Helps secure Express apps by setting various HTTP headers

// CORS Configuration
const corsOptions = {
    origin: true,
    credentials: true,
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging Middleware (optional, only in development)
if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', leaderBoardRoutes);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ 
        message: 'Route Not Found',
        path: req.path
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Different error responses based on environment
    const errorResponse = process.env.NODE_ENV === 'production' 
        ? { message: 'An unexpected error occurred' }
        : { 
            message: err.message,
            stack: err.stack 
        };

    res.status(err.status || 500).json(errorResponse);
});

module.exports = app;