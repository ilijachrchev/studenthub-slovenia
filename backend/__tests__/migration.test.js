/**
 * Migration rollback test
 *
 * Tests the migration lifecycle:
 * 1. Create fresh database
 * 2. Run migrations up
 * 3. Verify tables exist
 * 4. Run migrations down
 * 5. Verify rollback completes
 */

const mysql = require("mysql2/promise");
const { Knex } = require("knex");

const TEST_DB = "studenthub_migration_test";
const ROOT_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || process.env.DB_PASSWORD || "",
};

const REQUIRED_TABLES = [
  "university",
  "faculty",
  "tag",
  "user",
  "admin",
  "organization",
  "organizer_profile",
  "event",
  "event_tag",
  "event_target",
  "event_rejection",
  "student_profile",
  "user_interest",
  "bookmark",
  "registration",
  "feedback",
];

describe("Migration lifecycle", () => {
  let conn;
  let knex;

  beforeAll(async () => {
    // Create test database
    conn = await mysql.createConnection(ROOT_CONFIG);
    await conn.execute(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
    await conn.execute(
      `CREATE DATABASE \`${TEST_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    // Initialize Knex with test database
    knex = Knex({
      client: "mysql2",
      connection: {
        host: ROOT_CONFIG.host,
        port: ROOT_CONFIG.port,
        user: ROOT_CONFIG.user,
        password: ROOT_CONFIG.password,
        database: TEST_DB,
      },
      migrations: {
        directory: "../db/migrations",
      },
    });
  });

  afterAll(async () => {
    if (knex) await knex.destroy();
    if (conn) {
      await conn.execute(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
      await conn.end();
    }
  });

  test("migrations run up successfully", async () => {
    const [batchNo, migrations] = await knex.migrate.latest();

    expect(batchNo).toBeGreaterThanOrEqual(0);
    expect(migrations.length).toBeGreaterThan(0);
  });

  test("all required tables exist after migration", async () => {
    const tables = await knex.raw("SHOW TABLES");
    const tableNames = tables[0].map((row) => Object.values(row)[0]);

    for (const table of REQUIRED_TABLES) {
      expect(tableNames).toContain(table);
    }
  });

  test("migrations run down successfully", async () => {
    // Rollback all migrations
    const [batchNo, migrations] = await knex.migrate.rollback(null, true);

    // After rolling back everything, we should be at batch 0 or -1
    expect(batchNo).toBeLessThanOrEqual(0);
  });

  test("tables are removed after full rollback", async () => {
    const tables = await knex.raw("SHOW TABLES");
    const tableNames = tables[0].map((row) => Object.values(row)[0]);

    // Check that most tables are gone (some system tables may remain)
    const remainingRequired = REQUIRED_TABLES.filter((table) =>
      tableNames.includes(table)
    );

    // After full rollback, no required tables should exist
    expect(remainingRequired.length).toBe(0);
  });

  test("migrations can be run up again after rollback", async () => {
    const [batchNo, migrations] = await knex.migrate.latest();

    expect(batchNo).toBeGreaterThanOrEqual(0);
    expect(migrations.length).toBeGreaterThan(0);

    // Verify tables exist again
    const tables = await knex.raw("SHOW TABLES");
    const tableNames = tables[0].map((row) => Object.values(row)[0]);

    for (const table of REQUIRED_TABLES) {
      expect(tableNames).toContain(table);
    }
  });
});
