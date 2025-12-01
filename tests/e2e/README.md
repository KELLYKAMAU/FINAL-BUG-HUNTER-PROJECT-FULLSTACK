# End-to-End (E2E) Tests

This directory contains Playwright E2E tests for the Bug Tracking System API.

## Test Files

- `auth.e2e.spec.ts` - Authentication and login tests
- `users.e2e.spec.ts` - User management CRUD operations
- `projects.e2e.spec.ts` - Project management tests
- `bugs.e2e.spec.ts` - Bug tracking and management tests
- `comments.e2e.spec.ts` - Comment functionality tests

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with UI mode (interactive)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/auth.e2e.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
```

## Prerequisites

1. Ensure your database is set up and running
2. Create a `.env` file with test database credentials
3. The server will automatically start before tests run (configured in `playwright.config.ts`)

## Test Structure

Each test file follows this pattern:
- `beforeAll` - Sets up test users and authentication tokens
- Individual test cases for each endpoint
- Tests cover both positive and negative scenarios


