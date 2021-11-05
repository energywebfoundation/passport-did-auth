module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.eslint.json',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'eslint-plugin-import',
    'prettier',
  ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'import/no-extraneous-dependencies': [
      "error",
      {
        "devDependencies": true,
        "optionalDependencies": false,
        "peerDependencies": false,
      },
    ],
    'prettier/prettier': ['warn'], //change from warn to error if you want to reject checking if the rule is missing
    'semi': ['warn', 'always'], //change from warn to error if you want to reject checking if the rule is missing
  },
};
