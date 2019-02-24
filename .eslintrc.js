module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
    },
    parserOptions: {
        ecmaVersion: 2018
    },
    extends: ['eslint:recommended'],
    rules: {
        indent: ['error', 4],
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-underscore-dangle': 0,
        'no-plusplus': 0,
        'max-len': ['error', 120],
        'import/no-unresolved': 0,
        'import/extensions': 0,
        'import/prefer-default-export': 0,
    },
};
