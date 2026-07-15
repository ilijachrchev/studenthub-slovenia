const express = require("express");
const pool = require("../db");
const catchAsync = require("../middleware/catchAsync");
const logger = require("../middleware/logger");

const router = express.Router();

// /api/admin/events/pending GET method
router.get("/events/pending", catchAsync(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({error: "Not logged in" });
    }
    if (req.session.user.role !== "admin") {
        return res.status(403).json({error: "Only adming can access this" });
    }

    const [events] = await pool.query(
        `SELECT e.id, e.title, e.description, e.location,
        e.start_datetime, e.end_datetime, e.registration_type, e.capacity,
        o.name AS organizer_name
        FROM event e
        JOIN organization o ON o.id = e.organization_id
        WHERE e.status = 'submitted'
        ORDER BY e.created_at ASC`
    );

    res.json({ events });
}));

// /api/admin/events/:id/approve POST method
router.post("/events/:id/approve", catchAsync(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    if (req.session.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can approve events" });
    }

    const [result] = await pool.query(
        "UPDATE event SET status = 'published' WHERE id = ? AND status = 'submitted'",
        [req.params.id]
    );

    if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Event not found or not awaiting approval" });
    }

    res.json({ message: "Event published" });
}));

// /api/admin/events/:id/rejected POST method
router.post("/events/:id/reject", catchAsync(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    if (req.session.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can reject events" });
    }

    const {reason} = req.body;
    if (!reason || !reason.trim()) {
        return res.status(400).json({ error: "Rejection reason is required" });
    }

    const [admins] = await pool.query(
        "SELECT id FROM admin WHERE user_id = ?",
        [req.session.user.id]
    );

    if (admins.length === 0) {
        return res.status(403).json({ error: "Admin record not found for this account" });
    }

    const adminId = admins[0].id;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            "UPDATE event SET status = 'rejected' WHERE id = ? AND status = 'submitted'",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(400).json({ error: "Event not found or not awaiting approval" });
        }

        await connection.query(
            "INSERT INTO event_rejection (event_id, admin_id, reason) VALUES (?, ?, ?)",
            [req.params.id, adminId, reason.trim()]
        );

        await connection.commit();
        res.json({ message: "Event rejected" });
    } catch (error) {
        await connection.rollback();
        logger.error({ err: error }, "Event rejection failed");
        res.status(500).json({ error: "Internal server error" });
    } finally {
        connection.release();
    }
}));

// /api/admin/organizations/pending GET method
router.get("/organizations/pending", catchAsync(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    if (req.session.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can access this" });
    }

    const [organizations] = await pool.query(
        `SELECT o.id, o.name, o.description, o.description, o.website,
        o.contact_email, o.university_id,
        u.first_name, u.last_name, u.email AS applicant_email
        FROM organization o
        JOIN organizer_profile op ON op.organization_id = o.id AND op.role_in_org = 'owner'
        JOIN user u ON u.id = op.user_id
        WHERE o.status = 'pending'
        ORDER BY o.id ASC`
    );

    res.json({ organizations });
}));

// /api/admin/organizations/:id/approve POST method
router.post("/organizations/:id/approve", catchAsync(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    if (req.session.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can approve organizations" });
    }

    const [result] = await pool.query(
        "UPDATE organization SET status = 'approved', approved_at = NOW() WHERE id = ? AND status = 'pending'",
        [req.params.id]
    );

    if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Organization not found or not awaiting approval" });
    }

    res.json({ message: "Organization approved" });
}));

// /api/admin/organizations/:id/reject POST method
router.post("/organizations/:id/reject", catchAsync(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in" });
    }
    if (req.session.user.role !== "admin") {
        return res.status(403).json({ error: "Only admins can reject organizations" });
    }

    const [result] = await pool.query(
        "UPDATE organization SET status = 'rejected' WHERE id = ? AND status = 'pending'",
        [req.params.id]
    );

    if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Organization not found or not awaiting approval" });
    }

    res.json({ message: "Organization rejected" });
}));



module.exports = router;
