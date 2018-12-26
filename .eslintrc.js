// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'script',
  },
  env: {
    node: true,
    es6: true,
    mocha: true,
  },
  extends: 'airbnb-base',
  plugins: [
    'mocha',
    'chai-friendly',
  ],
  rules: {
    // 'no-param-reassign': 1,
    'prefer-destructuring': ['error', {
      'AssignmentExpression': {
        array: false,
        object: true,
      },
    }],
    'no-use-before-define': ['error', {
      functions: false,
      classes: true,
      variables: true,
    }],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'ignore',
    }],
    'max-len': ['error', 100, 2, {
      ignoreUrls: true,
      ignoreComments: true,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
  },
  overrides: [
    {
      files: ['test/*.js'],
      rules: {
        // See https://github.com/lo1tuma/eslint-plugin-mocha/tree/master/docs/rules

        'prefer-arrow-callback': 'off',
        'mocha/no-mocha-arrows': 'error',

        'space-before-function-paren': 'off',
        'func-names': 'off',
        'max-nested-callbacks': ['error', 4],

        // See https://github.com/ihordiachenko/eslint-plugin-chai-friendly#usage
        'no-unused-expressions': 'off',
        'chai-friendly/no-unused-expressions': 'error',

        // 'mocha/max-top-level-suites': ['error', 1], // 1 test suite per test file
        'mocha/no-global-tests': 'error',
        'mocha/no-identical-title': 'error',
        'mocha/no-pending-tests': 'warn',
        'mocha/no-return-and-callback': 'error',
        'mocha/no-sibling-hooks': 'error',
        'mocha/no-skipped-tests': 'warn',
        'mocha/no-top-level-hooks': 'error', // Couples with `'mocha/max-top-level-suites': ['...', 1]`
      },
    },
    {
      files: ['database/factories/*.js'],
      rules: {
        'import/no-extraneous-dependencies': ['error', {'optionalDependencies': false}]
      },
    },
  ],
};
