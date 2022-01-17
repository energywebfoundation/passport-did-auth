module.exports = {
  extends: ['@energyweb'],
  env: {
    jest: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.eslint.json'],
  },
};
