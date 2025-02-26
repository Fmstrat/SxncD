import globals from "globals";
import pluginJs from "@eslint/js";
import babelParser from "@babel/eslint-parser";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    {
        languageOptions: {
            parser: babelParser, // Reference the @babel/eslint-parser directly
            parserOptions: {
                requireConfigFile: false, // Optional: set to false if you don't have a babel config file
                babelOptions: {
                    plugins: ["@babel/plugin-syntax-import-assertions"], // Add Babel plugin for import assertions
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node, // Include Node.js global variables here
                ...globals.jest, // Jest globals
            },
        },
    },
    pluginJs.configs.recommended, // ESLint recommended rules
    eslintConfigPrettier, // Enable Prettier integration
];
