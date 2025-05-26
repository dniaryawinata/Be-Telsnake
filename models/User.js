const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    // Menambahkan pengguna baru ke database
    register: async (name, email, password) => {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user into database
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
            [name, email, hashedPassword]
        );
        
        return result;
    },

    // Mencari pengguna berdasarkan email
    findByEmail: async (email) => {
        // Use pool.execute for promise-based query
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );
        
        return rows;
    }
};

module.exports = User;