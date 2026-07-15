const { Client } = require("pg");
const { Knex } = require("knex");

const TEST_DB = "studenthub_test";
const ROOT_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || process.env.DB_PASSWORD || "",
};

module.exports = async function globalSetup() {
  const client = new Client(ROOT_CONFIG);
  await client.connect();

  // Terminate existing connections to the test database
  await client.query(`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = $1 AND pid <> pg_backend_pid()
  `, [TEST_DB]);

  // Drop and recreate test database
  await client.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await client.query(`CREATE DATABASE ${TEST_DB}`);

  await client.end();

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
