import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage/convex",
      include: ["convex/**/*.ts"],
      exclude: [
        "convex/**/*.test.ts",
        "convex/test.setup.ts",
        "convex/_generated/**",
        "convex/schema.ts",
        "convex/auth.config.ts",
        "shared/**",
      ],
      excludeAfterRemap: true,
      skipFull: false,
    },
    projects: [
      {
        extends: true,
        test: {
          name: "convex",
          include: ["convex/**/*.test.{ts,js}"],
          exclude: [
            ...configDefaults.exclude,
            "node_modules/**",
            "shared/**",
            "convex/_generated/**",
            "convex/schema.ts",
            "convex/auth.config.ts",
          ],
          environment: "edge-runtime",
        },
      },
      {
        extends: true,
        test: {
          name: "frontend",
          include: ["**/*.test.{ts,tsx,js,jsx}"],
          exclude: [
            ...configDefaults.exclude,
            "node_modules/**",
            "dist/**",
            "coverage/**",
            "convex/**",
            "shared/**",
          ],
          environment: "jsdom",
        },
      },
    ],
  },
});
