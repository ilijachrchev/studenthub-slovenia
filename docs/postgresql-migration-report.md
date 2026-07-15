# PostgreSQL Migration — Final Report

## 1. Chronological commit list

| # | Hash | Message |
|---|------|---------|
| 1 | `b18dfa5` | `docs(database): audit mysql specific query usage` |
| 2 | `29891ae` | `feat(database): add PostgreSQL infrastructure` |
| 3 | `0538a51` | `refactor(database): migrate schema to PostgreSQL` |
| 4 | `f77ea82` | `refactor(database): migrate seed data to PostgreSQL` |
| 5 | `1302fb8` | `refactor(database): migrate database access layer` |
| 6 | `1e5ddf0` | `refactor(auth): migrate PostgreSQL queries` |
| 7 | `c7b71a3` | `refactor(events): migrate PostgreSQL queries` |
| 8 | `994ff39` | `refactor(bookmarks): migrate PostgreSQL queries` |
| 9 | `34e4e8b` | `refactor(organizations): migrate PostgreSQL queries` |
| 10 | `2da1227` | `refactor(student): migrate PostgreSQL queries` |

---

## 2. Files modified

### New files
| File | Purpose |
|------|---------|
| `backend/db-pg.js` | Standalone pg Pool (kept for reference) |
| `docs/postgresql-query-audit.md` | Complete MySQL dependency audit |
| `docs/postgresql-migration-plan.md` | Pre-migration analysis |

### Modified files
| File | Changes |
|------|---------|
| `backend/db.js` | mysql2 → pg Pool |
| `backend/knexfile.js` | Added `DB_CLIENT` env var, default port switch |
| `backend/package.json` | Added `pg` dependency |
| `backend/.env.example` | Added `DB_CLIENT=pg`, port 5432 |
| `docker-compose.yml` | Added `db-pg` PostgreSQL service, backend now uses PG |
| `backend/db/migrations/0001_initial_schema.js` | Removed `.unsigned()`, `.datetime()` → `.timestamp()`, `DATABASE()` → `knex.schema.hasTable()` |
| `backend/db/migrations/0002_add_query_indexes.js` | Rewrote MySQL prepared statements → `CREATE/DROP INDEX IF NOT EXISTS/IF EXISTS` |
| `backend/db/seeds/01_development.js` | `SHOW TABLES` → `knex.schema.hasTable()` |
| `backend/db/verify.js` | `SHOW TABLES`/`SHOW INDEX` → `pg_indexes` / `hasTable()` |
| `backend/db/status.js` | `information_schema` query → PostgreSQL `table_schema = 'public'` |
| `backend/routes/auth.js` | `?` → `$1`, `[rows]` → `{ rows }`, `insertId` → `RETURNING id`, quoted `"user"` |
| `backend/routes/events.js` | `?` → `$1`, `[rows]` → `{ rows }`, `IN (?)` → `IN ($1,$2,...)` |
| `backend/routes/registrations.js` | `?` → `$1`, `insertId` → `RETURNING`, `affectedRows` → `rowCount` |
| `backend/routes/organizations.js` | `?` → `$1`, `insertId` → `RETURNING id`, `IN (?)` → explicit placeholders |
| `backend/routes/organizer.js` | Transaction API → pg client, `?` → `$1`, `insertId` → `RETURNING id` |
| `backend/routes/admin.js` | Transaction API → pg client, `affectedRows` → `rowCount`, `NOW()` preserved |
| `backend/routes/student.js` | Transaction API → pg client, `VALUES ?` batch → individual inserts |
| `backend/routes/bookmarks.js` | `?` → `$1`, `affectedRows` → `rowCount` |
| `backend/routes/feedback.js` | `?` → `$1`, `[rows]` → `{ rows }` |
| `backend/routes/search.js` | `?` → `$1`, `IN (?)` → explicit placeholders |
| `backend/routes/lookups.js` | `?` → `$1`, `[rows]` → `{ rows }` |
| `backend/__tests__/globalSetup.js` | mysql2 → pg Client, MySQL DDL → PG DDL |
| `backend/__tests__/globalTeardown.js` | mysql2 → pg Client |
| `backend/__tests__/migration.test.js` | mysql2 → pg Client, `SHOW TABLES` → `pg_tables` |
| `backend/__tests__/setup.js` | Port 3306 → 5432, added `DB_CLIENT=pg` |
| `backend/__tests__/health.test.js` | Port 3306 → 5432 |

---

## 3. Queries converted

### By category

