import { afterEach, describe, expect, it, vi } from "vitest";
import { readStorage, writeStorage } from "../browserStorage";

describe("browserStorage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null on read when window is not defined (SSR)", () => {
    expect(readStorage("any-key")).toBeNull();
  });

  it("does nothing on write when window is not defined (SSR)", () => {
    expect(() => writeStorage("any-key", "value")).not.toThrow();
  });

  it("reads a value from window.localStorage when available", () => {
    const getItem = vi.fn().mockReturnValue("stored-value");
    vi.stubGlobal("window", { localStorage: { getItem } });

    expect(readStorage("my-key")).toBe("stored-value");
    expect(getItem).toHaveBeenCalledWith("my-key");
  });

  it("returns null when localStorage.getItem is unavailable or throws", () => {
    const getItem = vi.fn().mockImplementation(() => {
      throw new Error("Storage is blocked");
    });
    vi.stubGlobal("window", { localStorage: { getItem } });

    expect(readStorage("my-key")).toBeNull();
  });

  it("writes a value to window.localStorage when available", () => {
    const setItem = vi.fn();
    vi.stubGlobal("window", { localStorage: { setItem } });

    writeStorage("my-key", "my-value");

    expect(setItem).toHaveBeenCalledWith("my-key", "my-value");
  });

  it("swallows errors when localStorage.setItem throws (private mode / locked-down webview)", () => {
    const setItem = vi.fn().mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    vi.stubGlobal("window", { localStorage: { setItem } });

    expect(() => writeStorage("my-key", "my-value")).not.toThrow();
  });
});
