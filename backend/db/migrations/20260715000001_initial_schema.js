/**
 * Initial schema for StudentHub Slovenia
 * Creates all tables, indexes, and constraints
 */

exports.up = function (knex) {
  return knex.schema
    // Reference tables
    .createTable("university", (t) => {
      t.increments("id").primary();
      t.string("name", 255).notNullable();
    })
    .createTable("faculty", (t) => {
      t.increments("id").primary();
      t.string("name", 255).notNullable();
      t.string("email_domain", 255).notNullable();
      t.integer("university_id").unsigned().notNullable();
      t.foreign("university_id").references("university.id");
      t.index("email_domain", "idx_faculty_email_domain");
    })
    .createTable("tag", (t) => {
      t.increments("id").primary();
      t.string("name", 255).notNullable();
    })

    // User accounts
    .createTable("user", (t) => {
      t.increments("id").primary();
      t.string("first_name", 255).notNullable();
      t.string("last_name", 255).notNullable();
      t.string("email", 255).notNullable().unique("uniq_user_email");
      t.string("password_hash", 255).notNullable();
      t.string("role", 50).notNullable().defaultTo("student");
    })
    .createTable("admin", (t) => {
      t.increments("id").primary();
      t.integer("user_id").unsigned().notNullable().unique("uniq_admin_user");
      t.foreign("user_id").references("user.id");
    })

    // Organizations & membership
    .createTable("organization", (t) => {
      t.increments("id").primary();
      t.string("name", 255).notNullable();
      t.text("description").nullable();
      t.string("logo", 500).nullable();
      t.string("website", 500).nullable();
      t.string("contact_email", 255).notNullable();
      t.integer("university_id").unsigned().nullable();
      t.string("status", 50).notNullable().defaultTo("pending");
      t.datetime("approved_at").nullable();
      t.foreign("university_id").references("university.id");
      t.index("status", "idx_organization_status");
    })
    .createTable("organizer_profile", (t) => {
      t.integer("user_id").unsigned().notNullable();
      t.integer("organization_id").unsigned().notNullable();
      t.string("role_in_org", 50).notNullable();
      t.primary(["user_id", "organization_id"]);
      t.foreign("user_id").references("user.id");
      t.foreign("organization_id").references("organization.id");
    })

    // Events
    .createTable("event", (t) => {
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
      t.foreign("organization_id").references("organization.id");
      t.index("status", "idx_event_status");
      t.index("organization_id", "idx_event_organization");
      t.index("start_datetime", "idx_event_start");
    })
    .createTable("event_tag", (t) => {
      t.integer("event_id").unsigned().notNullable();
      t.integer("tag_id").unsigned().notNullable();
      t.primary(["event_id", "tag_id"]);
      t.foreign("event_id").references("event.id");
      t.foreign("tag_id").references("tag.id");
    })
    .createTable("event_target", (t) => {
      t.integer("event_id").unsigned().notNullable();
      t.integer("faculty_id").unsigned().notNullable();
      t.primary(["event_id", "faculty_id"]);
      t.foreign("event_id").references("event.id");
      t.foreign("faculty_id").references("faculty.id");
    })
    .createTable("event_rejection", (t) => {
      t.integer("event_id").unsigned().notNullable().primary();
      t.integer("admin_id").unsigned().notNullable();
      t.text("reason").notNullable();
      t.foreign("event_id").references("event.id");
      t.foreign("admin_id").references("admin.id");
    })

    // Student profile & interests
    .createTable("student_profile", (t) => {
      t.integer("user_id").unsigned().notNullable().primary();
      t.integer("faculty_id").unsigned().notNullable();
      t.integer("study_year").unsigned().nullable();
      t.foreign("user_id").references("user.id");
      t.foreign("faculty_id").references("faculty.id");
    })
    .createTable("user_interest", (t) => {
      t.integer("user_id").unsigned().notNullable();
      t.integer("tag_id").unsigned().notNullable();
      t.primary(["user_id", "tag_id"]);
      t.foreign("user_id").references("user.id");
      t.foreign("tag_id").references("tag.id");
    })

    // Bookmarks, registrations, feedback
    .createTable("bookmark", (t) => {
      t.increments("id").primary();
      t.integer("user_id").unsigned().notNullable();
      t.integer("event_id").unsigned().notNullable();
      t.datetime("saved_At").notNullable().defaultTo(knex.fn.now());
      t.unique(["user_id", "event_id"], "uniq_bookmark");
      t.foreign("user_id").references("user.id");
      t.foreign("event_id").references("event.id");
    })
    .createTable("registration", (t) => {
      t.increments("id").primary();
      t.integer("user_id").unsigned().notNullable();
      t.integer("event_id").unsigned().notNullable();
      t.datetime("registered_at").notNullable().defaultTo(knex.fn.now());
      t.string("ticket_code", 14).notNullable();
      t.boolean("checked_in").notNullable().defaultTo(false);
      t.unique(["user_id", "event_id"], "uniq_registration");
      t.foreign("user_id").references("user.id");
      t.foreign("event_id").references("event.id");
    })
    .createTable("feedback", (t) => {
      t.increments("id").primary();
      t.integer("user_id").unsigned().notNullable();
      t.integer("event_id").unsigned().notNullable();
      t.integer("rating").notNullable();
      t.text("comment").nullable();
      t.datetime("submitted_at").notNullable().defaultTo(knex.fn.now());
      t.unique(["user_id", "event_id"], "uniq_feedback");
      t.foreign("user_id").references("user.id");
      t.foreign("event_id").references("event.id");
    });
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
