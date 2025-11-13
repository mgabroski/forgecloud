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
    plugins: ['@typescript-eslint', 'import'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:import/recommended',
      'plugin:import/typescript',
      'prettier'
    ],
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./backend/tsconfig.json']
        }
      }
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    },
    overrides: [
      {
        files: ['*.config.*', '*.eslintrc.*'],
        parserOptions: {
          project: null
        }
      }
    ]
  };
  