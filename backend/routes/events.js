const express = require("express");
const pool = require("../db");

const router = express.Router();

// /api/events GET method
router.get("/", async (req, res) => {
  try {
    const [events] = await pool.query(
      `SELECT e.id, e.title, e.description, e.location,
              e.start_datetime, e.end_datetime, e.capacity,
              e.registration_type, e.external_url,
              o.id AS organization_id, o.name AS organization_name
       FROM event e
       JOIN organization o ON e.organization_id = o.id
       WHERE e.status = 'published' AND o.status = 'approved'
       ORDER BY e.start_datetime ASC`
    );

    if (events.length === 0) {
      return res.json([]);
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
      tagsByEvent[row.event_id].push({ id: row.id, name: row.name });
    }

    const result = events.map((event) => ({
      ...event,
      tags: tagsByEvent[event.id] || [],
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;