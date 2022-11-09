module.exports = {
  extends: [
    'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors.
    'plugin:react-hooks/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true // Allows for the parsing of JSX
    }
  },
  plugins: ['@typescript-eslint'],
  settings: {
    react: {
      version: 'detect' // Tells eslint-plugin-react to automatically detect the version of React to use
    }
  },
  // Fine tune rules
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-empty-interface': 0,
    'react/no-unknown-property': [
      2,
      {
        ignore: ['jsx']
      }
    ],
    '@typescript-eslint/no-non-null-assertion': 0,
    'react-hooks/rules-of-hooks': 2,
    'react-hooks/exhaustive-deps': 1,
    '@typescript-eslint/no-explicit-any': 0,
    'react/react-in-jsx-scope': 'off'
  }
}
