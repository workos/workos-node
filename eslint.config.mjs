// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';
import n from 'eslint-plugin-n';

const ignores = [
  '**/*.snap',
  'coverage',
  'node_modules',
  'dist',
  'build',
  'lib',
];

const tests = ['**/*.spec.{js,ts}'];

export default tseslint.config(
  {
    ignores,
  },
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  n.configs['flat/recommended'],
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'n/no-missing-import': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
  {
    files: tests,
    extends: [jestPlugin.configs['flat/recommended']],
    rules: {
      'no-undef': 'off',
      'jest/no-alias-methods': 'off',
      'jest/no-identical-title': 'off',
      'jest/no-disabled-tests': 'off',
      'jest/no-conditional-expect': 'off',
      'jest/valid-expect': 'off',
    },
  },
);
