-- StudentHub Slovenia — Development Seed Data
--
-- DEPRECATED: This file is retained as a seed data snapshot for reference only.
-- All seeding should be done through Knex seeds in db/seeds/.
--
-- For new deployments, use: npm run db:seed
-- For Docker deployments, seeds run automatically on startup.
--
-- Passwords (bcrypt hashed):
--   admin@studenthub.test     → admin123
--   organizer@studenthub.test → organizer123
--   student@famnit.upr.si     → student123

USE `SISIII2026_89241041`;

-- ============================================================
-- Universities & Faculties
-- ============================================================

INSERT INTO `university` (`id`, `name`) VALUES
    (1, 'Univerza na Primorskem'),
    (2, 'Univerza v Ljubljani'),
    (3, 'Univerza v Mariboru');

INSERT INTO `faculty` (`id`, `name`, `email_domain`, `university_id`) VALUES
    (1, 'Fakulteta za matematiko, naravoslovje in informacijske tehnologije', 'famnit.upr.si', 1),
    (2, 'Fakulteta za humanistične študije', 'fhsh.upr.si', 1),
    (3, 'Fakulteta za management', 'fm.upr.si', 1),
    (4, 'Fakulteta za računalništvo in informatiko', 'fri.uni-lj.si', 2),
    (5, 'Fakulteta za elektrotehniko', 'fe.uni-lj.si', 2),
    (6, 'Fakulteta za strojništvo', 'fs.uni-lj.si', 2),
    (7, 'Fakulteta za naravoslovje in matematiko', 'fnm.um.si', 3),
    (8, 'Ekonomsko-poslovna fakulteta', 'epf.um.si', 3);

-- ============================================================
-- Users (passwords: admin123 / organizer123 / student123)
-- ============================================================

INSERT INTO `user` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `role`) VALUES
    (1, 'Admin', 'User', 'admin@studenthub.test',
        '$2b$10$7SIIxh22r.4sGjfhTDxufeNN5uT1tYp/YhLxeqvvG08vRCZLMPOQC', 'admin'),
    (2, 'Organizer', 'User', 'organizer@studenthub.test',
        '$2b$10$yP0MijK2H34UNQNzZB5Um.NUcoy/yphlLRkSpGzQiZZw/SxD7PHa.', 'organizer'),
    (3, 'Student', 'User', 'student@famnit.upr.si',
        '$2b$10$skZUBTrWNACrjlPFCsgjAOGI8ZtCUe5h87CuFTP.SPr5.0v0jdM/S', 'student');

INSERT INTO `admin` (`user_id`) VALUES (1);

-- ============================================================
-- Organizations
-- ============================================================

INSERT INTO `organization` (`id`, `name`, `description`, `logo`, `website`, `contact_email`, `university_id`, `status`, `approved_at`) VALUES
    (1, 'Open Source Club', 'Building cool open-source projects together.', NULL, 'https://example.org', 'oss@studenthub.test', 1, 'approved', NOW()),
    (2, 'AI Research Group', 'Exploring artificial intelligence and machine learning.', NULL, 'https://example.org/ai', 'ai@studenthub.test', 1, 'pending', NULL),
    (3, 'Game Dev Hub', 'Indie game development workshops and jams.', NULL, NULL, 'gamedev@studenthub.test', 2, 'approved', NOW());

INSERT INTO `organizer_profile` (`user_id`, `organization_id`, `role_in_org`) VALUES
    (2, 1, 'owner');

-- ============================================================
-- Tags
-- ============================================================

INSERT INTO `tag` (`id`, `name`) VALUES
    (1, 'Workshop'),
    (2, 'Lecture'),
    (3, 'Hackathon'),
    (4, 'Social'),
    (5, 'Career'),
    (6, 'Competition'),
    (7, 'Conference'),
    (8, 'Meetup');

-- ============================================================
-- Events
-- ============================================================

INSERT INTO `event` (`id`, `organization_id`, `title`, `description`, `location`,
    `start_datetime`, `end_datetime`, `capacity`, `registration_type`,
    `external_url`, `status`, `created_at`) VALUES
    (1, 1, 'Git & GitHub Workshop',
        'Learn version control from scratch. Bring your laptop!',
        'FAMNIT MP2, Koper',
        '2026-09-15 17:00:00', '2026-09-15 19:00:00', 30, 'built_in',
        NULL, 'published', NOW()),
    (2, 1, 'Intro to Open Source',
        'How to find and contribute to open-source projects.',
        'FAMNIT PI, Koper',
        '2026-10-01 16:00:00', '2026-10-01 18:00:00', 40, 'built_in',
        NULL, 'published', NOW()),
    (3, 3, 'Game Jam Weekend',
        '48-hour game jam. Form teams on-site or come solo.',
        'FERI, Maribor',
        '2026-11-08 09:00:00', '2026-11-09 17:00:00', NULL, 'external',
        'https://itch.io/jam/gamejam', 'published', NOW()),
    (4, 1, 'Hackathon 2026',
        'Annual student hackathon. Teams of 2-4.',
        'FAMNIT, Koper',
        '2026-12-01 08:00:00', '2026-12-02 20:00:00', 60, 'built_in',
        NULL, 'draft', NOW()),
    (5, 1, 'End-of-Semester Party',
        'Celebrate finishing exams with us!',
        'TBA, Koper',
        '2027-01-20 20:00:00', '2027-01-20 23:59:00', NULL, 'none',
        NULL, 'submitted', NOW()),
    (6, 3, 'VR Workshop',
        'Hands-on introduction to virtual reality development.',
        'FERI Lab 3, Maribor',
        '2026-08-01 14:00:00', '2026-08-01 17:00:00', 20, 'built_in',
        NULL, 'published', NOW());

INSERT INTO `event_tag` (`event_id`, `tag_id`) VALUES
    (1, 1), (1, 5),
    (2, 1), (2, 8),
    (3, 3), (3, 6),
    (4, 3),
    (5, 4),
    (6, 1);

INSERT INTO `event_target` (`event_id`, `faculty_id`) VALUES
    (1, 1), (1, 4),
    (2, 1),
    (3, 4), (3, 5),
    (4, 1), (4, 4),
    (5, 1),
    (6, 4);

-- ============================================================
-- Student profile & interests
-- ============================================================

INSERT INTO `student_profile` (`user_id`, `faculty_id`, `study_year`) VALUES
    (3, 1, 3);

INSERT INTO `user_interest` (`user_id`, `tag_id`) VALUES
    (3, 1), (3, 3), (3, 5);

-- ============================================================
-- Sample bookmarks & registrations (student id=3)
-- ============================================================

INSERT INTO `bookmark` (`user_id`, `event_id`) VALUES
    (3, 1), (3, 3);

INSERT INTO `registration` (`user_id`, `event_id`, `ticket_code`) VALUES
    (3, 6, 'DEVS-TEST-SEED');

-- ============================================================
-- Sample feedback on a past event
-- ============================================================

INSERT INTO `feedback` (`user_id`, `event_id`, `rating`, `comment`) VALUES
    (3, 6, 5, 'Great intro to VR, looking forward to more!');
