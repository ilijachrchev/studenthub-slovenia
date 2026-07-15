const express = require("express");
const pool = require("../db");
const catchAsync = require("../middleware/catchAsync");
const logger = require("../middleware/logger");

const router = express.Router();

// /api/auth/setup POST method
router.post("/setup", catchAsync(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({error: "Not logged in"});
    }
    const userId = req.session.user.id;

    const { faculty_id, study_year, tag_ids } = req.body;

    if (!faculty_id) {
        return res.status(400).json({ error: "Faculty is required"});
    }

    const [exisiting] = await pool.query(
        "SELECT * FROM student_profile WHERE user_id = ?",
        [userId]
    );
    if (exisiting.length > 0) {
        return res.status(400).json({ error: "You have already set up your feed"});
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
        logger.error({ err: error }, "Student setup failed");
        res.status(500).json({ error: "Internal server error"});
    } finally {
        connection.release();
    }
}));

// /api/student/profile GET method
router.get("/profile", catchAsync(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({error: "Not logged in"});
    }
    const userId = req.session.user.id;

    const [profiles] = await pool.query(
        "SELECT faculty_id, study_year FROM student_profile WHERE user_id = ?",
        [userId]
    );

    if (profiles.length === 0) {
        return res.json({ hasProfile: false });
    }

    const [interests] = await pool.query(
        "SELECT tag_id FROM user_interest WHERE user_id = ?",
        [userId]
    );

    res.json({
        hasProfile: true,
        faculty_id: profiles[0].faculty_id,
        study_year: profiles[0].study_year,
        tag_ids: interests.map((row) => row.tag_id),
    });
}));


// /api/student/profile PUT method
router.put("/profile", catchAsync(async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Not logged in"});
    }
    const userId = req.session.user.id;

    const { faculty_id, study_year, tag_ids} = req.body;

    if (!faculty_id) {
        return res.status(400).json({error: "Faculty is required"});
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            "UPDATE student_profile SET faculty_id = ?, study_year = ? WHERE user_id = ?",
            [faculty_id, study_year || null, userId]
        );

        await connection.query(
            "DELETE FROM user_interest WHERE user_id = ?",
            [userId]
        );

        if (Array.isArray(tag_ids) && tag_ids.length > 0) {
            const values = tag_ids.map((tagId) => [userId, tagId]);
            await connection.query("INSERT INTO user_interest (user_id, tag_id) VALUES ?", [values]);
        }

        await connection.commit();
        res.json({message: "Preferences updated"});
    } catch (error) {
        await connection.rollback();
        logger.error({ err: error }, "Student profile update failed");
        res.status(500).json({ error: "Internal server error"});
    } finally {
        connection.release();
    }
}));


module.exports = router;
