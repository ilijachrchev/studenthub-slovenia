# PostgreSQL Migration Plan

Analysis of MySQL dependencies in the StudentHub Slovenia codebase and what would need to change to migrate to PostgreSQL.

**Status:** Analysis only — no code changes.

---

## Scope summary

| Category | Files | Severity |
|---|---|---|
| mysql2 driver / Knex client config | `db.js`, `knexfile.js`, `package.json` | Critical |
| Raw MySQL SQL (`SHOW TABLES`, `SHOW INDEX`, `DATABASE()`, prepared statements) | `migrations/0001`, `migrations/0002`, `verify.js`, `status.js`, `seeds/01_development.js`, 3 test files | Critical |
| `.unsigned()` integers (no PG equivalent) | `migrations/0001` — 24 occurrences | High |
| `.datetime()` type (PG uses `timestamp`) | `migrations/0001` — 7 columns | High |
| mysql2 result properties (`.insertId`, `.affectedRows`) | 7 route files — 12 occurrences | High |
| mysql2 transaction API (`getConnection`, `beginTransaction`) | 4 route files — 5 transaction blocks | High |
| mysql2 batch INSERT (`VALUES ?` array-of-arrays) | `routes/student.js` — 2 occurrences | Medium |
| `NOW()` in raw SQL | `routes/admin.js` — 1 occurrence | Low |
| `.onConflict().ignore()` in seeds | `seeds/01_development.js` — 16 occurrences | None (already portable) |
| Infrastructure (`docker-compose.yml`, `.env.example`, CI) | 3 files | Critical |
| Deprecated SQL snapshots (`schema.sql`, `seed.sql`) | 2 files | Low (retained as reference only) |

---

## Critical changes

### 1. Driver swap — `db.js` + `knexfile.js` + `package.json`

Replace `mysql2` with `pg`. Change `client: "mysql2"` to `client: "pg"` in all Knex environments. Default port changes from `3306` to `5432`.

`db.js` currently exports a raw `mysql2/promise` pool. For PG, either:
- **Option A:** Replace with `pg.Pool` and adapt every `pool.query()` call (14 route files, ~60 query calls).
- **Option B (recommended):** Migrate all query calls to use the existing Knex instance instead of a separate driver. This eliminates the `db.js` pool entirely and gives a single, database-agnostic query layer.

### 2. Raw SQL rewrites

**`migrations/0002_add_query_indexes.js`** — The entire migration uses MySQL prepared statements (`SET @exists`, `PREPARE/EXECUTE/DEALLOCATE`). Must be rewritten as PL/pgSQL `DO $$ ... END $$` blocks using `pg_indexes` instead of `information_schema.statistics`.

**`migrations/000001_initial_schema.js`** — Uses `DATABASE()` in `information_schema` queries. PG equivalent is `current_database()` or querying `pg_catalog.pg_tables`.

**`db/verify.js`** — Uses `SHOW TABLES` and `SHOW INDEX FROM`. PG equivalents: `pg_tables` and `pg_indexes`.

**`db/status.js`** — Uses `information_schema.tables` with `table_schema = DATABASE()`. In PG, `table_schema` is the schema name (e.g., `public`), not the database name.

**`db/seeds/01_development.js`** — Uses `SHOW TABLES` for pre-seed table check.

**Test files** (`globalSetup.js`, `globalTeardown.js`, `migration.test.js`) — All use `mysql2/promise` directly and `SHOW TABLES`.

### 3. Migration syntax changes

**`.unsigned()`** — PostgreSQL has no unsigned integers. Remove all 24 `.unsigned()` calls. Since all FK references are positive auto-increment IDs, this is safe.

**`.datetime()`** — Change to `.timestamp()` or `.timestamp(true)` (with time zone). Affected columns: `created_at`, `saved_At`, `registered_at`, `submitted_at`, `approved_at`, `start_datetime`, `end_datetime`.

---

## High-effort changes

### 4. Query result properties (12 occurrences)

mysql2 returns `[rows, fields]` with `rows.insertId` and `rows.affectedRows`. PostgreSQL `pg` returns `{ rows, rowCount }`. With Knex, inserts can use `.returning('id')` and updates return `rowCount`.

