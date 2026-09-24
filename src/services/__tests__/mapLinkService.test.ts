import { describe, expect, it } from "vitest";
import { getCleanListUrl } from "../mapLinkService";

describe("getCleanListUrl", () => {
  it("returns null when the URL is already a clean userlists URL", async () => {
    const result = await getCleanListUrl("https://www.google.com/local/userlists/list/abc123");
    expect(result).toBeNull();
  });

  it("extracts the list ID from a direct /list/<id> URL path", async () => {
    const result = await getCleanListUrl("https://maps.app.goo.gl/list/AbCdEfGhIjKlMnOp");
    expect(result).toBe("https://www.google.com/local/userlists/list/AbCdEfGhIjKlMnOp");
  });

  it("extracts the list ID from the !2s<id>! data parameter pattern", async () => {
    const result = await getCleanListUrl(
      "https://www.google.com/maps/@1,2,3z/data=!3m1!4b1!2sAbCdEfGhIjKlMnOp!5s",
    );
    expect(result).toBe("https://www.google.com/local/userlists/list/AbCdEfGhIjKlMnOp");
  });

  it("extracts the list ID from the [null,\"<id>\",3] JSON-in-HTML pattern", async () => {
    const result = await getCleanListUrl('<script>var x=[null,"AbCdEfGhIjKlMnOp",3];</script>');
    expect(result).toBe("https://www.google.com/local/userlists/list/AbCdEfGhIjKlMnOp");
  });

  it("rejects matches that are too short to be a real list ID (sanity check)", async () => {
    const result = await getCleanListUrl("https://maps.google.com/list/short");
    expect(result).toBeNull();
  });

  it("returns null when no pattern matches at all", async () => {
    const result = await getCleanListUrl("https://example.com/foo/bar");
    expect(result).toBeNull();
  });
});
