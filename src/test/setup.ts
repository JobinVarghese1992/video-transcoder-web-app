// File: src/test/setup.ts
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});