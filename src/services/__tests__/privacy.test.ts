import { describe, expect, it } from "vitest";
import {
  assertContributorProfilesStrippedFromGetlist,
  assertPlaceRecordsContainNoContributorData,
  stripContributorProfilesFromGetlist,
} from "../privacy";

// Getlist responses shape place rows as fixed-index arrays; index 12 carries the
// contributor profile blob we must never persist. These helpers build minimal
// fixtures matching that shape without hardcoding unrelated indices.
function makePlaceRow(contributorSlot: unknown): unknown[] {
  const row = new Array(15).fill(null);
  row[12] = contributorSlot;
  return row;
}

function makeGetlistPayload(places: unknown[]): unknown[] {
  const wrapper = new Array(9).fill(null);
  wrapper[8] = places;
  return [wrapper];
}

describe("stripContributorProfilesFromGetlist", () => {
  it("nulls out the contributor slot on every place row without mutating the input", () => {
    const places = [
      makePlaceRow({ name: "John Doe", photo_url: "https://example.com/john.jpg" }),
      makePlaceRow({ name: "Jane Roe" }),
    ];
    const data = makeGetlistPayload(places);

    const stripped = stripContributorProfilesFromGetlist(data) as any[];

    expect(stripped[0][8][0][12]).toBeNull();
    expect(stripped[0][8][1][12]).toBeNull();
    // Original input must be untouched (structuredClone, not an in-place mutation).
    expect((data as any)[0][8][0][12]).toEqual({ name: "John Doe", photo_url: "https://example.com/john.jpg" });
  });

  it("returns non-array input unchanged", () => {
    const input = { foo: "bar" };
    expect(stripContributorProfilesFromGetlist(input)).toBe(input);
  });

  it("returns a clone of the input when the expected places array is missing", () => {
    const input = [[]];
    const result = stripContributorProfilesFromGetlist(input);
    expect(result).toEqual([[]]);
    expect(result).not.toBe(input);
  });
});

describe("assertContributorProfilesStrippedFromGetlist", () => {
  it("throws when a contributor profile is still present", () => {
    const places = [makePlaceRow(null), makePlaceRow({ name: "Leaked Person" })];
    const data = makeGetlistPayload(places);

    expect(() => assertContributorProfilesStrippedFromGetlist(data)).toThrow(/place index 1/);
  });

  it("does not throw once contributor slots are stripped", () => {
    const places = [makePlaceRow(null), makePlaceRow(null)];
    const data = makeGetlistPayload(places);

    expect(() => assertContributorProfilesStrippedFromGetlist(data)).not.toThrow();
  });

  it("does not throw when the payload shape has no recognizable places array", () => {
    expect(() => assertContributorProfilesStrippedFromGetlist({ unrelated: true })).not.toThrow();
    expect(() => assertContributorProfilesStrippedFromGetlist([[]])).not.toThrow();
  });
});

describe("assertPlaceRecordsContainNoContributorData", () => {
  it("throws when a record has a contributor-like key", () => {
    const records = [{ name: "Clean" }, { contributorName: "Leaked" }];
    expect(() => assertPlaceRecordsContainNoContributorData(records)).toThrow(/contributorName/);
  });

  it("throws on avatar/account keys as well, case-insensitively", () => {
    expect(() => assertPlaceRecordsContainNoContributorData([{ AvatarUrl: "x" }])).toThrow();
    expect(() => assertPlaceRecordsContainNoContributorData([{ account_id: "x" }])).toThrow();
  });

  it("does not throw for clean records, including non-object entries", () => {
    const records = [{ name: "Clean" }, null, "not-a-record", 42];
    expect(() => assertPlaceRecordsContainNoContributorData(records)).not.toThrow();
  });
});
