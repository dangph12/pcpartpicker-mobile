// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/prefer-default-export': 'off',
    },
  },
]);
