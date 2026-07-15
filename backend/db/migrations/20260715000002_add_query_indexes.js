/**
 * Add query optimization indexes
 *
 * Analyzed queries:
 * - registrations.js: COUNT(*) WHERE event_id = ? (capacity check)
 * - events.js: JOIN event_tag WHERE event_id IN (?)
 * - organizations.js: JOIN organizer_profile WHERE user_id = ?
 */

exports.up = function (knex) {
  return knex.schema
    // Registration count by event_id (capacity check in registrations.js)
    // uniq_registration indexes (user_id, event_id) but COUNT queries use event_id alone
    .raw(
      "CREATE INDEX `idx_registration_event` ON `registration` (`event_id`)"
    )

    // Composite index for event listing queries that filter by status + sort by date
    // events.js: WHERE e.status = 'published' ORDER BY e.start_datetime
    .raw(
      "CREATE INDEX `idx_event_status_start` ON `event` (`status`, `start_datetime`)"
    )

    // Composite index for event detail queries: status + organization lookup
    // organizations.js: WHERE e.organization_id = ? AND e.status = 'published'
    .raw(
      "CREATE INDEX `idx_event_org_status` ON `event` (`organization_id`, `status`)"
    );
};

exports.down = function (knex) {
  return knex.schema
    .dropIndex("idx_registration_event", "registration")
    .dropIndex("idx_event_status_start", "event")
    .dropIndex("idx_event_org_status", "event");
};
