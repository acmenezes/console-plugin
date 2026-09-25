import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  testRegex: '.*\\.spec\\.(ts|tsx|js|jsx)$',
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.ts',
  },
  transform: {
    '\\.ya?ml$': '<rootDir>/__mocks__/yamlTransform.cjs',
    '^.+\\.[jt]sx?$': [
      '@swc/jest',
      {
        module: {
          type: 'commonjs',
          noInterop: true,
        },
        minify: false,
      },
    ],
  },
  setupFiles: ['./setup-globals.ts'],
  setupFilesAfterEnv: ['./setup-tests.ts'],
  testPathIgnorePatterns: ['integration-tests'],
};

export default config;
