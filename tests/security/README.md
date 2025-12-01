# Security Tests

This directory contains Playwright security tests for the Bug Tracking System API.

## Test Files

- `auth.security.spec.ts` - Authentication security tests (SQL injection, XSS, JWT security)
- `authorization.security.spec.ts` - Authorization and access control tests
- `input-validation.security.spec.ts` - Input validation and sanitization tests

## Security Test Coverage

### Authentication Security
- SQL injection prevention
- XSS (Cross-Site Scripting) prevention
- JWT token tampering prevention
- Token expiry validation
- Rate limiting
- Password complexity
- Error message security

### Authorization Security
- Role-based access control (RBAC)
- Horizontal privilege escalation prevention
- Vertical privilege escalation prevention
- IDOR (Insecure Direct Object Reference) prevention
- Authorization header validation

### Input Validation Security
- SQL injection prevention
- NoSQL injection prevention
- Command injection prevention
- Path traversal prevention
- LDAP injection prevention
- Buffer overflow prevention
- Enum validation
- Email format validation
- Required field validation

## Running Security Tests

```bash
# Run all security tests
pnpm test:security

# Run specific security test file
npx playwright test tests/security/auth.security.spec.ts

# Run with detailed output
npx playwright test tests/security --reporter=list
```

## Test Approach

These tests verify that the API:
1. Rejects malicious input
2. Enforces proper authorization
3. Sanitizes user input
4. Prevents common security vulnerabilities
5. Handles edge cases securely

## Note

Some tests may need adjustment based on your actual API implementation. The tests are designed to document expected security behavior and may need to be updated if your security requirements differ.


