require("dotenv").config()
const express = require('express');
const pool = require("./db");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const organizationsRoutes = require("./routes/organizations");
const lookupRoutes = require("./routes/lookups");
const studentRoutes = require("./routes/student");
const eventRoutes = require("./routes/events");
const registrationsRoutes = require("./routes/registrations");


const app = express();
const PORT = 30011;

// this is the middleware
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

app.get('/api', (req, res) => {
  res.json({ status: "ok", message: 'Hello from the backend, IT IS RUNNING :)!' });
});

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationsRoutes);
app.use("/api", lookupRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});