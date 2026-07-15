# PostgreSQL Migration — MySQL Query Audit

Complete inventory of every MySQL-specific feature across the codebase.

---

## 1. Route files — 64 SQL queries across 11 files

### auth.js (6 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 1 | 39 | `SELECT id FROM faculty WHERE email_domain = ?` | `?` placeholder | `[faculties] = await pool.query(...)` → `.length` |
| 2 | 51 | `SELECT id FROM user WHERE email = ?` | `?` placeholder | `[existing] = await pool.query(...)` → `.length` |
| 3 | 62 | `INSERT INTO user (...) VALUES (?, ?, ?, ?, ?)` | `?` placeholder | `result.insertId` |
| 4 | 89 | `SELECT * FROM user WHERE email = ?` | `?` placeholder | `[users] = await pool.query(...)` → `users[0]` |
| 5 | 145 | `SELECT id, password_hash FROM user WHERE email = ?` | `?` placeholder | `[users] = await pool.query(...)` → `users[0]` |
| 6 | 160 | `UPDATE user SET password_hash = ? WHERE id = ?` | `?` placeholder | Result not captured |

### events.js (7 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 7 | 14 | `SELECT ... FROM event e JOIN organization o ... WHERE e.status = 'published' AND o.status = 'approved' ORDER BY e.start_datetime ASC` | — | `[events]` → `.map()`, `.length` |
| 8 | 30 | `SELECT ... FROM event_tag et JOIN tag t ... WHERE et.event_id IN (?)` | **`IN (?)` array expansion** | `[tagRows]` → grouped map |
| 9 | 56 | `SELECT faculty_id FROM student_profile WHERE user_id = ?` | `?` placeholder | `[profileRows][0]` |
| 10 | 61 | `SELECT tag_id FROM user_interest WHERE user_id = ?` | `?` placeholder | `[interestRows].map(...)` |
| 11 | 66 | `SELECT event_id, faculty_id FROM event_target WHERE event_id IN (?)` | **`IN (?)` array expansion** | `[targetRows]` → grouped map |
| 12 | 108 | `SELECT ... FROM event e JOIN organization o ... WHERE e.id = ? AND ...` | — | `[rows][0]` |
| 13 | 127 | `SELECT t.id, t.name FROM event_tag et JOIN tag t ... WHERE et.event_id = ?` | — | `[tagRows]` |

### registrations.js (8 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 14 | 27 | `SELECT ... FROM registration WHERE user_id = ? AND event_id = ?` | — | `[rows][0]` or `null` |
| 15 | 47 | `SELECT id, capacity, registration_type, status FROM event WHERE id = ?` | — | `[eventRows][0]` |
| 16 | 61 | `SELECT id FROM registration WHERE user_id = ? AND event_id = ?` | — | `[existing].length` |
| 17 | 70 | `SELECT COUNT(*) AS count FROM registration WHERE event_id = ?` | — | `[countRows][0].count` |
| 18 | 81 | `INSERT INTO registration (user_id, event_id, ticket_code) VALUES (?, ?, ?)` | — | **`result.insertId`** |
| 19 | 86 | `SELECT ... FROM registration WHERE id = ?` | — | `[registrationRows][0]` (uses insertId) |
| 20 | 101 | `DELETE FROM registration WHERE user_id = ? AND event_id = ?` | — | **`result.affectedRows === 0`** |
| 21 | 119 | `SELECT ... FROM registration r JOIN event e ... JOIN organization o ... WHERE r.user_id = ? ORDER BY ...` | — | `[rows]` |

### organizations.js (6 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 22 | 26 | `INSERT INTO organization (...) VALUES (?, ?, ?, ?, ?, ?, 'pending')` | — | **`result.insertId`** |
| 23 | 31 | `INSERT INTO organizer_profile (...) VALUES (?, ?, 'owner')` | — | Not captured |
| 24 | 49 | `SELECT o.* FROM organization o JOIN organizer_profile op ... WHERE op.user_id = ?` | — | `[rows][0]` |
| 25 | 67 | `SELECT ... FROM organization o LEFT JOIN university u ... WHERE o.id = ? AND o.status = 'approved'` | — | `[orgRows][0]` |
| 26 | 82 | `SELECT ... FROM event e JOIN organization o ... WHERE e.organization_id = ? AND e.status = 'published' ORDER BY ...` | — | `[events].map()` |
| 27 | 97 | `SELECT ... FROM event_tag et JOIN tag t ... WHERE et.event_id IN (?)` | **`IN (?)` array expansion** | `[tagRows]` → grouped map |

