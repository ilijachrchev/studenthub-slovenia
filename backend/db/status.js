#!/usr/bin/env node
/**
 * Migration status script
 *
 * Displays applied migrations, pending migrations, and table count
 * in a human-readable format.
 */

const knex = require("knex");

const config = require("../knexfile").development;

async function status() {
  const db = knex(config);

  try {
    const [batchNo] = await db.migrate.currentBatchNumber();
    const [completed, pending] = await db.migrate.list(config.migrations.directory);

    console.log(`Current batch: ${batchNo}\n`);

    console.log(`Applied migrations (${completed.length}):`);
    if (completed.length === 0) {
      console.log("  (none)");
    } else {
      completed.forEach((m) => console.log(`  ✓ ${m}`));
    }

    console.log(`\nPending migrations (${pending.length}):`);
    if (pending.length === 0) {
      console.log("  (none)");
    } else {
      pending.forEach((m) => console.log(`  • ${m}`));
    }

    const [{ count: tableCount }] = await db.raw(
      "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ?",
      [config.connection.database]
    );
    console.log(`\nTables: ${tableCount}`);
  } catch (err) {
    console.error("\nStatus check failed:", err.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

status();
