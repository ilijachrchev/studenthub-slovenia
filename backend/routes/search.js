const express = require("express");
const pool = require("../db");
const catchAsync = require("../middleware/catchAsync");

const router = express.Router();

// /api/search GET method
router.get("/", catchAsync(async (req, res) => {
    const ajde = (req.query.q || "").trim();
    if (!ajde) {
        return res.json({ events: [], total: 0, page: 1, totalPages: 0 });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const [events] = await pool.query(
        `SELECT e.id, e.title, e.description, e.location,
        e.start_datetime, e.end_datetime, e.registration_type,
        o.id AS organization_id, o.name AS organization_name
        FROM event e
        JOIN organization o ON e.organization_id = o.id
        WHERE e.status = 'published' AND o.status = 'approved'
        AND e.title LIKE ?
        ORDER BY e.start_datetime ASC`,
        [`%${ajde}%`]
    );

    if (events.length === 0) {
        return res.json({ events: [], total: 0, page, totalPages: 0 });
    }

    const eventIds = events.map((event) => event.id);
    const [tagRows] = await pool.query(
        `SELECT et.event_id, t.id, t.name
        FROM event_tag et
        JOIN tag t ON et.tag_id = t.id
        WHERE et.event_id IN (?)`,
        [eventIds]
    );

    const tagsByEvent = {};
    for (const row of tagRows) {
        if (!tagsByEvent[row.event_id]) {
            tagsByEvent[row.event_id] = [];
        }
        tagsByEvent[row.event_id].push({id: row.id, name: row.name});
    }

    const result = events.map((event) => ({
        ...event,
        tags: tagsByEvent[event.id] || [],
    }));

    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paged = result.slice(start, start + limit);

    res.json({ events: paged, total, page, totalPages });
}));

module.exports = router;