### organizer.js (7 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 28 | 19 | `SELECT ... FROM event e JOIN organizer_profile op ... WHERE op.user_id = ? ORDER BY ... DESC` | — | `[events]` |
| 29 | 69 | `SELECT o.id FROM organization o JOIN organizer_profile op ... WHERE op.user_id = ? AND o.status = 'approved'` | — | `[orgs][0].id` |
| 30 | 87 | `INSERT INTO event (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')` | — | **`result.insertId`** (in txn) |
| 31 | 107 | `INSERT INTO event_tag (event_id, tag_id) VALUES (?, ?)` | — | Not captured (in txn loop) |
| 32 | 113 | `INSERT INTO event_target (Event_id, faculty_id) VALUES (?, ?)` | — | Not captured (in txn loop) |
| 33 | 142 | `SELECT e.id, e.status FROM event e JOIN organizer_profile op ... WHERE e.id = ? AND op.user_id = ?` | — | `[rows][0].status` |
| 34 | 155 | `UPDATE event SET status = 'submitted' WHERE id = ?` | — | Not captured |

### admin.js (8 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 35 | 17 | `SELECT ... FROM event e JOIN organization o ... WHERE e.status = 'submitted' ORDER BY ...` | — | `[events]` |
| 36 | 39 | `UPDATE event SET status = 'published' WHERE id = ? AND status = 'submitted'` | — | **`result.affectedRows === 0`** |
| 37 | 65 | `SELECT id FROM admin WHERE user_id = ?` | — | `[admins][0].id` |
| 38 | 79 | `UPDATE event SET status = 'rejected' WHERE id = ? AND status = 'submitted'` | — | **`result.affectedRows === 0`** (in txn) |
| 39 | 89 | `INSERT INTO event_rejection (event_id, admin_id, reason) VALUES (?, ?, ?)` | — | Not captured (in txn) |
| 40 | 114 | `SELECT ... FROM organization o JOIN organizer_profile op ... JOIN user u ... WHERE o.status = 'pending' ORDER BY ...` | — | `[organizations]` |
| 41 | 137 | `UPDATE organization SET status = 'approved', approved_at = NOW() WHERE id = ? AND status = 'pending'` | **`NOW()`** | **`result.affectedRows === 0`** |
| 42 | 158 | `UPDATE organization SET status = 'rejected' WHERE id = ? AND status = 'pending'` | — | **`result.affectedRows === 0`** |

### bookmarks.js (5 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 43 | 13 | `SELECT ... FROM bookmark b JOIN event e ... JOIN organization o ... WHERE b.user_id = ? ORDER BY ...` | — | `[rows]` |
| 44 | 34 | `SELECT event_id FROM bookmark WHERE user_id = ?` | — | `.map(row => row.event_id)` |
| 45 | 51 | `SELECT id FROM bookmark WHERE user_id = ? AND event_id = ?` | — | `[existing].length` |
| 46 | 59 | `INSERT INTO bookmark (user_id, event_id) VALUES (?, ?)` | — | Not captured |
| 47 | 73 | `DELETE FROM bookmark WHERE user_id = ? AND event_id = ?` | — | **`result.affectedRows === 0`** |

### feedback.js (5 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 48 | 14 | `SELECT id, rating, comment, submitted_at FROM feedback WHERE user_id = ? AND event_id = ?` | — | `[rows][0]` or `null` |
| 49 | 41 | `SELECT id, end_datetime FROM event WHERE id = ?` | — | `[eventRows][0]` |
| 50 | 52 | `SELECT id FROM registration WHERE user_id = ? AND event_id = ?` | — | `[registered].length` |
| 51 | 60 | `SELECT id FROM feedback WHERE user_id = ? AND event_id = ?` | — | `[existing].length` |
| 52 | 68 | `INSERT INTO feedback (user_id, event_id, rating, comment) VALUES (?, ?, ?, ?)` | — | Not captured |

