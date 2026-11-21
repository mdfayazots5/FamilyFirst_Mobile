// P13B: real lint gate (previously `lint` only ran tsc). Flat config, ESLint 9.
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'node_modules', 'public', '*.config.{js,ts}'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.serviceworker },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // CLAUDE.md: TypeScript strict, no untyped any in production code.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      // All logging goes through core/services/logger.ts (R8).
      'no-console': ['error', { allow: [] }],
    },
  },
  {
    files: ['src/core/services/logger.ts'],
    rules: { 'no-console': 'off' },
  },
);
