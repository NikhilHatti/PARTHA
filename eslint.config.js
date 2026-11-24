import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*'],
  },
  // Apply TypeScript parser to all TS/TSX source files.
  // 'typescript' resolves to @typescript/typescript6 (TS 6 compat API),
  // allowing typescript-eslint to parse TS 7 projects. See package.json alias.
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  },
];
