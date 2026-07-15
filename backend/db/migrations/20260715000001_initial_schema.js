/**
 * Initial schema for StudentHub Slovenia
 *
 * This migration creates all tables, indexes, and constraints for the application.
 * Tables are created in dependency order to satisfy foreign key constraints.
 *
 * Safety: Uses createTable which is idempotent in Knex (only creates if not exists).
 * The down() migration drops all tables in reverse dependency order.
 *
 * PostgreSQL-compatible: uses Knex schema builder for all DDL, no raw MySQL SQL.
 */

const TABLES = [
  { name: "university",        deps: [] },
  { name: "faculty",           deps: ["university"] },
  { name: "tag",               deps: [] },
  { name: "user",              deps: [] },
  { name: "admin",             deps: ["user"] },
  { name: "organization",      deps: ["university"] },
  { name: "organizer_profile", deps: ["user", "organization"] },
  { name: "event",             deps: ["organization"] },
  { name: "event_tag",         deps: ["event", "tag"] },
  { name: "event_target",      deps: ["event", "faculty"] },
  { name: "event_rejection",   deps: ["event", "admin"] },
  { name: "student_profile",   deps: ["user", "faculty"] },
  { name: "user_interest",     deps: ["user", "tag"] },
  { name: "bookmark",          deps: ["user", "event"] },
  { name: "registration",      deps: ["user", "event"] },
  { name: "feedback",          deps: ["user", "event"] },
];

