// Test helper: an in-memory cookie jar standing in for Next.js's real
// cookies() store. The actual vi.mock('next/headers', ...) call lives in
// tests/testUtils/setup.ts (a vitest setupFiles entry) — vi.mock's hoisting
// is resolved per test file via static analysis, so it has to be either in
// the test file itself or a setup file, not an imported helper module.
export function createMockCookieStore() {
  const jar = new Map<string, string>();
  return {
    get(name: string) {
      const value = jar.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set(name: string, value: string) {
      jar.set(name, value);
    },
    delete(name: string) {
      jar.delete(name);
    },
    _jar: jar,
  };
}

export type MockCookieStore = ReturnType<typeof createMockCookieStore>;
