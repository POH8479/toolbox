export default {
  displayName: "<name>",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.(ts|tsx|js)"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2021",
          parser: { syntax: "typescript", tsx: false },
        },
        module: { type: "commonjs" },
      },
    ],
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
