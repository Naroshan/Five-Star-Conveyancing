// Runs before every test file. React Testing Library's auto-cleanup only
// self-registers when it detects vitest's globals injected into the global
// scope, which this project deliberately doesn't enable (tests import
// describe/it/expect explicitly). Without this, jsdom's document body
// accumulates every render() across every test in a file, and queries like
// getByRole start matching multiple leftover elements from earlier tests.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
