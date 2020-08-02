module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
  },
  extends: ['eslint:recommended', 'airbnb-base'],
  rules: {
    'func-names': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'max-len': ['error', 140],
    'no-param-reassign': 'off', // We use a lot of reassign in mongo
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
  },
};
