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


// /api/registration/:id GET method
router.get("/:id", async (req, res) => {
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


// /api/register/:id POST method
router.post("/:id", async (req, res) => {
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

    if (!eventRows.length || eventRows[0].status !== "published") {
        return res.status(404).json({ error: "Event not found" });
    }
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


// /api/registration/:id DELETE method
router.delete("/:id", async (req, res) => {
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
});


// /api/registration/:id GET method
router.get("/", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({error: "Not logged in"});
        }

        const [rows] = await pool.query(
            `SELECT r.id, r.event_id, r.registered_at, r.ticket_code, r.checked_in,
                    e.title, e.start_datetime, e.end_datetime, e.location
                    o.name AS organization_name
                    FROM registration r
                    JOIN event e ON r.event_id = e.id
                    JOIN organization o ON e.organization_id = o.id
                    WHERE r.user_id = ?
                    ORDER BY e.start_time ASC`, 
                    [req.session.user.id]
        );
        res.json(rows);

    } catch (error) {
        res.status(500).json({error:error.message})
    } 
});


module.exports = router;