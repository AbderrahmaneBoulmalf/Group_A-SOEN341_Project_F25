// import { createDefaultPreset } from "ts-jest";

// const tsJestTransformCfg = createDefaultPreset().transform;

// /** @type {import('jest').Config} */
// export default {
//   testEnvironment: "node",
//   transform: {
//     ...tsJestTransformCfg,
//   },
//   extensionsToTreatAsEsm: [".ts"],
// };

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.jest.json",
    },
  },
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
};
