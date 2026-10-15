// AI-assisted (Claude Code): ESLint flat config for Expo, replacing the Next.js config
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

export default defineConfig([
  expoConfig,
  {
    ignores: ["dist/*", ".expo/*"],
  },
]);
