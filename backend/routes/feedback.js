const express = require("express");
const pool = require("../db");

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

// /api/feedback/:eventId POST method
router.post("/:eventId", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: "You must be logged in to leave feedback"});
        }

        const userId = req.session.user.id;
        const eventId = req.params.eventId;
        const { rating, comment } = req.body;

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({error: "Rating must be between 1 and 5"});
        }

        const [eventRows] = await pool.query(
            "SELECT id, end_datetime FROM event WHERE id = ?",
            [eventId]
        );
        if (!eventRows.length) {
            return res.status(400).json({error: "Event not found"});
        }
        if (new Date(eventRows[0].end_datetime) > new Date()) {
            return res.status(400).json({error: "You can only leave feedback after the event has ended"});
        }

        const [registered] = await pool.query(
            "SELECT id FROM registration WHERE user_id = ? AND event_id = ?",
            [userId, eventId]
        );
        if (!registered.length) {
            return res.status(403).json({error: "You can only leave feedback for events you registered for"});
        }

        const[existing] = await pool.query(
            "SELECT id FROM feedback WHERE user_id = ? AND event_id = ?",
            [userId, eventId]
        );
        if (existing.length) {
            return res.status(409).json({error: "You have already left feedback for this event"})
        }

        await pool.query(
            "INSERT INTO feedback (user_id, event_id, rating, comment) VALUES (?, ?, ?, ?)",
            [userId, eventId, rating, comment ? comment.trim() : null]
        );

        res.status(201).json({message: "Feedback submitted"})
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;
