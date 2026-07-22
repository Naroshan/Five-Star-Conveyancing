import { vi } from "vitest";

// Applies to every test file via vitest.config.ts's setupFiles. Each test
// swaps in its own mock implementation with (cookies as Mock).mockResolvedValue(...).
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));
