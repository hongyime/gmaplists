import { afterEach, describe, expect, it, vi } from "vitest";
import { readStorage, writeStorage } from "../browserStorage";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubWindowWithLocalStorage(store: Record<string, string>) {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const key of Object.keys(store)) delete store[key];
      },
    },
  });
}

describe("browserStorage", () => {
  it("readStorage returns null when window is undefined (SSR guard)", () => {
    expect(readStorage("any-key")).toBeNull();
  });

  it("writeStorage is a no-op when window is undefined (SSR guard)", () => {
    expect(() => writeStorage("any-key", "any-value")).not.toThrow();
  });

  it("readStorage returns the stored value via window.localStorage", () => {
    const store: Record<string, string> = { greeting: "hello" };
    stubWindowWithLocalStorage(store);

    expect(readStorage("greeting")).toBe("hello");
    expect(readStorage("missing")).toBeNull();
  });

  it("writeStorage persists the value via window.localStorage", () => {
    const store: Record<string, string> = {};
    stubWindowWithLocalStorage(store);

    writeStorage("greeting", "hola");

    expect(store.greeting).toBe("hola");
  });

  it("readStorage returns null when localStorage.getItem throws (private mode fallback)", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("SecurityError");
        },
        setItem: () => {},
      },
    });

    expect(readStorage("greeting")).toBeNull();
  });

  it("writeStorage swallows errors when localStorage.setItem throws (locked-down webview)", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
      },
    });

    expect(() => writeStorage("greeting", "hola")).not.toThrow();
  });
});
