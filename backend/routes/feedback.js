const express = require("express");
const pool = require("../db");
const { error } = require("node:console");

const router = express.Router();

// /api/feedback/:eventId GET method
router.get("/:eventId", async(req, res) => {
    try {
        if (!req.session.user) {
            return res.json({feedback: null});
        }

        const [rows] = await pool.query(
            "SELECT id, rating, comment, submitted_at FROM feedback WHERE user_id = ? AND event_id = ?",
            [req.session.user.id, req.params.eventId]
        );

        res.json({feedback: rows.length ? rows[0] : null});
    } catch (error) {
        res.json(500).json({error: error.message});
    }
});

module.exports = router;
