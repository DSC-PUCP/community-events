// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    ignores: [
      '.next/',
      'eslint.config.mjs',
      'commitlint.config.js',
      'tsup.config.ts',
    ],
    files: ['{app,components}/**/*.{ts,tsx}'],
    rules: {
      /** Eslint rules */
      'lines-between-class-members': ['error', 'always'],
      semi: ['error', 'always'],
      'no-multiple-empty-lines': ['error'],
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
      'operator-linebreak': [
        'error',
        'before',
        {
          overrides: {
            '=': 'after',
            '+=': 'after',
            '-=': 'after',
            '*=': 'after',
            '/=': 'after',
          },
        },
      ],
      'max-len': [
        'error',
        {
          code: 100,
          tabWidth: 2,
          ignoreComments: true,
          ignoreTrailingComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],

      /** TS Eslint rules */
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public',
          },
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      /** Solo permitir variables no usadas si comienzan con _ */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'always',
        },
      ],
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
]);

export default eslintConfig;
