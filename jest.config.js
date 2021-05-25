module.exports = {
    "roots": [
      "<rootDir>/dist/test"
    ],
    testMatch: [ '**/*.test.js'],
    "transform": {
      "^.+\\.tsx?$": "ts-jest"
    },
  }
