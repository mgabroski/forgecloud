import type { Config } from 'jest';

const config: Config = {
  projects: [
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: 'src',
      testMatch: ['**/__tests__/unit/**/*.test.ts'],
      moduleFileExtensions: ['ts', 'js', 'json'],
      clearMocks: true,
      setupFilesAfterEnv: ['<rootDir>/__tests__/jest-setup.unit.ts'],
      maxWorkers: '50%',
    },
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: 'src',
      testMatch: ['**/__tests__/integration/**/*.test.ts'],
      moduleFileExtensions: ['ts', 'js', 'json'],
      clearMocks: true,
      setupFilesAfterEnv: ['<rootDir>/__tests__/jest-setup.integration.ts'],
      maxWorkers: '50%',
    },
  ],
};

export default config;
