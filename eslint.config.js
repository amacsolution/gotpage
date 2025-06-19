const eslintPluginTypeScript = require('@typescript-eslint/eslint-plugin')
const parserTypeScript = require('@typescript-eslint/parser')

module.exports = [
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: parserTypeScript,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: process.cwd(),
            },
        },
        plugins: {
            '@typescript-eslint': eslintPluginTypeScript,
        },
        rules: {
            // przykładowe reguły
            '@typescript-eslint/no-unused-vars': 'warn',
        },
        ignores: [
            "**/node_modules/**",
            "**/.next/**",
            "**/dist/**",
            "**/build/**",
            "**/public/**"
        ],
    },
]
