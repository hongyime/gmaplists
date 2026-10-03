import { describe, expect, it } from "vitest";
import {
  classifyPlacesForMeasurement,
  measureRuleCoverage,
  validateAgainstFoodNotes,
} from "../autoTagMeasurement";
import { Place } from "../../types";

function place(overrides: Partial<Place> & { place_name: string; feature_id: string }): Place {
  return {
    primary_category: "Unsorted",
    detailed_category: "Unknown",
    star_rating: 0,
    review_count: 0,
    is_override: false,
    ...overrides,
  };
}

describe("autoTagMeasurement", () => {
  it("classifyPlacesForMeasurement classifies each place with rule metadata", () => {
    const measured = classifyPlacesForMeasurement([
      place({ place_name: "Restoran Hua Mui", feature_id: "1:1" }),
      place({ place_name: "Xqzv Nopq", feature_id: "1:2" }),
    ]);

    expect(measured).toHaveLength(2);
    expect(measured[0]).toMatchObject({
      feature_id: "1:1",
      place_name: "Restoran Hua Mui",
      category: "Food",
      rule_id: "food.meal",
    });
    expect(measured[0].matched_families).toBeInstanceOf(Array);
    expect(measured[1]).toMatchObject({
      place_name: "Xqzv Nopq",
      category: "Unsorted",
    });
  });

  it("measureRuleCoverage computes tagged/unsorted counts, percentages, and category buckets", () => {
    const places: Place[] = [
      place({ place_name: "Restoran Hua Mui", feature_id: "1:1" }),
      place({ place_name: "The Bakery", feature_id: "1:2" }),
      place({ place_name: "Hidden Cocktail Bar", feature_id: "1:3" }),
      place({ place_name: "Xqzv Nopq", feature_id: "1:4" }),
    ];

    const measured = measureRuleCoverage(places);

    expect(measured.total).toBe(4);
    expect(measured.taggedCount).toBe(3);
    expect(measured.unsortedCount).toBe(1);
    expect(measured.taggedPercent).toBe(75);
    expect(measured.unsortedPercent).toBe(25);
    expect(measured.unsortedNames).toEqual(["Xqzv Nopq"]);
    expect(measured.categoryCounts).toMatchObject({
      Food: 1,
      Snack: 1,
      Drink: 1,
      Unsorted: 1,
    });
    expect(measured.confidenceCounts.high).toBeGreaterThanOrEqual(1);
    expect(measured.places).toHaveLength(4);
  });

  it("measureRuleCoverage returns zeroed percentages for an empty list", () => {
    const measured = measureRuleCoverage([]);

    expect(measured).toMatchObject({
      total: 0,
      taggedCount: 0,
      unsortedCount: 0,
      taggedPercent: 0,
      unsortedPercent: 0,
      unsortedNames: [],
    });
    expect(measured.noteValidation).toMatchObject({
      labelledCount: 0,
      correctCount: 0,
      excludedCount: 0,
      accuracy: null,
      mismatches: [],
    });
  });

  it("validateAgainstFoodNotes records mismatches when measured category disagrees with the note label", () => {
    const places: Place[] = [
      place({ place_name: "Dim Sum House", feature_id: "1:1", user_notes: "Dim sum" }),
      place({ place_name: "Ambient Place", feature_id: "1:2", user_notes: "Visited" }),
      place({ place_name: "Empty Note", feature_id: "1:3", user_notes: "   " }),
      place({ place_name: "Snack Truth", feature_id: "1:4", user_notes: "Butter" }),
    ];
    // Force a deliberate disagreement: pretend the classifier tagged the "Butter" place as Food.
    // validateAgainstFoodNotes should record this as a mismatch against the note-derived Snack label.
    const measured = classifyPlacesForMeasurement(places).map((entry) =>
      entry.feature_id === "1:4" ? { ...entry, category: "Food" as const } : entry,
    );

    const validation = validateAgainstFoodNotes(places, measured);

    expect(validation.labelledCount).toBe(2);
    expect(validation.correctCount).toBe(1);
    expect(validation.excludedCount).toBe(1);
    expect(validation.accuracy).toBe(0.5);
    expect(validation.mismatches).toEqual([
      expect.objectContaining({
        place_name: "Snack Truth",
        note: "Butter",
        expected: "Snack",
        actual: "Food",
      }),
    ]);
  });

  it("validateAgainstFoodNotes falls back to name lookup when feature_id is absent", () => {
    const noIdPlace: Place = {
      place_name: "Dim Sum House",
      primary_category: "Unsorted",
      detailed_category: "Unknown",
      star_rating: 0,
      review_count: 0,
      user_notes: "Dim sum",
      is_override: false,
    };

    const measured = classifyPlacesForMeasurement([noIdPlace]);
    const validation = validateAgainstFoodNotes([noIdPlace], measured);

    expect(validation).toMatchObject({
      labelledCount: 1,
      correctCount: 1,
      excludedCount: 0,
      accuracy: 1,
      mismatches: [],
    });
  });
});
