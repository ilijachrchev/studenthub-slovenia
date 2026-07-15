/**
 * Initial schema for StudentHub Slovenia
 *
 * This migration creates all tables, indexes, and constraints for the application.
 * Tables are created in dependency order to satisfy foreign key constraints.
 *
 * Safety: Uses createTable which is idempotent in Knex (only creates if not exists).
 * The down() migration drops all tables in reverse dependency order.
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

async function existingTables(knex) {
  const rows = await knex.raw(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()"
  );
  return new Set(rows[0].map((r) => Object.values(r)[0]));
}

async function tableExists(knex, name) {
  const rows = await knex.raw(
    "SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
    [name]
  );
  return rows[0][0].cnt > 0;
}

async function addConstraints(knex, name) {
  switch (name) {
    case "faculty":
      await knex.schema.alterTable("faculty", (t) => {
        t.foreign("university_id").references("university.id");
      });
      break;
    case "admin":
      await knex.schema.alterTable("admin", (t) => {
        t.foreign("user_id").references("user.id");
      });
      break;
    case "organization":
      await knex.schema.alterTable("organization", (t) => {
        t.foreign("university_id").references("university.id");
      });
      break;
    case "organizer_profile":
      await knex.schema.alterTable("organizer_profile", (t) => {
        t.foreign("user_id").references("user.id");
        t.foreign("organization_id").references("organization.id");
      });
      break;
    case "event":
      await knex.schema.alterTable("event", (t) => {
        t.foreign("organization_id").references("organization.id");
      });
      break;
    case "event_tag":
      await knex.schema.alterTable("event_tag", (t) => {
        t.foreign("event_id").references("event.id");
        t.foreign("tag_id").references("tag.id");
      });
      break;
    case "event_target":
      await knex.schema.alterTable("event_target", (t) => {
        t.foreign("event_id").references("event.id");
        t.foreign("faculty_id").references("faculty.id");
      });
      break;
    case "event_rejection":
      await knex.schema.alterTable("event_rejection", (t) => {
        t.foreign("event_id").references("event.id");
        t.foreign("admin_id").references("admin.id");
      });
      break;
    case "student_profile":
      await knex.schema.alterTable("student_profile", (t) => {
        t.foreign("user_id").references("user.id");
        t.foreign("faculty_id").references("faculty.id");
      });
      break;
    case "user_interest":
      await knex.schema.alterTable("user_interest", (t) => {
        t.foreign("user_id").references("user.id");
        t.foreign("tag_id").references("tag.id");
      });
      break;
    case "bookmark":
      await knex.schema.alterTable("bookmark", (t) => {
        t.foreign("user_id").references("user.id");
        t.foreign("event_id").references("event.id");
      });
      break;
    case "registration":
      await knex.schema.alterTable("registration", (t) => {
        t.foreign("user_id").references("user.id");
        t.foreign("event_id").references("event.id");
      });
      break;
    case "feedback":
      await knex.schema.alterTable("feedback", (t) => {
        t.foreign("user_id").references("user.id");
        t.foreign("event_id").references("event.id");
      });
      break;
  }
}

async function addIndexes(knex, name) {
  switch (name) {
    case "faculty":
      await knex.raw("CREATE INDEX IF NOT EXISTS idx_faculty_email_domain ON faculty (email_domain)");
      break;
    case "organization":
      await knex.raw("CREATE INDEX IF NOT EXISTS idx_organization_status ON organization (status)");
      break;
    case "event":
      await knex.raw("CREATE INDEX IF NOT EXISTS idx_event_status ON event (status)");
      await knex.raw("CREATE INDEX IF NOT EXISTS idx_event_organization ON event (organization_id)");
      await knex.raw("CREATE INDEX IF NOT EXISTS idx_event_start ON event (start_datetime)");
      break;
  }
}

exports.up = async function (knex) {
  const present = await existingTables(knex);

  for (const { name, deps } of TABLES) {
    if (present.has(name)) continue;

    for (const dep of deps) {
      if (!(await tableExists(knex, dep))) {
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
          t.integer("university_id").unsigned().notNullable();
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
          t.integer("user_id").unsigned().notNullable().unique("uniq_admin_user");
          break;
        case "organization":
          t.increments("id").primary();
          t.string("name", 255).notNullable();
          t.text("description").nullable();
          t.string("logo", 500).nullable();
          t.string("website", 500).nullable();
          t.string("contact_email", 255).notNullable();
          t.integer("university_id").unsigned().nullable();
          t.string("status", 50).notNullable().defaultTo("pending");
          t.datetime("approved_at").nullable();
          break;
        case "organizer_profile":
          t.integer("user_id").unsigned().notNullable();
          t.integer("organization_id").unsigned().notNullable();
          t.string("role_in_org", 50).notNullable();
          t.primary(["user_id", "organization_id"]);
          break;
        case "event":
          t.increments("id").primary();
          t.integer("organization_id").unsigned().notNullable();
          t.string("title", 255).notNullable();
          t.text("description").nullable();
          t.string("location", 255).notNullable();
          t.datetime("start_datetime").notNullable();
          t.datetime("end_datetime").notNullable();
          t.integer("capacity").unsigned().nullable();
          t.string("registration_type", 20).notNullable();
          t.string("external_url", 500).nullable();
          t.string("status", 50).notNullable().defaultTo("draft");
          t.datetime("created_at").notNullable().defaultTo(knex.fn.now());
          break;
        case "event_tag":
          t.integer("event_id").unsigned().notNullable();
          t.integer("tag_id").unsigned().notNullable();
          t.primary(["event_id", "tag_id"]);
          break;
        case "event_target":
          t.integer("event_id").unsigned().notNullable();
          t.integer("faculty_id").unsigned().notNullable();
          t.primary(["event_id", "faculty_id"]);
          break;
        case "event_rejection":
          t.integer("event_id").unsigned().notNullable().primary();
          t.integer("admin_id").unsigned().notNullable();
          t.text("reason").notNullable();
          break;
        case "student_profile":
          t.integer("user_id").unsigned().notNullable().primary();
          t.integer("faculty_id").unsigned().notNullable();
          t.integer("study_year").unsigned().nullable();
          break;
        case "user_interest":
          t.integer("user_id").unsigned().notNullable();
          t.integer("tag_id").unsigned().notNullable();
          t.primary(["user_id", "tag_id"]);
          break;
        case "bookmark":
          t.increments("id").primary();
          t.integer("user_id").unsigned().notNullable();
          t.integer("event_id").unsigned().notNullable();
          t.datetime("saved_At").notNullable().defaultTo(knex.fn.now());
          t.unique(["user_id", "event_id"], "uniq_bookmark");
          break;
        case "registration":
          t.increments("id").primary();
          t.integer("user_id").unsigned().notNullable();
          t.integer("event_id").unsigned().notNullable();
          t.datetime("registered_at").notNullable().defaultTo(knex.fn.now());
          t.string("ticket_code", 14).notNullable();
          t.boolean("checked_in").notNullable().defaultTo(false);
          t.unique(["user_id", "event_id"], "uniq_registration");
          break;
        case "feedback":
          t.increments("id").primary();
          t.integer("user_id").unsigned().notNullable();
          t.integer("event_id").unsigned().notNullable();
          t.integer("rating").notNullable();
          t.text("comment").nullable();
          t.datetime("submitted_at").notNullable().defaultTo(knex.fn.now());
          t.unique(["user_id", "event_id"], "uniq_feedback");
          break;
      }
    });

    await addConstraints(knex, name);
    await addIndexes(knex, name);
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
