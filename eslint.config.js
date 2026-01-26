import { defineConfig } from "eslint/config";
import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginAstro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

// Ignore patterns (replaces .eslintignore – use only eslint.config.js)
const ignorePatterns = [
  "node_modules/",
  "dist/",
  ".astro/",
  ".vercel/",
  ".netlify/",
  ".cache/",
  ".turbo/",
  ".next/",
  "node_modules/.vite/",
  ".env",
  ".env.*",
  ".vscode/",
  ".idea/",
  "*.swp",
  "*.swo",
  "*.log",
  "npm-debug.log*",
  "yarn-debug.log*",
  "yarn-error.log*",
  "pnpm-debug.log*",
  ".DS_Store",
  "Thumbs.db",
  "*.md",
];

export default defineConfig([
  { ignores: ignorePatterns },
  includeIgnoreFile(gitignorePath),
  {
    extends: [eslint.configs.recommended, tseslint.configs.strict],
    rules: {
      "no-console": "off",
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [jsxA11y.flatConfigs.recommended],
    languageOptions: {
      ...jsxA11y.flatConfigs.recommended.languageOptions,
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [pluginReact.configs.flat.recommended],
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        window: true,
        document: true,
      },
    },
    plugins: {
      "react-hooks": eslintPluginReactHooks,
      "react-compiler": reactCompiler,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react-compiler/react-compiler": "error",
    },
  },
  eslintPluginAstro.configs["flat/recommended"],
  // eslint-plugin-prettier/recommended already includes eslint-config-prettier
  // This must be last to override other configs
  eslintPluginPrettier,
]);
