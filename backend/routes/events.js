const express = require("express");
const pool = require("../db");
const crypto = require("crypto");

const router = express.Router();


function generateTicketCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(12);
  let raw = "";
  for (let i = 0; i < 12; i++) {
    raw += alphabet[bytes[i] % alphabet.length];
  }

  return `${raw.slice(0, 4)}-${raw.slice(4,8)}-${raw.slice(8, 12)}`;
}


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

    let result = events.map((event) => ({
      ...event,
      tags: tagsByEvent[event.id] || [],
      score: 0,
    }));

    // personalization, WILL PROBABLY NEED IMPROVMENT!
    if (req.session.user) {
      const userId = req.session.user.id;

      const [profileRows] = await pool.query(
        "SELECT faculty_id FROM student_profile WHERE user_id = ?",
        [userId]
      );

      const [interestRows] = await pool.query(
        "SELECT tag_id FROM user_interest WHERE user_id = ?",
        [userId]
      );

      const [targetRows] = await pool.query(
        "SELECT event_id, faculty_id FROM event_target WHERE event_id IN (?)",
        [eventIds]
      );

      const userFacultyId = profileRows.length ? profileRows[0].faculty_id : null;
      const userTagIds = interestRows.map((row) => row.tag_id);

      const targetsByEvent = {};
      for (const row of targetRows) {
        if (!targetsByEvent[row.event_id]) {
          targetsByEvent[row.event_id] = [];
        }
        targetsByEvent[row.event_id].push(row.faculty_id);
      }

      result = result.map((event) => {
        const tagMatches = event.tags.filter((tag) => userTagIds.includes(tag.id)).length;
        const facultyMatch = userFacultyId && targetsByEvent[event.id]?.includes(userFacultyId) ? 1: 0;
        return { ...event, score: tagMatches + facultyMatch };
      });

      // most relevanat + newest
      result.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return new Date(a.start_datetime) - new Date(b.start_datetime);
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// /api/events/:id GET method
router.get("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    const [rows] = await pool.query(
      `SELECT e.id, e.title, e.description, e.location,
        e.start_datetime, e.end_datetime, e.capacity,
        e.registration_type, e.external_url,
        o.id AS organization_id, o.name AS organization_name,
        o.description AS organization_description,
        o.logo AS organization_logo, o.website AS organization_website,
        o.contact_email AS organization_contact_email
        FROM event e
        JOIN organization o ON e.organization_id = o.id
        WHERE e.id = ? AND e.status = 'published' AND o.status = 'approved'`,
      [eventId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = rows[0];
    const [tagRows] = await pool.query(
      `SELECT t.id, t.name
       FROM event_tag et
       JOIN tag t ON et.tag_id = t.id
       WHERE et.event_id = ?`,
      [eventId]
    );

    event.tags = tagRows;
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
    }
});

// /api/events/:id/registration GET method
router.get("/:id/registration", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json({registration: null});
    }
    
    const [rows] = await pool.query(
      `SELECT id, user_id, event_id, registered_at, ticket_code, checked_in
       FROM registration
       WHERE user_id = ? AND event_id = ?`,
       [req.session.user.id, req.params.id]
    );

    res.json({registration: rows.length ? rows[0] : null});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// /api/events/:id/register POST method
router.post("/:id/register", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({error: "You must be logged in to register!"});
    }

    const userId = req.session.user.id;
    const eventId = req.params.id;

    const [eventRows] = await pool.query(
      "SELECT id, capacity, registration_type, status FROM event WHERE id = ?",
      [eventId]
    );

    const event = eventRows[0];

    if (event.registration_type !== "built_in") {
      return res.status(400).json({ error: "This event does not use built-in registration" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM registration WHERE user_id = ? AND event_id = ?",
      [userId, eventId]
    );
    if (existing.length) {
      return res.status(409).json({error: "You are already registered for this event"})
    }

    if (event.capacity != null) {
      const [countRows] = await pool.query(
        "SELECT COUNT(*) AS count FROM registration WHERE event_id = ?",
        [eventId]
      );
      if (countRows[0].count >= event.capacity) {
        return res.status(409).json({error: "This event is full"});
      }
    }

    // insert with a generated ticket code
    const ticketCode = generateTicketCode();
    const [result] = await pool.query(
      "INSERT INTO registration (user_id, event_id, ticket_code) VALUES (?, ?, ?)",
      [userId, eventId, ticketCode]
    );

    const [registrationRows] = await pool.query(
      `SELECT id, user_id, event_id, registered_at, ticket_code, checked_in
       FROM registration
       WHERE id = ?`,
       [result.insertId]
    );
    res.status(201).json(registrationRows[0]);
  } catch (error) {
    res.status(500).json({error:error.message})
  }
});

// /api/events/:id/register DELETE method
router.delete("/:id/registration", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({error: "Not logged in"});
    }
    const [result] = await pool.query(
      "DELETE FROM registration WHERE user_id = ? AND event_id = ?",
      [req.session.user.id, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({error: "No registration to cancel"})
    }

    res.json({message:"Registration cancelled"});
  } catch (error) {
    res.status(500).json({error:error.message})
  }
})


module.exports = router;