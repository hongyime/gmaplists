import { describe, expect, it } from "vitest";
import {
  assertContributorProfilesStrippedFromGetlist,
  assertPlaceRecordsContainNoContributorData,
  stripContributorProfilesFromGetlist,
} from "../privacy";

function makePlaceRow(featureId: string, contributor: unknown = null): unknown[] {
  // Google Maps getlist place rows are opaque arrays; index 12 is the contributor slot.
  const row: unknown[] = new Array(15).fill(null);
  row[0] = featureId;
  row[12] = contributor;
  return row;
}

function makeGetlistPayload(places: unknown[]): unknown {
  // Getlist shape: data[0][8] is the places array. Real payload is much richer, but the
  // stripper only walks [0][8], so a minimal shape is enough to exercise every branch.
  const listHeader: unknown[] = new Array(10).fill(null);
  listHeader[8] = places;
  return [listHeader];
}

describe("privacy", () => {
  it("stripContributorProfilesFromGetlist nulls index 12 on every place row", () => {
    const input = makeGetlistPayload([
      makePlaceRow("feature-a", { name: "Reviewer One", avatar: "https://example.com/a.jpg" }),
      makePlaceRow("feature-b", { name: "Reviewer Two" }),
    ]);

    const stripped = stripContributorProfilesFromGetlist(input) as unknown[];

    const places = (stripped[0] as unknown[])[8] as unknown[][];
    expect(places[0][12]).toBeNull();
    expect(places[1][12]).toBeNull();
  });

  it("stripContributorProfilesFromGetlist does not mutate its input (structuredClone)", () => {
    const contributor = { name: "Reviewer One" };
    const originalRow = makePlaceRow("feature-a", contributor);
    const input = makeGetlistPayload([originalRow]);

    stripContributorProfilesFromGetlist(input);

    // Original input row must still have its contributor slot populated.
    expect(originalRow[12]).toBe(contributor);
    const inputPlaces = ((input as unknown[])[0] as unknown[])[8] as unknown[][];
    expect(inputPlaces[0][12]).toBe(contributor);
  });

  it("stripContributorProfilesFromGetlist returns non-array inputs unchanged", () => {
    expect(stripContributorProfilesFromGetlist(null)).toBeNull();
    expect(stripContributorProfilesFromGetlist("not an array")).toBe("not an array");
    expect(stripContributorProfilesFromGetlist({ some: "object" })).toEqual({ some: "object" });
  });

  it("stripContributorProfilesFromGetlist tolerates a payload with no places array at [0][8]", () => {
    const input: unknown = [["header", "only"]];

    const stripped = stripContributorProfilesFromGetlist(input);

    expect(stripped).toEqual([["header", "only"]]);
  });

  it("assertContributorProfilesStrippedFromGetlist is silent when every place has a null contributor slot", () => {
    const clean = makeGetlistPayload([
      makePlaceRow("feature-a", null),
      makePlaceRow("feature-b", null),
    ]);

    expect(() => assertContributorProfilesStrippedFromGetlist(clean)).not.toThrow();
  });

  it("assertContributorProfilesStrippedFromGetlist throws on a leaking payload", () => {
    const leaking = makeGetlistPayload([
      makePlaceRow("feature-a", null),
      makePlaceRow("feature-b", { name: "Reviewer Two", account_id: "acct-42" }),
    ]);

    expect(() => assertContributorProfilesStrippedFromGetlist(leaking)).toThrow(
      /Contributor profile data was not stripped from getlist place index 1/,
    );
  });

  it("assertContributorProfilesStrippedFromGetlist is silent when the shape has no places array", () => {
    expect(() => assertContributorProfilesStrippedFromGetlist(null)).not.toThrow();
    expect(() => assertContributorProfilesStrippedFromGetlist([["header", "only"]])).not.toThrow();
  });

  it("assertPlaceRecordsContainNoContributorData is silent on clean records", () => {
    const clean = [
      { feature_id: "feature-a", place_name: "A", lat: 1, lng: 2 },
      { feature_id: "feature-b", place_name: "B" },
      null,
      "not-an-object",
    ];

    expect(() => assertPlaceRecordsContainNoContributorData(clean)).not.toThrow();
  });

  it("assertPlaceRecordsContainNoContributorData throws when a record has a contributor-like key", () => {
    const records = [
      { feature_id: "feature-a", place_name: "A" },
      { feature_id: "feature-b", place_name: "B", contributor_name: "Reviewer Two" },
    ];

    expect(() => assertPlaceRecordsContainNoContributorData(records)).toThrow(
      /Contributor-like field "contributor_name" cannot be persisted/,
    );
  });

  it("assertPlaceRecordsContainNoContributorData catches avatar and account key variants case-insensitively", () => {
    expect(() =>
      assertPlaceRecordsContainNoContributorData([{ AvatarUrl: "https://example.com/a.jpg" }]),
    ).toThrow(/Contributor-like field "AvatarUrl"/);

    expect(() =>
      assertPlaceRecordsContainNoContributorData([{ account_id: "acct-42" }]),
    ).toThrow(/Contributor-like field "account_id"/);
  });
});
