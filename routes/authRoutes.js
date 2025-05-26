const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validate input
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if user already exists
        const existingUsers = await User.findByEmail(email);
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email is already taken" });
        }

        // Register new user
        await User.register(name, email, password);
        
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            message: "Error registering user", 
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const users = await User.findByEmail(email);
        
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = users[0];

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret_key',
            { expiresIn: '1h' }
        );

        res.status(200).json({ 
            message: "Login successful", 
            token,
            userId: user.id 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            message: "Error during login", 
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

module.exports = router;