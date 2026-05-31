const express = require('express');
const pool = require('../db');

const router = express.Router();

// /api/faculties GET method
router.get("/faculties", async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT f.id, f.name, f.university_id, u.name AS university_name
            FROM faculty f
            JOIN university u ON f.university_id = u.id
            ORDER BY u.name, f.name`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// /api/tags GET method
router.get("/tags", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name FROM tag ORDER BY name");
        res.json(rows);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;