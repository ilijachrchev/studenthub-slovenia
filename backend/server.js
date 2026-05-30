require("dotenv").config()
const express = require('express');
const pool = require("./db");

const app = express();
const PORT = 30011;

app.get('/api', (req, res) => {
  res.json({ status: "ok", message: 'Hello from the backend, IT IS RUNNING :)!' });
});

app.get("/api/dbtest", async (req, res) => {
    try {
        const [rows] = await pool.query("SHOW TABLES");
        res.json({ status: "OK", tables: rows });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});