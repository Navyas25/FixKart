# Tests

No automated tests exist yet - this is a placeholder for the test suite.

## Planned approach

- Use a lightweight test runner (e.g. Node's built-in `node:test`, or Vitest/Jest)
  once the team agrees on one.
- Start with integration tests for each route (`/api/products`, `/api/orders`, etc.)
  hitting a test Supabase project or a mocked Supabase client.
- Add unit tests for validators (`validators/*.validator.js`) since those are
  pure functions and cheap to test.
- Add unit tests for `middleware/role.middleware.js` to lock in the
  authorization rules before real endpoints depend on them.

## Next steps

1. Pick a test runner and add it to `devDependencies`.
2. Add a `test` script to `package.json`.
3. Write the first integration test against `GET /api/health`.
