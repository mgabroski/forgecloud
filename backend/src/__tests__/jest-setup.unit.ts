let consoleErrorSpy: jest.SpyInstance;

beforeAll(() => {
  // 🔇 Silence console.error during unit tests
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
    // no-op
  });
});

afterAll(() => {
  if (consoleErrorSpy) {
    consoleErrorSpy.mockRestore();
  }
});
