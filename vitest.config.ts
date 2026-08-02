/**
 * Lumina — Shared Vitest Configuration
 *
 * This base configuration is extended by each package/app that needs tests.
 * Individual packages can override any of these settings in their own
 * vitest.config.ts.
 *
 * Usage in a package:
 * ```ts
 * import { defineConfig } from 'vitest/config'
 * import { sharedConfig } from '../../vitest.config'
 *
 * export default defineConfig({
 *   ...sharedConfig,
 *   test: {
 *     ...sharedConfig.test,
 *     // package-specific overrides
 *   },
 * })
 * ```
 */

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Use the Node environment for all tests (override to 'jsdom' in UI packages)
    environment: 'node',

    // Glob patterns for test files
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.turbo/**', '**/e2e/**'],

    // Global test setup — runs before each test file
    setupFiles: ['./scripts/test-setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        global: {
          branches: 70,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/*.config.{ts,js}',
        '**/index.ts', // barrel files
        'scripts/**',
        'prisma/**',
      ],
    },

    // Timeout for each test (5 seconds)
    testTimeout: 5000,

    // Timeout for hooks (before/after) — longer for DB operations
    hookTimeout: 10000,

    // Run tests in parallel by default
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // Retry flaky tests up to 1 time in CI
    retry: process.env.CI ? 1 : 0,

    // Reporter — verbose in CI, minimal locally
    reporter: process.env.CI ? 'verbose' : 'default',
  },
})
