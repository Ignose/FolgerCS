import { defineConfig } from "eslint/config";
import * as eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import libram, { verifyConstantsSinceRevision } from "eslint-plugin-libram";

const VERIFY_CONSTANTS_SINCE = 28906;

await verifyConstantsSinceRevision(VERIFY_CONSTANTS_SINCE);

export default defineConfig([
  {
    ignores: ["dist/**"],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...libram.configs.recommended,
  prettier,

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "libram/verify-constants": "error",
    },
  },
]);


