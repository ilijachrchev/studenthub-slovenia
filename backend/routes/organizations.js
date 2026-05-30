const express = require("express");
const pool = require("../db");

const router = express.Router();

// /api/organizations POST method
router.post("/", async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== "organizer") {
            return res.status(403).json({ error: "Only organizers can create organizations" });   
        }

        const { name, description, logo, website, contact_email, university_id } = req.body;

        if (!name || !contact_email) {
            return res.status(400).json({ error: "Organization name and contact email are required" });
        }

        // create org with status = PENDING
        const [result] = await pool.query(
            "INSERT INTO organization (name, description, logo, website, contact_email, university_id, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')",
            [name, description || null, logo || null, website || null, contact_email, university_id || null]
        );

        await pool.query(
            "INSERT INTO organizer_profile (user_id, organization_id, role_in_org) VALUES ( ?, ?, 'owner')",
            [req.session.user.id, result.insertId]
        );

        res.status(201).json({
            message: "Organization application submitted",
            organizationId: result.insertId,
            status: "pending",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// /api/organizations/my-application GET method
router.get("/my-application", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: "Not logged in" });
        }

        const [rows] = await pool.query(
            `SELECT o.* FROM organization o
            JOIN organizer_profile op ON op.organization_id = o.id
            WHERE op.user_id = ?`,
            [req.session.user.id]
        );

        if (rows.length === 0) {
            return res.json({ hasApplication: false });
        }

        res.json({ hasApplication: true, organization: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;