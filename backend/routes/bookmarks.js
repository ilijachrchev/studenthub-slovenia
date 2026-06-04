const express = require("express");
const pool = require("../db");

const router = express.Router();

// /api/bookmarks GET method
router.get("/", async (req, res) => {
    try {
        if (!req.session.user) {
            res.status(401).json({error: "Not logged in"})
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
})