exports.up = async function (knex) {
  for (const { name, deps } of TABLES) {
    if (await knex.schema.hasTable(name)) continue;

    for (const dep of deps) {
      if (!(await knex.schema.hasTable(dep))) {
        throw new Error(
          `Migration aborted: table "${dep}" must exist before "${name}"`
        );
      }
    }

    await knex.schema.createTable(name, (t) => {
      switch (name) {
        case "university":
          t.increments("id").primary();
          t.string("name", 255).notNullable();
          break;
        case "faculty":
          t.increments("id").primary();
          t.string("name", 255).notNullable();
          t.string("email_domain", 255).notNullable();
          t.integer("university_id").notNullable();
          t.foreign("university_id").references("university.id");
          break;
        case "tag":
          t.increments("id").primary();
          t.string("name", 255).notNullable();
          break;
        case "user":
          t.increments("id").primary();
          t.string("first_name", 255).notNullable();
          t.string("last_name", 255).notNullable();
          t.string("email", 255).notNullable().unique("uniq_user_email");
          t.string("password_hash", 255).notNullable();
          t.string("role", 50).notNullable().defaultTo("student");
          break;
        case "admin":
          t.increments("id").primary();
          t.integer("user_id").notNullable().unique("uniq_admin_user");
          t.foreign("user_id").references("user.id");
          break;
        case "organization":
          t.increments("id").primary();
          t.string("name", 255).notNullable();
          t.text("description").nullable();
          t.string("logo", 500).nullable();
          t.string("website", 500).nullable();
          t.string("contact_email", 255).notNullable();
          t.integer("university_id").nullable();
          t.string("status", 50).notNullable().defaultTo("pending");
          t.timestamp("approved_at").nullable();
          t.foreign("university_id").references("university.id");
          break;
        case "organizer_profile":
          t.integer("user_id").notNullable();
          t.integer("organization_id").notNullable();
          t.string("role_in_org", 50).notNullable();
          t.primary(["user_id", "organization_id"]);
          t.foreign("user_id").references("user.id");
          t.foreign("organization_id").references("organization.id");
          break;
        case "event":
          t.increments("id").primary();
          t.integer("organization_id").notNullable();
          t.string("title", 255).notNullable();
          t.text("description").nullable();
          t.string("location", 255).notNullable();
          t.timestamp("start_datetime").notNullable();
          t.timestamp("end_datetime").notNullable();
          t.integer("capacity").nullable();
          t.string("registration_type", 20).notNullable();
          t.string("external_url", 500).nullable();
          t.string("status", 50).notNullable().defaultTo("draft");
          t.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
          t.foreign("organization_id").references("organization.id");
          break;
        case "event_tag":
          t.integer("event_id").notNullable();
          t.integer("tag_id").notNullable();
          t.primary(["event_id", "tag_id"]);
          t.foreign("event_id").references("event.id");
          t.foreign("tag_id").references("tag.id");
          break;
        case "event_target":
          t.integer("event_id").notNullable();
          t.integer("faculty_id").notNullable();
          t.primary(["event_id", "faculty_id"]);
          t.foreign("event_id").references("event.id");
          t.foreign("faculty_id").references("faculty.id");
          break;
        case "event_rejection":
          t.integer("event_id").notNullable().primary();
          t.integer("admin_id").notNullable();
          t.text("reason").notNullable();
          t.foreign("event_id").references("event.id");
          t.foreign("admin_id").references("admin.id");
          break;
        case "student_profile":
          t.integer("user_id").notNullable().primary();
          t.integer("faculty_id").notNullable();
          t.integer("study_year").nullable();
          t.foreign("user_id").references("user.id");
          t.foreign("faculty_id").references("faculty.id");
          break;
        case "user_interest":
          t.integer("user_id").notNullable();
          t.integer("tag_id").notNullable();
          t.primary(["user_id", "tag_id"]);
          t.foreign("user_id").references("user.id");
          t.foreign("tag_id").references("tag.id");
          break;
        case "bookmark":
          t.increments("id").primary();
          t.integer("user_id").notNullable();
          t.integer("event_id").notNullable();
          t.timestamp("saved_At").notNullable().defaultTo(knex.fn.now());
          t.unique(["user_id", "event_id"], "uniq_bookmark");
          t.foreign("user_id").references("user.id");
          t.foreign("event_id").references("event.id");
          break;
        case "registration":
          t.increments("id").primary();
          t.integer("user_id").notNullable();
          t.integer("event_id").notNullable();
          t.timestamp("registered_at").notNullable().defaultTo(knex.fn.now());
          t.string("ticket_code", 14).notNullable();
          t.boolean("checked_in").notNullable().defaultTo(false);
          t.unique(["user_id", "event_id"], "uniq_registration");
          t.foreign("user_id").references("user.id");
          t.foreign("event_id").references("event.id");
          break;
        case "feedback":
          t.increments("id").primary();
          t.integer("user_id").notNullable();
          t.integer("event_id").notNullable();
          t.integer("rating").notNullable();
          t.text("comment").nullable();
          t.timestamp("submitted_at").notNullable().defaultTo(knex.fn.now());
          t.unique(["user_id", "event_id"], "uniq_feedback");
          t.foreign("user_id").references("user.id");
          t.foreign("event_id").references("event.id");
          break;
      }
    });

    if (name === "faculty") {
      await knex.raw("CREATE INDEX IF NOT EXISTS idx_faculty_email_domain ON faculty (email_domain)");
    }
    if (name === "organization") {
      await knex.raw("CREATE INDEX IF NOT EXISTS idx_organization_status ON organization (status)");
    }
    if (name === "event") {
      await knex.raw("CREATE INDEX IF NOT EXISTS idx_event_status ON event (status)");
      await knex.raw("CREATE INDEX IF NOT EXISTS idx_event_organization ON event (organization_id)");
      await knex.raw("CREATE INDEX IF NOT EXISTS idx_event_start ON event (start_datetime)");
    }
  }
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("feedback")
    .dropTableIfExists("registration")
    .dropTableIfExists("bookmark")
    .dropTableIfExists("user_interest")
    .dropTableIfExists("student_profile")
    .dropTableIfExists("event_rejection")
    .dropTableIfExists("event_target")
    .dropTableIfExists("event_tag")
    .dropTableIfExists("event")
    .dropTableIfExists("organizer_profile")
    .dropTableIfExists("organization")
    .dropTableIfExists("admin")
    .dropTableIfExists("user")
    .dropTableIfExists("tag")
    .dropTableIfExists("faculty")
    .dropTableIfExists("university");
};
