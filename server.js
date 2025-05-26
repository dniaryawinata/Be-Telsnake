require('dotenv').config(); // Load environment variables
const app = require('./app');
const { pool, testDatabaseConnection } = require('./config/db');

// Graceful shutdown function
function gracefulShutdown(server) {
    console.log('Shutting down gracefully...');
    
    server.close(() => {
        console.log('HTTP server closed');
        
        // Close database connection pool
        pool.end(err => {
            if (err) {
                console.error('Error closing database connection pool:', err);
            }
            console.log('Database connection pool closed');
            process.exit(0);
        });
    });

    // Force close server after 10 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

// Main server startup function
async function startServer() {
    const PORT = process.env.PORT || 5000;

    // Test database connection before starting server
    const isDbConnected = await testDatabaseConnection();
    if (!isDbConnected) {
        console.error('Failed to connect to database. Server not started.');
        process.exit(1);
    }

    // Start the server
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Server environment:', process.env.NODE_ENV || 'development');
    });

    // Handle process termination signals
    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    // Optional: You might want to log this to a file or monitoring service
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Optional: Log the error and perform any necessary cleanup
    process.exit(1);
});

// Start the server
startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});