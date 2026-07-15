/**
 * Add query optimization indexes
 *
 * This migration adds indexes to improve query performance for:
 * - Event listing with status filtering and date sorting
 * - Registration capacity checks
 * - Organization event lookups
 *
 * Safety: Uses CREATE INDEX IF NOT EXISTS / DROP INDEX IF EXISTS
 * which are supported by both MySQL 8.0+ and PostgreSQL.
 */

exports.up = function (knex) {
  return knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_registration_event ON registration (event_id);
    CREATE INDEX IF NOT EXISTS idx_event_status_start ON event (status, start_datetime);
    CREATE INDEX IF NOT EXISTS idx_event_org_status ON event (organization_id, status);
  `);
};

exports.down = function (knex) {
  return knex.raw(`
    DROP INDEX IF EXISTS idx_registration_event;
    DROP INDEX IF EXISTS idx_event_status_start;
    DROP INDEX IF EXISTS idx_event_org_status;
  `);
};