### search.js (2 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 53 | 17 | `SELECT ... FROM event e JOIN organization o ... WHERE e.status = 'published' AND o.status = 'approved' AND e.title LIKE ? ORDER BY ...` | **`LIKE ?`** | `[events].map()`, `.length` |
| 54 | 34 | `SELECT ... FROM event_tag et JOIN tag t ... WHERE et.event_id IN (?)` | **`IN (?)` array expansion** | `[tagRows]` → grouped map |

### student.js (8 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 55 | 21 | `SELECT * FROM student_profile WHERE user_id = ?` | — | `[exisiting].length` |
| 56 | 34 | `INSERT INTO student_profile (user_id, faculty_id, study_year) VALUES (?, ?, ?)` | — | Not captured (in txn) |
| 57 | 41 | `INSERT INTO user_interest (user_id, tag_id) VALUES ?` | **`VALUES ?` batch insert** | Not captured (in txn) |
| 58 | 62 | `SELECT faculty_id, study_year FROM student_profile WHERE user_id = ?` | — | `[profiles][0]` |
| 59 | 71 | `SELECT tag_id FROM user_interest WHERE user_id = ?` | — | `[interests].map(...)` |
| 60 | 103 | `UPDATE student_profile SET faculty_id = ?, study_year = ? WHERE user_id = ?` | — | Not captured (in txn) |
| 61 | 108 | `DELETE FROM user_interest WHERE user_id = ?` | — | Not captured (in txn) |
| 62 | 115 | `INSERT INTO user_interest (user_id, tag_id) VALUES ?` | **`VALUES ?` batch insert** | Not captured (in txn) |

### lookups.js (2 queries)

| # | Line | SQL | MySQL-specific | Result access |
|---|------|-----|----------------|---------------|
| 63 | 9 | `SELECT ... FROM faculty f JOIN university u ... ORDER BY u.name, f.name` | — | `[rows]` |
| 64 | 20 | `SELECT id, name FROM tag ORDER BY name` | — | `[rows]` |

---

## 2. MySQL-specific features summary (routes)

### Placeholders

| Feature | Count | Files |
|---------|-------|-------|
| `?` positional placeholders | 62 queries | All 11 route files |

Must convert to `$1, $2, ...` for pg, or use Knex query builder.

### Result format

| Feature | Count | Files |
|---------|-------|-------|
| `[rows, fields]` destructuring | 62 queries | All route files via `pool.query()` |
| `result.insertId` | 4 occurrences | auth.js:62, registrations.js:81, organizations.js:26, organizer.js:87 |
| `result.affectedRows` | 6 occurrences | admin.js:39,79,137,158, bookmarks.js:73, registrations.js:101 |

pg returns `{ rows, rowCount }`. `insertId` requires `RETURNING id`. `affectedRows` maps to `rowCount`.

### Transaction API

| Feature | Count | Files |
|---------|-------|-------|
| `pool.getConnection()` | 3 | admin.js:75, organizer.js:82, student.js:29,98 |
| `connection.beginTransaction()` | 3 | admin.js:77, organizer.js:84, student.js:31,100 |
| `connection.query()` (inside txn) | 5 blocks | admin.js:79-91, organizer.js:87-117, student.js:34-41,103-115 |
| `connection.commit()` | 3 | admin.js:95, organizer.js:121, student.js:47,121 |
| `connection.rollback()` | 3 | admin.js:83, organizer.js:91, student.js:37,104 |
| `connection.release()` | 3 | admin.js:97, organizer.js:123, student.js:49,123 |

pg does not have `getConnection()`. Must use `client.connect()` from pool, or Knex transactions.

### MySQL-specific SQL syntax

| Feature | Count | Location |
|---------|-------|----------|
| `IN (?)` with array expansion | 4 | events.js:30,66, organizations.js:97, search.js:34 |
| `VALUES ?` batch INSERT | 2 | student.js:41,115 |
| `LIKE ?` with `%` wildcards | 1 | search.js:17 |
| `NOW()` | 1 | admin.js:137 |

`IN (?)` must become `IN ($1,$2,...)` with explicit placeholders. `VALUES ?` must become individual inserts or Knex batch insert.

---

## 3. Database layer files

### db.js (connection pool)

| Line | Feature | Code |
|------|---------|------|
| 1 | mysql2 driver | `const mysql = require("mysql2/promise")` |
| 3 | mysql2 pool creation | `mysql.createPool({ host, user, password, database, port, waitForConnections: true, connectionLimit: 10 })` |

