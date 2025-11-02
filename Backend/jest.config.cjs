/** Jest config (CJS) used by CI and local `npm test` */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // CI-friendly config (no TS jest.config)
  transform: { "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "./tsconfig.jest.json" }] },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
};
