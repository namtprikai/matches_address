/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import-x/recommended",
    "plugin:import-x/electron",
    "plugin:import-x/typescript",
    "plugin:eslint-comments/recommended",
  ],
  settings: {
    "import-x/resolver": {
      typescript: true,
      node: true,
    },
    react: {
      version: "detect",
    },
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
  plugins: ["eslint-comments"],
  rules: {
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    "import-x/no-unresolved": "error",
    "import-x/no-default-export": "error",
    "import-x/order": "error",
    "import-x/no-named-as-default": "off",
    "react/jsx-sort-props": [
      "error",
      {
        reservedFirst: ["key", "dangerouslySetInnerHTML", "ref"],
      },
    ],
    "object-shorthand": "warn",
    "@typescript-eslint/explicit-function-return-type": "error",
    "no-console": ["error", { allow: ["info", "error", "warn"] }],
    "eslint-comments/require-description": "error",
  },
  overrides: [
    {
      files: ["*.config.ts"],
      rules: {
        "import-x/no-default-export": "off",
      },
    },
  ],
  ignorePatterns: [".eslintrc.cjs"],
};
