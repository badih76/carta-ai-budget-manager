import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import clerkNext from '@clerk/eslint-plugin/next'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: { '@clerk/next': clerkNext },
    rules: {
      '@clerk/next/require-auth-protection': [
        'error',
        {
          protected: ['/app/dashboard/**', '/analytics/**', '/budgets/**', '/recurring/**', '/settings/**', '/transactions/**'],
          public: ['/app/sign-in/**', '/app/sign-up/**'],
          resources: {
            routeHandlers: true,
            serverFunctions: true,
            serverComponentEntrypoints: false, // Skip for now.
          },
        },
      ],
    },
  },
]);

export default eslintConfig;
