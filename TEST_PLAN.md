# Test Plan — Bug Tracking Sys

Last updated: 2025-11-21

Purpose
-------
This document is a pragmatic QA test plan for the Bug Tracking Sys backend. It contains scope, environments, test types, prioritized test cases, acceptance criteria, and recommendations for automation and reporting.

Scope
-----
- API endpoints: auth, users, projects, bugs, comments, and email features
- Database integration with SQL Server
- Role-based access control (admin/developer/user)
- Basic error handling, input validation, and JWT-based auth

Out of scope (for this plan)
--------------------------------
- Frontend UI testing (except for email-generated links)
- Extensive performance tuning beyond basic load checks

Test Objectives
---------------
1. Validate core functionality (CRUD for users/projects/bugs/comments).
2. Verify authentication and authorization behavior.
3. Confirm database persistence and data integrity.
4. Validate email sending workflow used for notifications and password resets.
5. Provide a regression suite that can be automated.

Test Types
----------
- Smoke tests: quick checks that app boots and main endpoints respond.
- Functional/API tests: endpoint-level positive/negative cases.
- Integration tests: route -> controller -> repository -> database.
- Security tests: JWT expiry, role-based access, input validation.
- E2E tests (optional): using a local DB and mocked SMTP or test mailbox.
- Performance sanity: small-scale load test (e.g., 100 concurrent requests) for key endpoints.

Test Environments
-----------------
- Local dev (pnpm run dev) using a local SQL Server instance and test SMTP or mocked transport.
- Staging (optional): server with production-like DB and SMTP credentials.

Required test data
------------------
- An empty or seeded test database created from `src/db/BugTrackingSystemDB.sql`.
- Seed accounts: admin@example.com (admin role), dev@example.com (developer role), user@example.com (regular user).
- Reusable tokens: generate via login endpoint during test setup.

How to run tests (manual)
-------------------------
1. Start SQL Server and run the schema script.
2. Create `.env` with test DB credentials and test SMTP values (or mock SMTP).
3. Start the app: `pnpm run dev`.
4. Use Postman or curl to run the test requests below.

Automation recommendation
-------------------------
- Pick a test runner (Vitest or Jest) and an HTTP client (supertest) for API tests.
- Keep tests in `tests/` with `unit/` and `integration/` subfolders.
- Use a test DB (separate schema) and run migrations/seed before integration suites.
- Mock external SMTP in unit tests; for integration tests either use a test mailbox or a local SMTP dev server.

Sample test cases (prioritized)
-------------------------------

Smoke
- Server starts and responds on `GET /` or a health endpoint.

Authentication & Authorization
- POST /login with valid credentials -> 200 + JWT
- POST /login with invalid password -> 401
- Access protected route without Authorization header -> 401
- Access admin-only route with developer JWT -> 403

Users
- POST /users (admin) with valid body -> 201 + created user
- POST /users (non-admin) -> 403
- GET /users -> 200 + list
- GET /users/:id for nonexistent id -> 404
- PATCH /users/:id updates allowed fields -> 200 and persisted

Projects
- POST /projects (admin) -> 201
- GET /projects -> 200 + list
- GET /projects/:id returns project details -> 200
- PUT /projects/:id with non-authorized role -> 403

Bugs
- POST /createbug -> 201 and bug present in DB
- GET /getbugs/:project_id returns bugs for project
- PUT /bugs/:id updates bug fields
- DELETE /bugs/:id removes the bug

Comments
- POST /comments attaches comment to bug -> 201
- GET /comments/:bugid returns comments list
- PUT /comments/:id updates comment
- DELETE /comments/:commentid deletes comment

Email flows
- GET /test-email -> 200 and email is accepted by SMTP or appears in test mailbox
- Password-reset flow (if implemented): email contains FRONTEND_URL with token

Negative and edge cases
- SQL injection-like inputs are rejected or safely parameterized
- Missing required fields -> 400 with validation message
- Very long payloads -> 413 or handled gracefully
- Invalid JWT -> 401

Acceptance Criteria
-------------------
- All smoke tests pass after deployment.
- Core CRUD endpoints return correct status codes and persist changes to DB.
- Role restrictions are enforced (403 where applicable).
- Authentication tokens are accepted and rejected appropriately.
- Email send attempts reach SMTP or are captured by test mailbox; app does not crash on email failures.

Reporting and metrics
---------------------
- Track test pass/fail by suite and by date.
- Key metrics: pass rate, mean time to detect (for regressions), number of blocked tests.

Risks and mitigations
---------------------
- Risk: Tests modify shared DB state. Mitigation: use a dedicated test DB and reset between test suites.
- Risk: External SMTP flakiness. Mitigation: mock SMTP for unit tests and use a local test SMTP server for integration.

Next steps for automation (recommended immediate wins)
---------------------------------------------------
1. Add `vitest` + `supertest`; create `tests/integration/auth.test.ts` and `tests/integration/users.test.ts` (happy paths).
2. Add a `CI` workflow that runs `pnpm install`, seeds test DB, runs build, then runs tests.
3. Export a Postman collection for manual exploratory testing and share with the QA team.

Contact / Notes
---------------
If you want, I can scaffold a few automated tests (auth + one CRUD flow) and add scripts to `package.json`. Tell me which tests to prioritize or if you'd like a Postman collection instead.