| Category | Count | Conversion |
|----------|-------|------------|
| SELECT queries | 30 | `?` → `$1`, `[rows]` → `{ rows }` |
| INSERT queries | 14 | `?` → `$1`, `insertId` → `RETURNING id` |
| UPDATE queries | 8 | `?` → `$1`, `affectedRows` → `rowCount` |
| DELETE queries | 4 | `?` → `$1`, `affectedRows` → `rowCount` |
| COUNT queries | 1 | `?` → `$1` |
| `IN (?)` expansions | 4 | Explicit `$1,$2,...` placeholders |
| `VALUES ?` batch INSERTs | 2 | Individual INSERT loops |
| Transaction blocks | 4 | `pool.getConnection()` → `pool.connect()` / `BEGIN`/`COMMIT`/`ROLLBACK` |
| `SHOW TABLES` | 5 | `pg_tables` / `knex.schema.hasTable()` |
| `SHOW INDEX FROM` | 1 | `pg_indexes` |
| `DATABASE()` | 2 | Removed (use `knex.schema.hasTable()`) |
| `NOW()` | 1 | Preserved (works in PG) |
| `LIKE ?` | 1 | Preserved (works in PG) |
| MySQL prepared statements | 6 | Removed (use `CREATE INDEX IF NOT EXISTS`) |
| `.unsigned()` | 24 | Removed (PG has no unsigned integers) |
| `.datetime()` | 7 | Changed to `.timestamp()` |

### By route file

| File | Queries | Key changes |
|------|---------|-------------|
| auth.js | 6 | `RETURNING id` for user insert, quoted `"user"` table |
| events.js | 7 | `IN ($1,$2,...)` for batch tag/target lookups |
| registrations.js | 8 | `RETURNING` for registration insert, `rowCount` for delete |
| organizations.js | 6 | `RETURNING id` for org insert, `IN` expansion for tags |
| organizer.js | 7 | pg client transaction, `RETURNING id` for event insert |
| admin.js | 8 | pg client transaction, `rowCount` for all updates |
| student.js | 8 | pg client transaction, individual inserts replace batch `VALUES ?` |
| bookmarks.js | 5 | `rowCount` for delete |
| feedback.js | 5 | Straightforward placeholder conversion |
| search.js | 2 | `IN` expansion for tags |
| lookups.js | 2 | Straightforward placeholder conversion |

---

## 4. Remaining MySQL dependencies

| File | Reference | Reason |
|------|-----------|--------|
| `backend/knexfile.js:3` | `process.env.DB_CLIENT \|\| "mysql2"` | Backward-compatibility default |
| `backend/knexfile.js:4` | `client === "pg" ? "5432" : "3306"` | Port fallback for MySQL |
| `backend/package.json:31` | `"mysql2": "^3.22.4"` | Kept for backward compatibility |

All three are intentional fallbacks. When `DB_CLIENT=pg` is set, these are never used. `mysql2` can be removed from `package.json` after the migration is validated in production.

---

## 5. Known issues

1. **No running PostgreSQL server for live testing.** Docker Desktop is not running on this machine. All changes are syntactically verified but not integration-tested against a live PG instance.

2. **`"user"` table quoting.** PostgreSQL treats `user` as a reserved keyword. All queries referencing the `user` table now use `"user"` (double-quoted). This was applied in `auth.js`, `admin.js`, and the seed file. Other routes that join on `user` were already referencing it through foreign keys and don't query it directly.

3. **`saved_At` column casing.** The bookmark table has a column named `saved_At` (capital A). This was preserved as-is and quoted as `"saved_At"` in the bookmarks route. This is a pre-existing inconsistency in the schema.

4. **Transaction API change.** The pg client transaction pattern (`pool.connect()` / `BEGIN` / `COMMIT` / `ROLLBACK` / `release()`) differs from mysql2's `pool.getConnection()` / `beginTransaction()` / `commit()` / `rollback()` / `release()`. Functionally equivalent but mechanically different.

5. **`db-pg.js` is a duplicate.** Created during Phase 2 for coexistence. Can be removed after full validation.

---

## 6. Manual testing completed

| Test | Status | Notes |
|------|--------|-------|
| Syntax validation (all .js files) | ✅ Pass | `node -c` on every modified file |
| pg Pool loads correctly | ✅ Pass | `require('./db.js')` creates Pool instance |
| Knex generates correct PG SQL | ✅ Pass | Verified `createTable` output |
| knexfile.js switches to PG | ✅ Pass | `DB_CLIENT=pg` produces `client: "pg"`, port 5432 |
| Docker compose syntax | ✅ Pass | Added postgres:16 service with healthcheck |
| Docker not running | ⚠️ Blocked | Cannot test live DB operations |

---

## 7. Automated tests completed

| Test | Status | Notes |
|------|--------|-------|
| Non-DB unit tests (catchAsync, validate) | ⚠️ Blocked | Jest globalSetup tries to connect to PG |
| Migration lifecycle test | ⚠️ Blocked | Requires running PostgreSQL |
| Integration tests | ⚠️ Blocked | Requires running PostgreSQL |

All tests are converted to PostgreSQL syntax and ready to run once a PostgreSQL server is available. The tests cannot run in the current environment because Docker Desktop (and thus PostgreSQL) is not running.

---

## Summary

The PostgreSQL migration is **code-complete** across 10 commits on the `feature/postgresql-migration` branch. All 64 route queries, 2 migrations, 1 seed file, 3 utility scripts, and 4 test files have been converted. The only remaining MySQL references are intentional backward-compatibility defaults in `knexfile.js` and `package.json`.

To complete validation:
1. Start Docker Desktop
2. Run `docker compose up -d db-pg`
3. Run `cd backend && npm run db:migrate`
4. Run `cd backend && npm run db:seed`
5. Run `cd backend && npm test`
6. Start the full stack and test manually
