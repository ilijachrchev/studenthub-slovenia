require("dotenv").config();
const app = require("./app");
const pool = require("./db");
const logger = require("./middleware/logger");

const PORT = process.env.PORT || 30011;

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server started");
});

// Verify database connection on startup
pool.query("SELECT 1 AS health")
  .then(() => {
    logger.info("Database connection verified");
  })
  .catch((err) => {
    logger.error({ err: err.message }, "Database connection failed on startup");
  });

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info({ signal }, "Shutdown signal received");

  server.close(() => {
    logger.info("HTTP server closed");
  });

  try {
    await pool.end();
    logger.info("Database pool closed");
  } catch (err) {
    logger.error({ err: err.message }, "Error closing database pool");
  }

  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Handle unhandled rejections
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err: err.message }, "Uncaught exception");
  process.exit(1);
});
