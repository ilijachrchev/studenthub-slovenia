/**
 * Add query optimization indexes
 *
 * This migration adds indexes to improve query performance for:
 * - Event listing with status filtering and date sorting
 * - Registration capacity checks
 * - Organization event lookups
 *
 * Safety: Uses raw SQL with IF NOT EXISTS checks to prevent errors
 * on re-runs or partial migrations.
 */

exports.up = function (knex) {
  return knex.raw(`
    -- Registration count by event_id (capacity check in registrations.js)
    -- uniq_registration indexes (user_id, event_id) but COUNT queries use event_id alone
    SET @exists = (SELECT COUNT(*) FROM information_schema.statistics
                   WHERE table_schema = DATABASE()
                   AND table_name = 'registration'
                   AND index_name = 'idx_registration_event');
    SET @sql = IF(@exists = 0,
      'CREATE INDEX idx_registration_event ON registration (event_id)',
      'SELECT 1');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Composite index for event listing queries that filter by status + sort by date
    -- events.js: WHERE e.status = 'published' ORDER BY e.start_datetime
    SET @exists = (SELECT COUNT(*) FROM information_schema.statistics
                   WHERE table_schema = DATABASE()
                   AND table_name = 'event'
                   AND index_name = 'idx_event_status_start');
    SET @sql = IF(@exists = 0,
      'CREATE INDEX idx_event_status_start ON event (status, start_datetime)',
      'SELECT 1');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    -- Composite index for event detail queries: status + organization lookup
    -- organizations.js: WHERE e.organization_id = ? AND e.status = 'published'
    SET @exists = (SELECT COUNT(*) FROM information_schema.statistics
                   WHERE table_schema = DATABASE()
                   AND table_name = 'event'
                   AND index_name = 'idx_event_org_status');
    SET @sql = IF(@exists = 0,
      'CREATE INDEX idx_event_org_status ON event (organization_id, status)',
      'SELECT 1');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  `);
};

exports.down = function (knex) {
  return knex.raw(`
    -- Drop indexes if they exist
    SET @exists = (SELECT COUNT(*) FROM information_schema.statistics
                   WHERE table_schema = DATABASE()
                   AND table_name = 'registration'
                   AND index_name = 'idx_registration_event');
    SET @sql = IF(@exists > 0,
      'ALTER TABLE registration DROP INDEX idx_registration_event',
      'SELECT 1');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @exists = (SELECT COUNT(*) FROM information_schema.statistics
                   WHERE table_schema = DATABASE()
                   AND table_name = 'event'
                   AND index_name = 'idx_event_status_start');
    SET @sql = IF(@exists > 0,
      'ALTER TABLE event DROP INDEX idx_event_status_start',
      'SELECT 1');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

    SET @exists = (SELECT COUNT(*) FROM information_schema.statistics
                   WHERE table_schema = DATABASE()
                   AND table_name = 'event'
                   AND index_name = 'idx_event_org_status');
    SET @sql = IF(@exists > 0,
      'ALTER TABLE event DROP INDEX idx_event_org_status',
      'SELECT 1');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  `);
};
