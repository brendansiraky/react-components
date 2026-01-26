# ESLint Setup

Guide for setting up ESLint in a new monorepo package or app.

**CRITICAL**: Copy the templates in this file exactly. Do not write your own ESLint configuration or simplify these templates. Use the exact plugins, rules, and structure shown below.

**IMPORTANT**: All ESLint configuration files must be TypeScript (`.ts`), not JavaScript (`.js`).

## Package Location

ESLint configuration lives in `packages/config/eslint/`:

```
packages/config/eslint/
├── package.json    # Dependencies
├── tsconfig.json   # TypeScript config for ESLint files
├── index.ts        # Base config (Node/backend)
└── react.ts        # React config (extends base)
```

## ESLint Configuration Template

Use this flat config template for `packages/config/eslint/index.ts`:

```ts
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/.react-router",
      "**/node_modules",
      "**/dist",
      "**/build",
      "**/.cache",
      "**/coverage",
      "**/.turbo",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{js,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
    plugins: {
      prettier: prettierPlugin,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      import: importPlugin,
    },
    rules: {
      "prettier/prettier": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "import/no-duplicates": [
        "error",
        {
          "prefer-inline": true,
        },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // React first, then external packages
            ["^react", "^(?!@/)([a-z]|@(?!bob))"],
            // Packages starting with @bob (internal)
            ["^@bob"],
            // Relative imports: ~, ../, ./
            [
              "^~",
              "^\\.\\.(?!/?$)",
              "^\\.\\./?$",
              "^\\.\/(?=.*/)(?!/?$)",
              "^\\.(?!/?$)",
              "^\\./?$",
            ],
            // Style imports
            ["^.+\\.s?css$"],
            // Side effect imports
            ["^\\u0000"],
          ],
        },
      ],
    },
  },
);
```

## React Configuration

Create `packages/config/eslint/react.ts`:

```ts
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

import baseConfig from "./index.js";

export default [
  ...baseConfig,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
];
```

## Required Dependencies

Add to `packages/config/eslint/package.json`:

```json
{
  "name": "@bob/eslint-config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./index.ts",
    "./react": "./react.ts"
  },
  "dependencies": {
    "@eslint/js": "^9.17.0",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-prettier": "^5.2.0",
    "eslint-plugin-simple-import-sort": "^12.1.0",
    "eslint-plugin-unused-imports": "^4.1.0",
    "globals": "^15.14.0",
    "typescript-eslint": "^8.18.0"
  },
  "peerDependencies": {
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@bob/typescript-config": "workspace:*",
    "eslint": "^9.17.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.1.0",
    "typescript": "^5.8.0"
  }
}
```

## TypeScript Config for ESLint Package

Create `packages/config/eslint/tsconfig.json`:

```json
{
  "extends": "@bob/typescript-config/base.json",
  "include": ["*.ts"],
  "exclude": ["node_modules"]
}
```

## Using in Apps/Packages

**CRITICAL**: Every package must set `tsconfigRootDir` to avoid ESLint parsing errors in monorepos with multiple tsconfig.json files.

### For Backend/Node Packages

Create `eslint.config.ts` in the package:

```ts
import baseConfig from "@bob/eslint-config";

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

### For React Apps

Create `eslint.config.ts`:

```ts
import reactConfig from "@bob/eslint-config/react";

export default [
  ...reactConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

### Package.json Script

Add lint scripts:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## Key Rules Explained

| Rule | Purpose |
|------|---------|
| `consistent-type-imports` | Enforce `import type` for type-only imports |
| `unused-imports/no-unused-imports` | Auto-remove unused imports |
| `simple-import-sort/imports` | Auto-sort imports by group |
| `import/no-duplicates` | Merge duplicate imports |
| `prettier/prettier` | Integrate Prettier formatting |

## Import Sort Groups

The configuration sorts imports in this order:

1. **React/External**: `react`, then external packages
2. **Internal**: `@bob/*` workspace packages
3. **Relative**: `~`, `../`, `./` imports
4. **Styles**: `.css`, `.scss` files
5. **Side effects**: Side-effect imports

## Customizing for Specific Packages

Override rules in the package's `eslint.config.ts`:

```ts
import baseConfig from "@bob/eslint-config";

export default [
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Package-specific overrides
      "no-console": "off",
    },
  },
];
```
