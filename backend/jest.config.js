module.exports = {
  testEnvironment: "node",
  globalSetup: "./__tests__/globalSetup.js",
  globalTeardown: "./__tests__/globalTeardown.js",
  setupFiles: ["./__tests__/setup.js"],
  forceExit: true,
  testMatch: ["**/__tests__/**/*.test.js"],
};
