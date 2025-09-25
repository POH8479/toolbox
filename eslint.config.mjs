import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default defineConfig([
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/build/",
      "**/.turbo/",
      "**/coverage/",
      "**/.expo/",
      "**/.expo-shared/",
      "**/.metro-cache/",
      "**/android/",
      "**/ios/",
      "**/.dynamodb/",
      "**/.serverless/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
    },
  },
  // Prettier last: turns off conflicting stylistic rules
  prettier,
]);
