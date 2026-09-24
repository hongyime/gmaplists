import { describe, expect, it } from "vitest";
import { getCleanListUrl } from "../mapLinkService";

describe("mapLinkService", () => {
  it("returns null when the input is already a clean userlists URL", async () => {
    const url = "https://www.google.com/local/userlists/list/AF1QipNabcdefghijklmnop";
    expect(await getCleanListUrl(url)).toBeNull();
  });

  it("extracts the list ID from the direct list/<id> URL pattern", async () => {
    const url = "https://maps.app.goo.gl/somepath/list/AF1QipNabcdefghijklmnop?extra=1";
    expect(await getCleanListUrl(url)).toBe(
      "https://www.google.com/local/userlists/list/AF1QipNabcdefghijklmnop",
    );
  });

  it("extracts the list ID from the !2s<id>! data parameter pattern", async () => {
    const url =
      "https://www.google.com/maps/data=!4m1!1e2!2sCAESGkFGMVFpcE5hYmNkZWZnaGlqa2xtbm9wcXI!3m0";
    expect(await getCleanListUrl(url)).toBe(
      "https://www.google.com/local/userlists/list/CAESGkFGMVFpcE5hYmNkZWZnaGlqa2xtbm9wcXI",
    );
  });

  it("extracts the list ID from the [null,\"<id>\",3] APP_INITIALIZATION_STATE JSON pattern", async () => {
    const html =
      'window.APP_INITIALIZATION_STATE=[["something",[null,"AF1QipNabcdefghijklmnop",3],"tail"]];';
    expect(await getCleanListUrl(html)).toBe(
      "https://www.google.com/local/userlists/list/AF1QipNabcdefghijklmnop",
    );
  });

  it("rejects short false-positive matches that fail the length>10 sanity check", async () => {
    const url = "https://example.com/list/short_id";
    expect(await getCleanListUrl(url)).toBeNull();
  });

  it("returns null when no pattern matches", async () => {
    expect(await getCleanListUrl("https://example.com/no-list-here")).toBeNull();
    expect(await getCleanListUrl("")).toBeNull();
  });
});
