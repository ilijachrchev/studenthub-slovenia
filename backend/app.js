const express = require('express');
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const path = require('path');
const fs = require('fs');

const authRoutes = require("./routes/auth");
const lookupRoutes = require("./routes/lookups");
const studentRoutes = require("./routes/student");
const eventRoutes = require("./routes/events");
const registrationsRoutes = require("./routes/registrations");
const organizationsRoutes = require("./routes/organizations");
const organizerRoutes = require("./routes/organizer");
const adminRoutes = require("./routes/admin");
const bookmarksRoutes = require("./routes/bookmarks");
const feedbackRoutes = require("./routes/feedback");
const searchRoutes = require("./routes/search");
const { validateOrigin } = require("./middleware/csrf");

const app = express();

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:30010";
app.use(cors({
    origin: allowedOrigin,
    credentials: true,
}));

app.use(express.json({ limit: '512kb' }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "test-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

app.use(validateOrigin);

app.get('/api/health', (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ status: "ok", message: 'Hello from the backend, IT IS RUNNING :)!' });
});

app.use("/api/auth", authRoutes);
app.use("/api", lookupRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationsRoutes);
app.use("/api/organizations", organizationsRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookmarks", bookmarksRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/search", searchRoutes);

const reactBuildPath = path.join(__dirname, './dist');
if (fs.existsSync(reactBuildPath)) {
    app.use(express.static(reactBuildPath));
    app.get("/*splat", (req, res) => {
        res.sendFile(path.join(reactBuildPath, "index.html"));
    });
}

module.exports = app;
