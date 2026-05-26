# TESTS.md

## Audit Engine Tests

- **File:** `src/utils/auditEngine.test.js`
- **Purpose:** Verify the core functionality of the audit engine, including:
  1. Correct calculation of total current spend.
  2. Optimization logic produces a lower (or equal) optimized spend.
  3. Accurate savings and savings percentage calculations.
  4. Detection of redundancy recommendations when multiple tools share the same use‑case.
  5. Safe fallback behavior for an empty tool list.

## Running the Tests

The project uses **Vitest** as the test runner.

```bash
npm install   # (if not already installed)
npx vitest    # run all tests
```

You can also run tests in watch mode during development:

```bash
npx vitest --watch
```

The test suite should complete with **5 passing** tests.
