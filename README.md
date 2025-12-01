# Bug Tracking Sys

A small Node + TypeScript bug tracking backend. This repository provides REST endpoints to manage users, projects, bugs, comments and basic email notifications.

## Quick overview
- Language: TypeScript
- Frameworks/libraries: Express, mssql, nodemailer
- Dev tools: tsx for local dev + TypeScript compiler

## Prerequisites
- Node.js (v18+ recommended)
- pnpm (project uses pnpm package manager) — install from https://pnpm.io/
- A SQL Server instance (see DB setup below)

## Install
1. Clone the repo
2. From the project root run:

```powershell
pnpm install
```

## Environment variables
Create a `.env` file in the project root with at least the following keys:

- PORT — port to run the server (default 8081)
- SQL_SERVER — SQL Server hostname
- SQL_USER — DB username
- SQL_PWD — DB password
- SQL_DB — DB name
- JWT_SECRET — secret used to sign JWTs
- EMAIL_HOST — SMTP host (optional, used for email tests)
- EMAIL_PORT — SMTP port
- EMAIL_USER — SMTP username
- EMAIL_PASS — SMTP password
- EMAIL_FROM — optional From address
- FRONTEND_URL — URL used in password-reset emails

Example `.env` (DO NOT commit real credentials):

```
PORT=8081
SQL_SERVER=localhost
SQL_USER=sa
SQL_PWD=YourStrong!Passw0rd
SQL_DB=BugTrackerDB
JWT_SECRET=supersecret
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=mail@example.com
EMAIL_PASS=password
EMAIL_FROM=no-reply@example.com
FRONTEND_URL=http://localhost:3000
```

## Database
- A SQL schema file exists at `src/db/BugTrackingSystemDB.sql` — run it against your SQL Server instance to create the required tables.

## Run
- Development (hot-reload):

```powershell
pnpm run dev
```

- Build + run:

```powershell
pnpm run build; pnpm start
```

## API Endpoints (summary)
The router files expose the following top-level endpoints and methods. Use Postman or curl to exercise them.

- Auth
  - GET /test-email — send a test email (uses `emailService`)
  - POST /register — register a user

- Users
  - GET /users — list users
  - GET /users/:id — get user by id
  - POST /users — create new user (admin-only)
  - PATCH /users/:id — update user
  - DELETE /users/:id — delete user (admin-only)
  - POST /login — user login

- Projects
  - GET /projects — list projects
  - GET /projects/:id — get project by id
  - POST /projects — create project (admin-only)
  - PUT /projects/:id — update project (admin or developer)
  - DELETE /projects/:id — delete project

- Bugs
  - GET /getbugs/:project_id — list bugs by project
  - GET /allbugs — list all bugs
  - GET /bugs/:id — get a bug by id
  - POST /createbug — create a bug
  - PUT /bugs/:id — update a bug
  - DELETE /bugs/:id — delete a bug

- Comments
  - GET /comments — list all comments
  - GET /comments/:bugid — get comments for a bug
  - POST /comments — create a comment
  - PUT /comments/:id — update a comment
  - DELETE /comments/:commentid — delete a comment

> Note: Some routes apply role-based middleware (adminOnly, adminOrDeveloper, allRoles). See `src/middleware/bearAuth.ts` for auth guards and expected JWT usage.

## Testing
- This repository does not include a test runner by default (no test scripts in `package.json`).
- Recommended approach for automated tests: add a test framework such as Jest or Vitest and create unit/integration suites.

Suggested quick start to add tests (optional):

```powershell
pnpm add -D vitest @types/jest ts-node
# or for Jest:
pnpm add -D jest ts-jest @types/jest
```

Add npm scripts for running tests (example for vitest):

```json
"scripts": {
  "test": "vitest"
}
```

## Troubleshooting
- SQL connection errors: confirm `SQL_SERVER`, `SQL_USER`, `SQL_PWD`, `SQL_DB` are correct and your SQL Server allows TCP connections.
- Email failures: verify SMTP credentials and that the host allows auth from your IP.

## Where to look in the code
- `src/index.ts` — app entry point and server bootstrap
- `src/router/*.ts` — route mount points
- `src/controllers` — request handlers
- `src/services` — business logic & email service
- `src/db` — DB config and SQL schema

---
If you'd like, I can also:
- add a minimal test runner & a couple of example tests, or
- produce Postman collection / ready-to-run test snippets for the QA team.
