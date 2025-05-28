const { pool } = require('../config/db');

const GameScore = {
    saveScore: async (userId, score, game, date, time) => {
        try {
            // Format tanggal untuk MySQL
            const formattedDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');

            const [result] = await pool.execute(
                'INSERT INTO game_scores (user_id, score, game, date, time) VALUES (?, ?, ?, ?, ?)', 
                [userId, score, game, formattedDate, time] // Gunakan formattedDate di sini
            );
            return result;
        } catch (error) {
            console.error('Error saving game score:', error);
            throw error;
        }
    },

    getLeaderboard: async (game, timePeriod) => {
        try {
            let query = `
                SELECT gs.*, u.name 
                FROM game_scores gs
                JOIN users u ON gs.user_id = u.id
                WHERE 1=1
            `;
            const queryParams = [];

            // Filter by game if specified
            if (game && game !== 'all') {
                query += ' AND gs.game = ?';
                queryParams.push(game);
            }

            // Filter by time period
            if (timePeriod) {
                switch (timePeriod) {
                    case 'today':
                        query += ' AND DATE(gs.date) = CURDATE()';
                        break;
                    case 'thisWeek':
                        query += ' AND WEEK(gs.date) = WEEK(CURDATE())';
                        break;
                    case 'thisMonth':
                        query += ' AND MONTH(gs.date) = MONTH(CURDATE())';
                        break;
                    // default is all time, so no additional filtering
                }
            }

            // Order by score descending and limit to top 10
            query += ' ORDER BY gs.score DESC LIMIT 10';

            const [rows] = await pool.execute(query, queryParams);
            return rows;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }
};

module.exports = GameScore;
