import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
  window.scrollTo = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.className = "";
});
