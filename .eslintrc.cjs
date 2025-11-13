/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    env: {
      node: true,
      es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./backend/tsconfig.json'],
      tsconfigRootDir: __dirname,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'prettier',
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  
      // Relaxed for now so bootstrap + async handlers don't scream at us
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
    overrides: [
      {
        files: ['*.config.*', '*.eslintrc.*'],
        parserOptions: {
          project: null,
        },
      },
    ],
  };
  