`waitForConnections` and `connectionLimit` have no direct pg equivalents. pg Pool uses `max` for connection limit and always queues.

### knexfile.js (Knex config)

| Line | Feature | Code |
|------|---------|------|
| 5,22,39 | `client: "mysql2"` | Must change to `client: "pg"` |
| 8,25,42 | Default port `3306` | Must change to `5432` |

### server.js

| Line | Feature | Code |
|------|---------|------|
| 3 | `const pool = require("./db")` | Imports mysql2 pool |
| 13 | `pool.query("SELECT 1 AS health")` | Universal SQL |
| 30 | `await pool.end()` | Same API in pg |

### app.js

| Line | Feature | Code |
|------|---------|------|
| 21 | `const db = require("./db")` | Imports mysql2 pool |
| 57 | `await db.query("SELECT 1")` | Universal SQL |

---

## 4. Migrations

### 000001_initial_schema.js

| Feature | Count | Lines |
|---------|-------|-------|
| `.unsigned()` | 24 | 164,180,189,201,207,214,215,219,220,224,225,229,230,231,234,235,240,241,247,248,256,257 |
| `.datetime()` | 7 | 191,205,206,211,242,249,260 |
| `DATABASE()` function | 2 | 32,39 |
| `CREATE INDEX IF NOT EXISTS` (raw) | 5 | 127,130,133,134,135 |

PostgreSQL has no unsigned integers. `.datetime()` must become `.timestamp()`. `DATABASE()` must become hardcoded `'public'` schema.

### 000002_add_query_indexes.js

**Entirely MySQL-specific.** Uses prepared statements throughout:

| Feature | Count | Lines |
|---------|-------|-------|
| `SET @var = (...)` user variables | 6 | 17,21,30,34,43,47 |
| `PREPARE stmt FROM @sql` | 3 (up) + 3 (down) | 24,37,50,66,78,89 |
| `EXECUTE stmt` | 3 (up) + 3 (down) | 25,38,51,67,79,90 |
| `DEALLOCATE PREPARE stmt` | 3 (up) + 3 (down) | 26,39,52,68,80,91 |
| `IF(@exists = 0, ...)` | 3 (up) + 3 (down) | 21,34,47,63,74,85 |
| `information_schema.statistics` | 6 | 17-18,30-31,43-44,59-60,70-71,81-82 |
| `ALTER TABLE ... DROP INDEX` | 3 | 64,75,86 |

Must rewrite entirely as PL/pgSQL `DO $$ ... END $$` blocks or Knex raw DDL.

---

## 5. Seeds

### 01_development.js

| Line | Feature | Code |
|------|---------|------|
| 40 | `SHOW TABLES` | `await knex.raw("SHOW TABLES")` |
| 41 | MySQL result shape | `existingTables[0].map((row) => Object.values(row)[0])` |
| 58+ | `.onConflict().ignore()` | 16 occurrences — **already Knex-portable**, generates `ON CONFLICT DO NOTHING` |

---

## 6. Verification & status scripts

### verify.js

| Line | Feature | Code |
|------|---------|------|
| 56 | `SHOW TABLES` | `await db.raw("SHOW TABLES")` |
| 57 | MySQL result shape | `existingTables[0].map(row => Object.values(row)[0])` |
| 71 | `SHOW INDEX FROM` with backtick quoting | `` db.raw(`SHOW INDEX FROM \`${table}\` WHERE Key_name = ?`, [index]) `` |

### status.js

| Line | Feature | Code |
|------|---------|------|
| 36-38 | `information_schema.tables WHERE table_schema = ?` | Uses database name as schema — PG uses `'public'` |

### reset.js

No MySQL-specific code. Uses only Knex migration API.

---

## 7. Test infrastructure

### globalSetup.js

| Line | Feature | Code |
|------|---------|------|
| 1 | `require("mysql2/promise")` | mysql2 driver |
| 7 | Default port `3306` | MySQL port |
| 13 | `mysql.createConnection()` | mysql2 API |
| 16 | `DROP DATABASE IF EXISTS` with backticks | MySQL syntax |
| 17-18 | `CREATE DATABASE ... CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci` | MySQL charset/collation |

### globalTeardown.js

| Line | Feature | Code |
|------|---------|------|
| 1 | `require("mysql2/promise")` | mysql2 driver |
| 6 | Default port `3306` | MySQL port |
| 13 | `mysql.createConnection()` | mysql2 API |
| 14 | `DROP DATABASE IF EXISTS` with backticks | MySQL syntax |

