const express = require("express");
const pool = require("../db");

const router = express.Router();

// /api/bookmarks GET method
router.get("/", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({error: "Not logged in"});
        }

        const [rows] = await pool.query(
            `SELECT b.event_id AS id, b.saved_At,
            e.title, e.description, e.location,
            e.start_datetime, e.end_datetime, e.registration_type,
            o.name AS organization_name
            FROM bookmark b
            JOIN event e ON b.event_id = e.id
            JOIN organization o ON e.organization_id = o.id
            WHERE b.user_id = ?
            ORDER BY e.start_datetime ASC`,
            [req.session.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({error: error.message})
    }
});

// /api/bookmarks/ids GET method
router.get("/ids", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.json({ ids: [] });
        }

        const [rows] = await pool.query(
            "SELECT event_id FROM bookmark WHERE user_id = ?",
            [req.session.user.id]
        );

        req.json({ ids: rows.map((row) => row.event_id) });
    } catch (error) {
        res.status(500).json({errro: error.message});
    }
});

// /api/bookmarks/:id POST method
router.post("/:id", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({error: "Not logged in"});
        }

        const userId = req.session.user.id;
        const eventId = req.params.id;

        const [existing] = await pool.query(
            "SELECT id FROM bookmark WHERE user_id = ? AND event_id = ?",
            [userId, eventId]
        );
        if (existing.length) {
            return res.status(409).json({ error: "Event already saved" });
        }

        await pool.query(
            "INSERT INTO bookmark (user_id, event_id) VALUES (?, ?)",
            [userId, eventId]
        );

        res.status(201).json({message: "Event saved"});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// /api/bookmarks/:id DELETE method
router.delete("/:id", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({error: "Not logged in"});
        }

        const [result] = await pool.query(
            "DELETE FROM bookmark WHERE user_id = ? AND event_id = ?",
            [req.session.user.id, req.params.id]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({error: "No saved event to remove"});
        }

        res.json({message: "Event removed from saved"});
    } catch (error) {
        res.status(500).json({error: error.message})
    }
});


module.exports = router;