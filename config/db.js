const mysql = require('mysql2/promise');

// Create connection pool for better performance and connection management
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'snake_game',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to test database connection
async function testDatabaseConnection() {
    try {
        // Attempt to get a connection from the pool
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release(); // Release the connection back to the pool
        return true;
    } catch (error) {
        console.error('Database connection error:', error);
        return false;
    }
}

module.exports = {
    pool,
    testDatabaseConnection
};