### migration.test.js

| Line | Feature | Code |
|------|---------|------|
| 12 | `require("mysql2/promise")` | mysql2 driver |
| 17 | Default port `3306` | MySQL port |
| 48 | `mysql.createConnection()` | mysql2 API |
| 49 | `DROP DATABASE IF EXISTS` with backticks | MySQL syntax |
| 50-51 | `CREATE DATABASE ... CHARACTER SET utf8mb4 COLLATE` | MySQL charset |
| 56 | `client: "mysql2"` | Knex config |
| 73 | `DROP DATABASE IF EXISTS` with backticks | MySQL syntax |
| 86,103,122 | `SHOW TABLES` | MySQL-only command |
| 87,104,123 | `tables[0].map(row => Object.values(row)[0])` | MySQL result shape |

### setup.js

| Line | Feature | Code |
|------|---------|------|
| 2 | `process.env.DB_PORT = "3306"` | MySQL port default |

### health.test.js

| Line | Feature | Code |
|------|---------|------|
| 18 | `process.env.DB_PORT = "3306"` | MySQL port default |

---

## 8. Infrastructure

### docker-compose.yml

| Line | Feature | Code |
|------|---------|------|
| 3 | `image: mysql:8.0` | MySQL container |
| 5 | `MYSQL_ROOT_PASSWORD` | MySQL env var |
| 6 | `MYSQL_DATABASE` | MySQL env var |
| 7 | `MYSQL_USER` | MySQL env var |
| 8 | `MYSQL_PASSWORD` | MySQL env var |
| 10 | `"3306:3306"` | MySQL port |
| 11 | `db_data:/var/lib/mysql` | MySQL data path |
| 14 | `mysqladmin ping` | MySQL healthcheck |
| 28 | `DB_PORT: 3306` | MySQL port in env |

---

## 9. Conversion plan summary

### Route queries (64 total)

| Change | Count | Approach |
|--------|-------|----------|
| `?` → `$1,$2,...` | 62 | Use Knex query builder (transparent) or explicit pg placeholders |
| `[rows, fields]` → `{ rows, rowCount }` | 62 | Knex returns `rows` array directly; raw pg returns object |
| `result.insertId` → `RETURNING id` | 4 | Add `.returning('id')` to INSERT statements |
| `result.affectedRows` → `rowCount` | 6 | Access `.rowCount` from pg result |
| `IN (?)` → `IN ($1,$2,...)` | 4 | Knex `.whereIn()` or generate explicit placeholders |
| `VALUES ?` batch INSERT → multi-row | 2 | Knex `.insert(arrayOfObjects)` |
| `LIKE ?` → `ILIKE ?` or `LIKE ?` | 1 | `LIKE` is case-sensitive in both; use `ILIKE` for case-insensitive |
| `NOW()` → `NOW()` | 1 | Works identically in pg |
| Transaction API rewrite | 4 blocks | Knex `trx` or pg `client` transactions |

### Migrations (2 files)

| Change | Approach |
|--------|----------|
| Remove `.unsigned()` (24 occurrences) | Safe — all positive auto-increment IDs |
| `.datetime()` → `.timestamp()` (7 occurrences) | Knex translates automatically for pg |
| `DATABASE()` → `'public'` schema (2 occurrences) | Hardcode or use Knex introspection |
| Prepared statements → PL/pgSQL or Knex (entire 0002) | Complete rewrite |

### Seeds (1 file)

| Change | Approach |
|--------|----------|
| `SHOW TABLES` → pg catalog query (1 occurrence) | `SELECT tablename FROM pg_tables WHERE schemaname = 'public'` |
| Result shape fix (1 occurrence) | `.rows.map(r => r.tablename)` |
| `.onConflict().ignore()` | Already portable — no change |

### Infrastructure (5 files)

| Change | Approach |
|--------|----------|
| `mysql2` → `pg` in db.js | New Pool from `pg` |
| `client: "mysql2"` → `client: "pg"` in knexfile | Config change |
| docker-compose.yml | postgres:16 image, PG env vars, port 5432 |
| Test infrastructure (3 files) | Replace mysql2 with pg Client |
| .env.example port | 3306 → 5432 |
