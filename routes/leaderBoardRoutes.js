const express = require('express');
const GameScore = require('../models/GameScore');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware untuk memverifikasi token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Ambil token dari header Authorization

    console.log('Received token:', token);

    if (!token) {
        return res.status(403).json({ message: 'Access Denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET || "your_very_long_and_complex_secret_key_here_minimum_32_characters", (err, user) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    });
};

// Rute untuk menyimpan skor
router.post('/gamescore', authenticateToken, async (req, res) => {
    try {
        const { userId, score, game, date, time } = req.body;

        // Validate required fields
        if (!userId || userId === 'undefined') {
            return res.status(400).json({ 
                message: 'User ID is required', 
                error: 'Invalid or missing user ID' 
            });
        }

        // Ensure all values are defined or null
        const scoreToSave = score !== undefined ? score : null;
        const gameToSave = game || null;
        const dateToSave = date || new Date().toISOString();
        const timeToSave = time !== undefined ? time : null;

        const result = await GameScore.saveScore(
            userId, 
            scoreToSave, 
            gameToSave, 
            dateToSave, 
            timeToSave
        );

        res.status(201).json({ 
            message: 'Score saved successfully', 
            data: result 
        });
    } catch (err) {
        console.error('Error saving score:', err);
        res.status(500).json({ 
            message: 'Error saving score', 
            error: err.message 
        });
    }
});

// Rute untuk mendapatkan leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { game, timePeriod } = req.query;  // Ambil game dan timePeriod dari query parameter
        
        const result = await GameScore.getLeaderboard(game, timePeriod);

        res.status(200).json({ 
            leaderboard: result,
            totalPlayers: result.length,
            highestScore: result.length > 0
                ? Math.max(...result.map(entry => entry.score)) 
                : 0,
            averageScore: result.length > 0 
                ? result.reduce((sum, entry) => sum + entry.score, 0) / result.length 
                : 0
        });
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ 
            message: 'Error fetching leaderboard', 
            error: err.message 
        });
    }
});

module.exports = router;
