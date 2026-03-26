// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*'],
    rules: {
      // Disable import/no-unresolved for packages that ESLint can't resolve
      // TypeScript already validates imports; this avoids false positives
      'import/no-unresolved': [
        'error',
        {
          ignore: [
            '^expo-',
            '^@expo/',
            'date-fns',
            'date-fns/locale',
            '^react-native',
            '^@react-native',
            'text-encoding-polyfill',
            '@stomp/stompjs',
            'react-native-gifted-charts',
          ],
        },
      ],
    },
  },
])
