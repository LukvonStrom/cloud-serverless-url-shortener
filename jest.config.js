module.exports = {
  "roots": [
    "<rootDir>/dist/test"
  ],

  "reporters": ["default", "jest-junit"],
  testMatch: ['**/*.test.js'],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
}
