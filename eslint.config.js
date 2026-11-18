import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['coverage/', 'node_modules/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: 'error',
    },
  },
  {
    files: ['k6/**/*.js'],
    languageOptions: { globals: { __ENV: 'readonly', __VU: 'readonly' } },
  },
];
