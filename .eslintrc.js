module.exports = {
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
  env: {
    'node': true,
    'es6': true,
  },
  extends: 'eslint:recommended',
  overrides: [
    {
      files: ['__tests__/**/*.js'],
      env: {
        jest: true
      }
    },
  ],
};
