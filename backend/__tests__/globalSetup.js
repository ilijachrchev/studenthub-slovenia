const mysql = require("mysql2/promise");
const { Knex } = require("knex");

const TEST_DB = "studenthub_test";
const ROOT_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || process.env.DB_PASSWORD || "",
};

module.exports = async function globalSetup() {
  const conn = await mysql.createConnection(ROOT_CONFIG);

  // Drop and recreate test database
  await conn.execute(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
  await conn.execute(
    `CREATE DATABASE \`${TEST_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );

  await conn.end();

  // Run migrations using Knex
  const knexConfig = require("../knexfile").test;
  const knex = Knex(knexConfig);

  try {
    await knex.migrate.latest();
    await knex.seed.run();
  } finally {
    await knex.destroy();
  }
};
