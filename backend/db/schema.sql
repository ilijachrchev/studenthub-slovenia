-- StudentHub Slovenia — Database Schema
--
-- DEPRECATED: This file is retained as a schema snapshot for reference only.
-- All database changes should be made through Knex migrations in db/migrations/.
--
-- For new deployments, use: npm run db:migrate
-- For Docker deployments, migrations run automatically on startup.
--
-- Database: SISIII2026_89241041
-- Engine: InnoDB, Collation: utf8_unicode_ci

CREATE DATABASE IF NOT EXISTS `SISIII2026_89241041`
    CHARACTER SET utf8
    COLLATE utf8_unicode_ci;

USE `SISIII2026_89241041`;

-- ============================================================
-- Reference tables
-- ============================================================

CREATE TABLE `university` (
    `id`   INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `faculty` (
    `id`            INT AUTO_INCREMENT PRIMARY KEY,
    `name`          VARCHAR(255) NOT NULL,
    `email_domain`  VARCHAR(255) NOT NULL,
    `university_id` INT NOT NULL,
    FOREIGN KEY (`university_id`) REFERENCES `university`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE INDEX `idx_faculty_email_domain` ON `faculty` (`email_domain`);

CREATE TABLE `tag` (
    `id`   INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ============================================================
-- User accounts
-- ============================================================

CREATE TABLE `user` (
    `id`            INT AUTO_INCREMENT PRIMARY KEY,
    `first_name`    VARCHAR(255) NOT NULL,
    `last_name`     VARCHAR(255) NOT NULL,
    `email`         VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role`          VARCHAR(50)  NOT NULL DEFAULT 'student',
    UNIQUE KEY `uniq_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `admin` (
    `id`      INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    UNIQUE KEY `uniq_admin_user` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ============================================================
-- Organizations & membership
-- ============================================================

CREATE TABLE `organization` (
    `id`             INT AUTO_INCREMENT PRIMARY KEY,
    `name`           VARCHAR(255) NOT NULL,
    `description`    TEXT         NULL,
    `logo`           VARCHAR(500) NULL,
    `website`        VARCHAR(500) NULL,
    `contact_email`  VARCHAR(255) NOT NULL,
    `university_id`  INT          NULL,
    `status`         VARCHAR(50)  NOT NULL DEFAULT 'pending',
    `approved_at`    DATETIME     NULL,
    FOREIGN KEY (`university_id`) REFERENCES `university`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE INDEX `idx_organization_status` ON `organization` (`status`);

CREATE TABLE `organizer_profile` (
    `user_id`         INT NOT NULL,
    `organization_id` INT NOT NULL,
    `role_in_org`     VARCHAR(50) NOT NULL,
    PRIMARY KEY (`user_id`, `organization_id`),
    FOREIGN KEY (`user_id`)         REFERENCES `user`(`id`),
    FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ============================================================
-- Events
-- ============================================================

CREATE TABLE `event` (
    `id`               INT AUTO_INCREMENT PRIMARY KEY,
    `organization_id`  INT          NOT NULL,
    `title`            VARCHAR(255) NOT NULL,
    `description`      TEXT         NULL,
    `location`         VARCHAR(255) NOT NULL,
    `start_datetime`   DATETIME     NOT NULL,
    `end_datetime`     DATETIME     NOT NULL,
    `capacity`         INT          NULL,
    `registration_type` VARCHAR(20) NOT NULL,
    `external_url`     VARCHAR(500) NULL,
    `status`           VARCHAR(50)  NOT NULL DEFAULT 'draft',
    `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE INDEX `idx_event_status`        ON `event` (`status`);
CREATE INDEX `idx_event_organization`  ON `event` (`organization_id`);
CREATE INDEX `idx_event_start`         ON `event` (`start_datetime`);

CREATE TABLE `event_tag` (
    `event_id` INT NOT NULL,
    `tag_id`   INT NOT NULL,
    PRIMARY KEY (`event_id`, `tag_id`),
    FOREIGN KEY (`event_id`) REFERENCES `event`(`id`),
    FOREIGN KEY (`tag_id`)   REFERENCES `tag`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `event_target` (
    `event_id`   INT NOT NULL,
    `faculty_id` INT NOT NULL,
    PRIMARY KEY (`event_id`, `faculty_id`),
    FOREIGN KEY (`event_id`)   REFERENCES `event`(`id`),
    FOREIGN KEY (`faculty_id`) REFERENCES `faculty`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `event_rejection` (
    `event_id` INT  NOT NULL,
    `admin_id` INT  NOT NULL,
    `reason`   TEXT NOT NULL,
    PRIMARY KEY (`event_id`),
    FOREIGN KEY (`event_id`) REFERENCES `event`(`id`),
    FOREIGN KEY (`admin_id`) REFERENCES `admin`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ============================================================
-- Student profile & interests
-- ============================================================

CREATE TABLE `student_profile` (
    `user_id`    INT NOT NULL,
    `faculty_id` INT NOT NULL,
    `study_year` INT NULL,
    PRIMARY KEY (`user_id`),
    FOREIGN KEY (`user_id`)    REFERENCES `user`(`id`),
    FOREIGN KEY (`faculty_id`) REFERENCES `faculty`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `user_interest` (
    `user_id` INT NOT NULL,
    `tag_id`  INT NOT NULL,
    PRIMARY KEY (`user_id`, `tag_id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`tag_id`)  REFERENCES `tag`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ============================================================
-- Bookmarks, registrations, feedback
-- ============================================================

CREATE TABLE `bookmark` (
    `id`        INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`   INT      NOT NULL,
    `event_id`  INT      NOT NULL,
    `saved_At`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uniq_bookmark` (`user_id`, `event_id`),
    FOREIGN KEY (`user_id`)  REFERENCES `user`(`id`),
    FOREIGN KEY (`event_id`) REFERENCES `event`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `registration` (
    `id`            INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`       INT          NOT NULL,
    `event_id`      INT          NOT NULL,
    `registered_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ticket_code`   VARCHAR(14)  NOT NULL,
    `checked_in`    BOOLEAN      NOT NULL DEFAULT FALSE,
    UNIQUE KEY `uniq_registration` (`user_id`, `event_id`),
    FOREIGN KEY (`user_id`)  REFERENCES `user`(`id`),
    FOREIGN KEY (`event_id`) REFERENCES `event`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `feedback` (
    `id`            INT AUTO_INCREMENT PRIMARY KEY,
    `user_id`       INT      NOT NULL,
    `event_id`      INT      NOT NULL,
    `rating`        INT      NOT NULL,
    `comment`       TEXT     NULL,
    `submitted_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uniq_feedback` (`user_id`, `event_id`),
    FOREIGN KEY (`user_id`)  REFERENCES `user`(`id`),
    FOREIGN KEY (`event_id`) REFERENCES `event`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
