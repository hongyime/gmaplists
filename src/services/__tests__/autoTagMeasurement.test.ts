import { describe, expect, it } from "vitest";
import { Place } from "../../types";
import { classifyPlacesForMeasurement, measureRuleCoverage, validateAgainstFoodNotes } from "../autoTagMeasurement";

function place(place_name: string, overrides: Partial<Place> = {}): Place {
  return {
    place_name,
    primary_category: "Unsorted",
    detailed_category: "Unknown",
    star_rating: 0,
    review_count: 0,
    is_override: false,
    ...overrides,
  };
}

describe("classifyPlacesForMeasurement", () => {
  it("maps each place through the rule engine and preserves feature_id", () => {
    const places = [
      place("Sushi Bar", { feature_id: "f1" }),
      place("Mystery Spot", { feature_id: "f2" }),
    ];

    const measured = classifyPlacesForMeasurement(places);

    expect(measured).toHaveLength(2);
    expect(measured[0]).toEqual(expect.objectContaining({
      feature_id: "f1",
      place_name: "Sushi Bar",
      category: "Food",
      confidence: "high",
      matched_on: "name_label",
    }));
    expect(measured[1]).toEqual(expect.objectContaining({
      feature_id: "f2",
      place_name: "Mystery Spot",
      category: "Unsorted",
      confidence: "low",
      matched_on: "none",
    }));
  });
});

describe("validateAgainstFoodNotes", () => {
  it("compares note-implied category against the actual classification, counting correct/mismatched/excluded notes", () => {
    const places = [
      place("Random Eatery", { user_notes: "great ramen here", feature_id: "f1" }),
      place("Random Eatery 2", { user_notes: "visited", feature_id: "f2" }),
      place("Quiet Museum", { user_notes: "amazing bar scene", feature_id: "f3" }),
      place("No Note Place", { feature_id: "f4" }),
    ];
    const measured = classifyPlacesForMeasurement(places);

    const result = validateAgainstFoodNotes(places, measured);

    expect(result.excludedCount).toBe(1);
    expect(result.correctCount).toBe(1);
    expect(result.labelledCount).toBe(2);
    expect(result.accuracy).toBe(0.5);
    expect(result.mismatches).toEqual([
      { place_name: "Quiet Museum", note: "amazing bar scene", expected: "Drink", actual: "See" },
    ]);
  });

  it("returns null accuracy when no place has a categorical note", () => {
    const places = [place("No Note Place", { feature_id: "f1" })];
    const measured = classifyPlacesForMeasurement(places);

    const result = validateAgainstFoodNotes(places, measured);

    expect(result).toEqual({
      labelledCount: 0,
      excludedCount: 0,
      correctCount: 0,
      accuracy: null,
      mismatches: [],
    });
  });
});

describe("measureRuleCoverage", () => {
  it("aggregates counts, percentages, and multi-family matches across a mixed set of places", () => {
    const places = [
      place("Sushi Bar", { feature_id: "f1" }),
      place("The Coffee House", { feature_id: "f2" }),
      place("Central Mall", { feature_id: "f3" }),
      place("Mystery Spot", { feature_id: "f4" }),
    ];

    const result = measureRuleCoverage(places);

    expect(result.total).toBe(4);
    expect(result.taggedCount).toBe(3);
    expect(result.unsortedCount).toBe(1);
    expect(result.taggedPercent).toBe(75);
    expect(result.unsortedPercent).toBe(25);
    expect(result.unsortedNames).toEqual(["Mystery Spot"]);
    expect(result.categoryCounts).toEqual({ Food: 1, Snack: 1, Drink: 0, See: 0, Shop: 1, Unsorted: 1 });
    expect(result.confidenceCounts).toEqual({ high: 3, medium: 0, low: 1 });
    expect(result.addressFallbackOnly).toEqual([]);
    // "Sushi Bar" matches both the food.meal family ("sushi"/"sushi bar") and the
    // drink.alcohol family ("bar"); Food wins per the documented precedence rule,
    // but the match set still spans two distinct categories, so it should surface
    // here for human review.
    expect(result.multiFamilyMatches).toHaveLength(1);
    expect(result.multiFamilyMatches[0]).toEqual(expect.objectContaining({ place_name: "Sushi Bar", category: "Food" }));
  });
});
