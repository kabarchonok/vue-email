/// <reference types="vitest" />

import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",

    onConsoleLog(log) {
      // avoid useless warning
      if (log.includes('Non-function value encountered for default slot.')) return false
    }
  },
  plugins: [
    vue()
  ]
});
