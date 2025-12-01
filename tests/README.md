# Playwright Test Suite

This directory contains comprehensive E2E and security tests for the Bug Tracking System using Playwright.

## Overview

The test suite is organized into two main categories:

1. **E2E Tests** (`tests/e2e/`) - End-to-end tests covering all API endpoints
2. **Security Tests** (`tests/security/`) - Security-focused tests for authentication, authorization, and input validation

## Quick Start

### 1. Install Playwright Browsers

```bash
pnpm test:install
```

Or manually:
```bash
npx playwright install
```

### 2. Set Up Environment

Ensure your `.env` file is configured with:
- Database credentials
- JWT_SECRET
- Server port (default: 8081)

### 3. Run Tests

```bash
# Run all tests
pnpm test:all

# Run only E2E tests
pnpm test:e2e

# Run only security tests
pnpm test:security

# Run with UI (interactive mode)
pnpm test:e2e:ui

# View test report
pnpm test:report
```

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── auth.e2e.spec.ts
│   ├── users.e2e.spec.ts
│   ├── projects.e2e.spec.ts
│   ├── bugs.e2e.spec.ts
│   └── comments.e2e.spec.ts
├── security/               # Security tests
│   ├── auth.security.spec.ts
│   ├── authorization.security.spec.ts
│   └── input-validation.security.spec.ts
└── smoke/                  # Smoke tests (existing)
    └── server.test.ts
```

## Using Playwright MCP Tools

The tests are designed to work with Playwright's Model Context Protocol (MCP) tools. You can also use the Playwright MCP browser tools for interactive testing:

### Example: Testing with Playwright MCP Browser

If you have a frontend application, you can use the Playwright MCP tools to:
- Navigate to pages
- Take screenshots
- Interact with UI elements
- Test user flows

### Example: Testing YouTube Integration

If your application integrates with YouTube (as mentioned), you can test:
- YouTube embed rendering
- Video playback
- API interactions
- OAuth flows (if applicable)

## Configuration

The Playwright configuration is in `playwright.config.ts`. Key settings:

- **Base URL**: `http://localhost:8081` (configurable via `BASE_URL` env var)
- **Browsers**: Chromium, Firefox, WebKit
- **API Project**: Separate project for API-only tests (no browser)
- **Auto-start server**: Server starts automatically before tests

## Test Coverage

### E2E Tests Cover:
- ✅ User registration and authentication
- ✅ User CRUD operations
- ✅ Project management
- ✅ Bug tracking and management
- ✅ Comment functionality
- ✅ Role-based access control
- ✅ Error handling

### Security Tests Cover:
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ JWT security
- ✅ Authorization enforcement
- ✅ Input validation
- ✅ Privilege escalation prevention
- ✅ IDOR prevention
- ✅ Command injection prevention

## Debugging Tests

### Run in Debug Mode

```bash
npx playwright test --debug
```

### Run Specific Test

```bash
npx playwright test tests/e2e/auth.e2e.spec.ts -g "should login"
```

### View Trace

```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

The tests are configured to:
- Run in parallel (configurable)
- Retry on failure (2 retries in CI)
- Generate HTML reports
- Generate JSON reports for CI tools

## Notes

- Tests use a test database (ensure separate test DB or cleanup after tests)
- Tests create and clean up test data automatically
- Some tests may need adjustment based on your actual API implementation
- Security tests document expected behavior and may need updates based on your security requirements

## Troubleshooting

### Server not starting
- Check that port 8081 is available
- Verify database connection in `.env`
- Check server logs

### Tests failing
- Ensure database is set up and accessible
- Verify all environment variables are set
- Check that test data doesn't conflict with existing data

### Browser installation issues
- Run `pnpm test:install` to install browsers
- Check network connectivity
- Verify Node.js version (18+ recommended)


