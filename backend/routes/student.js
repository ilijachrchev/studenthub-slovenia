const express = require("express");
const pool = require("../db");

const router = express.Router();

// /api/auth/setup POST method
router.post("/setup", async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({error: "Not logged in"});
    }
    const userId = req.session.user.id;

    const { faculty_id, study_year, tag_ids } = req.body;

    if (!faculty_id) {
        return res.status(400).json({ error: "Faculty is required"});
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            "INSERT INTO student_profile (user_id, faculty_id, study_year) VALUES (?, ?, ?)",
            [userId, faculty_id, study_year || null]
        );

        if (Array.isArray(tag_ids) && tag_ids.length > 0) {
            const values = tag_ids.map((tagId) => [userId, tagId]);
            await connection.query("INSERT INTO user_interest (user_id, tag_id) VALUES ?", [values]);
        }

        await connection.commit();
        res.status(201).json({message: "Profile setup complete"});
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message});
    } finally {
        connection.release();
    }
});

module.exports = router;