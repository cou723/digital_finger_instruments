/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: ["./src/test-setup.ts"],
	},
});
