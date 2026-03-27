import nextConfig from "eslint-config-next";
import tseslint from "typescript-eslint";

const eslintConfig = [
  ...nextConfig,
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
  {
    settings: {
      react: {
        version: "19",
      },
    },
  },
];

export default eslintConfig;
