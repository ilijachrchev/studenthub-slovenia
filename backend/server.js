const express = require('express');

const app = express();
const PORT = 8002;

app.get('/api', (req, res) => {
  res.json({ status: "ok", message: 'Hello from the backend, IT IS RUNNING :)!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});