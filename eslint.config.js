import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['docs/vendor/', 'node_modules/', 'coverage/', 'playwright-report/', 'test-results/'],
  },
  js.configs.recommended,
  {
    rules: {
      eqeqeq: 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['docs/js/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['scripts/**', 'tests/**', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['tests/integration/**'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  prettier,
];
