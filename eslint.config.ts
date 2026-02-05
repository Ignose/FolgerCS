import * as eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import libram, { verifyConstantsSinceRevision } from "eslint-plugin-libram";

const VERIFY_CONSTANTS_SINCE = 28906;

await verifyConstantsSinceRevision(VERIFY_CONSTANTS_SINCE);

export default [
  {
    ignores: ["dist/**"],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...libram.configs.recommended,
  prettier,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
      },
    },
    rules: {
      "block-scoped-var": "error",
      "eol-last": "error",
      eqeqeq: "error",
      "no-trailing-spaces": "error",
      "no-var": "error",
      "prefer-arrow-callback": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "sort-imports": ["error", { ignoreCase: true, ignoreDeclarationSort: true }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "libram/verify-constants": "error",
    },
  },
];


