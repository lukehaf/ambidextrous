// eslint.config.js
import js from '@eslint/js'; // for the js.configs.recommended
import stylistic from '@stylistic/eslint-plugin'; // for the additional stylistic default rules
import globals from 'globals'; // for the globals.browser. ESLint makes no assumptions about what global variables exist
// in your execution environment. Below we'll tell it to include global variables such as "console.log" which are
// associated with web browsers.

export default [
  js.configs.recommended,
  // js.configs.all applies all the rules, and is even pickier, and you'll end up manually disabling a lot more of them
  stylistic.configs['recommended-flat'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'semi': 'error',
      'prefer-const': 'error',
      // prefix stylistic rules with @stylistic/js
      '@stylistic/indent': ['error', 2],
      '@stylistic/semi': 'off',
    },
  },
];

// To change a rule’s severity, set the rule ID equal to one of these values:

// "off" or 0 - turn the rule off.
// "warn" or 1 - turn the rule on as a warning (doesn’t affect exit code).
// "error" or 2 - turn the rule on as an error (exit code is 1 when triggered).
// Rules are typically set to "error" to enforce compliance with the rule during continuous integration testing,
// pre-commit checks, and pull request merging because doing so causes ESLint to exit with a non-zero exit code.

// // Here are the CS52 recommended settings. Apparently airbnb style hasn't been supported yet by the newest
// // version of ESlint. Here's Tim's modification of the airbnb style guide

// // USE PRETTIER FOR FORMATTING, NOT ESLINT LIKE TIM DOES.

// {
//   "extends": "airbnb",
//   "env": {
//       "browser": true,
//       "es6": true
//   },
//   "parserOptions": {
//       "ecmaVersion": 2023
//   },
//   "rules": {
//       "strict": 0,
//       "quotes": [2, "single"],
//       "no-else-return": 0,
//       "new-cap": ["error", {"capIsNewExceptions": ["Router"]}],
//       "no-console": 0,
//       "import/no-unresolved": [2, { "caseSensitive": false } ],
//       "no-unused-vars": ["error", { "vars": "all", "args": "none" }], // this one's included in configs.recommended
//       "no-underscore-dangle": 0,
//       "arrow-body-style": 0,
//       "one-var": ["error", { "uninitialized": "always", "initialized": "never" }],
//       "one-var-declaration-per-line": ["error", "initializations"],
//       "max-len": ["error", 200],
//       "no-extra-parens": 0,
//       "no-restricted-syntax": [0, "DebuggerStatement"],
//       "no-debugger": "warn"
//   }}
