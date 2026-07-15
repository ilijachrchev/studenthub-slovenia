const mysql = require("mysql2/promise");

const TEST_DB = "studenthub_test";
const ROOT_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || process.env.DB_PASSWORD || "",
};

module.exports = async function globalSetup() {
  const conn = await mysql.createConnection(ROOT_CONFIG);

  await conn.execute(
    `CREATE DATABASE IF NOT EXISTS \`${TEST_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.execute(`DROP TABLE IF EXISTS \`${TEST_DB}\`.\`sessions\``);

  // Load schema
  const fs = require("fs");
  const path = require("path");
  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, "utf8");
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      await conn.execute(`\`${TEST_DB}\`.${stmt}`);
    }
  }

  // Load seed
  const seedPath = path.join(__dirname, "..", "db", "seed.sql");
  if (fs.existsSync(seedPath)) {
    const seed = fs.readFileSync(seedPath, "utf8");
    const statements = seed
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      await conn.execute(`\`${TEST_DB}\`.${stmt}`);
    }
  }

  await conn.end();
};
