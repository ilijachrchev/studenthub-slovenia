const mysql = require("mysql2/promise");

const TEST_DB = "studenthub_test";
const ROOT_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || process.env.DB_PASSWORD || "",
};

module.exports = async function globalTeardown() {
  // Clean up test database after tests complete
  const conn = await mysql.createConnection(ROOT_CONFIG);
  await conn.execute(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
  await conn.end();
};
