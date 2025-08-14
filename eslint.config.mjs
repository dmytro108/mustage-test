// @ts-check
// Flat ESLint config for a TypeScript + Jest + Prettier project.
// Key choices:
// - Use typescript-eslint's type-aware rules via recommendedTypeChecked
// - Integrate Prettier to avoid style conflicts
// - Provide jest and node globals for tests and runtime
// - Ignore build and coverage outputs to speed up lint and reduce noise
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Base ignore patterns (applied before other configs)
  {
    // Ignore config file itself and typical build artifacts
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'coverage/**',
      'node_modules/**',
    ],
  },

  // JavaScript recommended rules
  eslint.configs.recommended,

  // TypeScript rules with type-checking enabled (best signal/noise in CI)
  ...tseslint.configs.recommendedTypeChecked,

  // Prettier plugin in "recommended" mode to surface formatting issues as lint
  eslintPluginPrettierRecommended,

  // Global parser/language settings
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest, // allow describe/it/expect/etc. in spec files
      },
      // The project uses CommonJS (NestJS default build output)
      sourceType: 'commonjs',
      parserOptions: {
        // Leverage the Project Service so we don't need to hardcode a tsconfig path.
        // This improves performance and avoids config duplication.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Opinionated rules tuned for CI (warnings won't fail CI, but surface issues)
  {
    rules: {
      // Allow any in places where types are intentionally broad (e.g., NestJS DI)
      '@typescript-eslint/no-explicit-any': 'off',
      // Flag forgotten promise handling; useful for async NestJS handlers
      '@typescript-eslint/no-floating-promises': 'warn',
      // Flag unsafe arguments passed to typed APIs
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
);