module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2023: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2023,
  },
  rules: {
  },
};
