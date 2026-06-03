const express = require("express");
const pool = require("../db");

const router = express.Router();


// /api/organizer/events method
router.get("/events", async (req, res) => {
    try {
        if (!req.session.user) {
            res.status(401).json({error: "Not logged in"});
        }
        if (req.session.user.role !== "organizer") {
            res.status(403).json({error: "Only organiers can access this"});
        }

        const [events] = await pool.query(
            `SELECT e.id, e.title, e.description, e.location,
                e.start_datetime, e.end_datetime, e.capacity,
                e.registration_type, e.external_url, e.status, e.created_at
                FROM event e
                JOIN organizer_profile op ON op.organization_id = e.organization_id
                WHERE op.user_id = ?
                ORDER BY e.start_datetime DESC`,
                [req.session.user.id]
        );

        res.json({events});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});


module.exports = router;
