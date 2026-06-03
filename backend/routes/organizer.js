const express = require("express");
const pool = require("../db");
const { error } = require("node:console");
const { json } = require("body-parser");
const { start } = require("node:repl");

const router = express.Router();


// /api/organizer/events GET method
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

// /api/organizer/events POST method
router.post("/events", async (req, res) => { 
    if (!req.session.user) {
        return res.status(401).json({error: " Not logged in"});
    }
    if (req.session.user.role !== "organizer") {
        return res.status(403).json({error: "Only organizers can create events"});
    }

    const { title, description, location, start_datetime, end_datetime,
            registration_type, capacity, external_url, tag_ids, target_faculty_ids, } = req.body;
    
    if (!title || !location || !start_datetime || !end_datetime) {
        return res.status(400).json({error: "Title, location, start and end datetime are required"});
    }
    if (!Array.isArray(tag_ids) || tag_ids.length === 0) {
        return res.status(400).json({error: "Select at least one tag"});
    }
    if (!Array.isArray(target_faculty_ids) || target_faculty_ids.length === 0) {
        return res.status(400).json({error: "Select at least one target faculty"});
    }

    const regType = ["built_in", "external", "none"].includes(registration_type) 
        ? registration_type
        : "built_in";

    if (regType === "external" && !external_url) {
        return res.status(400).json({error: "An external registration link is required"});
    }

    try {
        const [orgs] = await pool.query(
            `SELECT o.id FROM organization o
            JOIN organizer_profile op ON op.organization_id = o.id
            WHERE op.user_id = ? AND o.status = 'approved'`,
            [req.session.user.id]
        );
        
        if (orgs.length === 0) {
            return res.status(403).json({ error: "No approved organization found for this account"});
        }

        const organizationId = orgs[0].id;

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.query(
                `INSERT INTO event
                    (organization_id, title, description, location,
                    start_datetime, end_datetime, capacity, registration_type, external_url, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
                    [
                        organizationId, title,
                        description || null,
                        location,
                        start_datetime.replace("T", " "),
                        end_datetime.replace("T", " "),
                        regType === "built_in" ? (capacity || null) : null,
                        regType,
                        regType === "external" ? external_url : null,
                    ]
            );

            const eventId = result.insertId;

            for (const tagId of tag_ids) {
                await connection.query(
                    "INSERT INTO event_tag (event_id, tag_id) VALUES (?, ?)",
                    [eventId, tagId] 
                );
            }

            for (const facultyId of target_faculty_ids) {
                await connection.query(
                    "INSERT INTO event_target (Event_id, faculty_id) VALUES (?, ?)",
                    [eventId, facultyId]
                );
            }

            await connection.commit();
            res.status(201).json({ message: "Event created", eventId});
        } catch (error) {
            await connection.rollback();
            res.status(500).json({error: error.message});
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

// /api/organizer/events/:id POST method
router.post("/events/:id/submit" , async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({error: "Not logged in"});
        }
        if (req.session.user.role !== "organizer") {
            return res.status(403).json({error: "Only organizers can submit events"});
        }

        const eventId = req.params.id;

        const [rows] = await pool.query(
            `SELECT e.id, e.status FROM event e
            JOIN organizer_profile op ON op.organization_id = e.organization_id
            WHERE e.id = ? AND op.user_id = ?`,
            [eventId, req.session.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({error: "Event not found"});
        }
        if (rows[0].status !== "draft") {
            return res.status(400).json({error: " Only draft events can be submitted"});
        }

        await pool.query("UPDATE event SET status = 'submitted' WHERE id = ?", [eventId]);

        res.json({message: "Event submitted for approval"});
    } catch {
        res.status(500).json({error: error.message});
    }
});


module.exports = router;