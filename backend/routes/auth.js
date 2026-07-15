const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const pool = require("../db");
const { validateRegistration } = require("../middleware/validate");

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many attempts, please try again later" },
});

// /api/auth/register POST method
router.post("/register", authLimiter, async (req, res) => {
    try {
        const { first_name, last_name, email, password, role } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const validationErrors = validateRegistration(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ error: validationErrors[0] });
        }

        const userRole = role === "organizer" ? "organizer" : "student";

        // validate email domain for students
        if (userRole === "student") {
            const domain = email.split("@")[1];
            const [faculties] = await pool.query(
                "SELECT id FROM faculty WHERE email_domain = ?",
                [domain]
            );
            if (faculties.length === 0) {
                return res.status(400).json({
                    error: "Email domain not recognized. Please use your institutional email.",
                });
            }
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
            "INSERT INTO user (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
            [first_name, last_name, email, hashedPassword, userRole]
        );

        req.session.user = {
            id: result.insertId,
            first_name,
            last_name,
            email,
            role: userRole,
        };

        res.status(201).json({
            message: "Registration successful",
            userId: result.insertId,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// /api/auth/login POST method
router.post("/login", authLimiter, async (req, res) => {
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
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// /api/auth/me GET method
router.get("/me", (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: "Not logged in" });
    }
});

// /api/auth/logout POST method
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out" });
    });
});

// /api/auth/reset-password POST method
router.post("/reset-password", authLimiter, async (req, res) => {
    try {
        const { email, current_password, new_password } = req.body;

        if (!email || !current_password || !new_password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const [users] = await pool.query(
            "SELECT id, password_hash FROM user WHERE email = ?",
            [email]
        );
        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const match = await bcrypt.compare(current_password, users[0].password_hash);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        await pool.query(
            "UPDATE user SET password_hash = ? WHERE id = ?",
            [hashedPassword, users[0].id]
        );

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;
