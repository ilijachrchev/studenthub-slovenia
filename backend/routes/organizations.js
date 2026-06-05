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

// /api/organizations GET method
router.get("/:id", async (req, res) => {
    try {
        const orgId = req.params.id;

        const [orgRows] = await pool.query(
            `SELECT o.id, o.name, o.description, o.logo, o.website, o.contact_email,
                u.name AS university_name
                FROM organization o
                LEFT JOIN university u ON o.university_id = u.id
                WHERE o.id = ? AND o.status = 'approved'`,
                [orgId]
        );

        if (orgRows.length === 0) {
            return res.status(404).json({error: "Organization not found"});
        }

        const organization = orgRows[0];

        const [events] = await pool.query(
            `SELECT e.id, e.title, e.description, e.location,
            e.start_datetime, e.end_datetime, e.registration_type,,
            o.name AS organization_name
            FROM event e
            JOIN organization o ON e.organization_id = o.id
            WHERE e.organization_id = ? AND e.status = 'published'
            ORDER BY e.start_datetime ASC`,
            [orgId]
        );

        let withTags = events.map((event) => ({...event, tags: []}));

        if (events.length > 0) {
            const eventIds = events.map((event) => event.id);
            const [tagRows] = await pool.query(
                `SELECT et.event_id, t.id, t.name
                FROM event_Tag et
                JOIN tag t ON et.tag_id = t.id
                WHERE et.event_id IN (?)`,
                [eventIds]
            );

            const tagsByEvent = {};
            for (const row of tagRows) {
                if (!tagsByEvent[row.event_id]) {
                    tagsByEvent[row.event_id] = [];
                }
                tagsByEvent[row.event_id].push({ id: row.id, name:row.name});
            }

            withTags = events.map((event) => ({
                ...event,
                tags: tagsByEvent[event.id] || [],
            }));
        }

        const now = new Date();
        const upcoming = withTags.filter((event) => new Date(event.end_datetime) >= now)
            .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

        const past = withTags.filter((event) => new Date(event.end_datetime) < now)
            .sort((a, b) => new Date(b.start_datetime) - new Date(a.start_datetime));

        res.json({organization, upcoming, past});
    } catch (console.error() {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;    