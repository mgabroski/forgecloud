/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import { AppDataSource } from '../../config/data-source';

describe('Testing infrastructure smoke test', () => {
  it('AppDataSource should be initialized in test environment', () => {
    expect(AppDataSource.isInitialized).toBe(true);
  });
});
