const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

// /api/auth/register POST method
router.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // check if mail is already exisitnig
        const [existing] = await pool.query(
            "SELECT id FROM user WHERE email = ?",
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // insert new user
        const [result] = await pool.query(
            "INSERT INTO user (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, 'student')",
            [first_name, last_name, email, hashedPassword]
        );

        res.status(201).json({
            message: "Registration successful",
            userId: result.insertId,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// /api/auth/login POST method
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const [users] = await pool.query(
            "SELECT * FROM user WHERE email = ?",
            [email]
        );
        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = users[0];

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // save the user in session
        req.session.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,   
        };

        res.json({ message: "Login successful", user: req.session.user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