Files: `routes/auth.js`, `routes/organizations.js`, `routes/organizer.js`, `routes/registrations.js`, `routes/bookmarks.js`, `routes/admin.js`.

### 5. Transaction API (5 blocks)

mysql2 uses `pool.getConnection()` → `connection.beginTransaction()` → `connection.commit()` → `connection.release()`. PostgreSQL with Knex: `knex.transaction(async (trx) => { ... })`.

Files: `routes/admin.js`, `routes/organizer.js`, `routes/student.js` (×2).

### 6. Batch INSERT syntax (2 occurrences)

`routes/student.js` uses `VALUES ?` with array-of-arrays. Replace with Knex `.insert(rows)` which generates portable multi-row INSERT.

---

## Low-effort changes

- `NOW()` in `routes/admin.js` — works in PG but `CURRENT_TIMESTAMP` is more portable.
- `IN (?)` in 3 route files — works with `pg` driver but Knex parameterization differs.
- `LIKE ?` in `routes/search.js` — works identically in PG.

---

## Infrastructure

| File | Changes needed |
|---|---|
| `docker-compose.yml` | `mysql:8.0` → `postgres:16`, env vars, port 5432, healthcheck `pg_isready`, volume path |
| `.env.example` | Port 3306 → 5432, env var names if changed |
| `.github/workflows/test.yml` | MySQL service → PostgreSQL service, healthcheck, connection env vars |

---

## Recommended migration approach

1. **Introduce Knex as the sole query layer** — Replace all `pool.query()` calls with Knex queries. This eliminates the mysql2 dependency in one pass.
2. **Rewrite raw SQL in migrations, verify.js, status.js, and seeds** to use Knex schema builder or dialect-aware raw queries.
3. **Swap driver** — Change `client: "mysql2"` to `client: "pg"`, install `pg`, remove `mysql2`.
4. **Update infrastructure** — Docker, CI, env config.
5. **Test** — Run the existing test suite against a local PostgreSQL instance.

---

## Files that would require changes

| File | Nature of change |
|---|---|
| `backend/package.json` | Replace `mysql2` with `pg` |
| `backend/db.js` | Rewrite or remove (use Knex instead) |
| `backend/knexfile.js` | Change `client`, default port |
| `backend/app.js` | Update health query |
| `backend/server.js` | Update pool references |
| `backend/routes/admin.js` | Rewrite queries, transactions, result handling |
| `backend/routes/auth.js` | Rewrite queries, result handling |
| `backend/routes/bookmarks.js` | Rewrite queries, result handling |
| `backend/routes/events.js` | Rewrite queries |
| `backend/routes/feedback.js` | Rewrite queries |
| `backend/routes/lookups.js` | Rewrite queries |
| `backend/routes/organizations.js` | Rewrite queries, result handling |
| `backend/routes/organizer.js` | Rewrite queries, transactions, result handling |
| `backend/routes/registrations.js` | Rewrite queries, result handling |
| `backend/routes/search.js` | Rewrite queries |
| `backend/routes/student.js` | Rewrite queries, transactions, batch inserts |
| `backend/middleware/logger.js` | No change |
| `backend/db/migrations/20260715000001_initial_schema.js` | Remove `.unsigned()`, `.datetime()` → `.timestamp()`, raw SQL → Knex |
| `backend/db/migrations/20260715000002_add_query_indexes.js` | Full rewrite (MySQL prepared statements → PL/pgSQL or Knex) |
| `backend/db/seeds/01_development.js` | Replace `SHOW TABLES` with Knex query |
| `backend/db/verify.js` | Replace `SHOW TABLES` / `SHOW INDEX` with PG catalog queries |
| `backend/db/status.js` | Update `information_schema` query |
| `backend/__tests__/globalSetup.js` | Replace mysql2 with pg, update CREATE DATABASE syntax |
| `backend/__tests__/globalTeardown.js` | Replace mysql2 with pg |
| `backend/__tests__/migration.test.js` | Replace mysql2 with pg, update SHOW TABLES |
| `docker-compose.yml` | Switch to postgres image |
| `backend/.env.example` | Update port |
| `.github/workflows/test.yml` | Switch to PostgreSQL service |
