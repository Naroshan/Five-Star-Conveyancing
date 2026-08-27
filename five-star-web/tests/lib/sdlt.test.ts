import { describe, expect, it } from "vitest";
import { calculateSdlt } from "@/lib/sdlt";

describe("calculateSdlt", () => {
  it("charges nothing below the England nil-rate threshold", () => {
    expect(calculateSdlt(120_000, "england", "standard").total).toBe(0);
  });

  it("calculates standard England SDLT using marginal bands", () => {
    // 0% to 125k, 2% on next 125k (125k-250k), 5% on next 100k (250k-350k)
    // = 0 + 2500 + 5000 = 7500
    const result = calculateSdlt(350_000, "england", "standard");
    expect(result.total).toBe(7_500);
  });

  it("applies first-time buyer relief up to 500,000", () => {
    // 0% to 300k, 5% on remaining 50k (300k-350k) = 2500
    const result = calculateSdlt(350_000, "england", "first_time_buyer");
    expect(result.total).toBe(2_500);
  });

  it("falls back to standard rates for first-time buyers above 500,000", () => {
    const ftb = calculateSdlt(600_000, "england", "first_time_buyer");
    const standard = calculateSdlt(600_000, "england", "standard");
    expect(ftb.total).toBe(standard.total);
  });

  it("adds the additional-property surcharge in England", () => {
    // 5% to 125k, 7% on next 125k (125k-250k), 10% on next 100k (250k-350k)
    // = 6250 + 8750 + 10000 = 25000
    const result = calculateSdlt(350_000, "england", "additional_property");
    expect(result.total).toBe(25_000);
  });

  it("charges nothing below the Wales nil-rate threshold", () => {
    expect(calculateSdlt(200_000, "wales", "standard").total).toBe(0);
  });

  it("calculates standard Wales LTT using marginal bands", () => {
    // 0% to 225k, 6% on remaining 75k (225k-300k) = 4500
    const result = calculateSdlt(300_000, "wales", "standard");
    expect(result.total).toBe(4_500);
  });

  it("has no first-time buyer relief in Wales", () => {
    const standard = calculateSdlt(300_000, "wales", "standard");
    const ftb = calculateSdlt(300_000, "wales", "first_time_buyer");
    expect(ftb.total).toBe(standard.total);
  });

  it("uses separate higher-rate bands for additional property in Wales", () => {
    // 5% to 180k, 8.5% on remaining 20k (180k-200k) = 9000 + 1700 = 10700
    const result = calculateSdlt(200_000, "wales", "additional_property");
    expect(result.total).toBe(10_700);
  });

  it("returns zero for a non-positive price", () => {
    expect(calculateSdlt(0, "england", "standard").total).toBe(0);
    expect(calculateSdlt(-5, "england", "standard").total).toBe(0);
  });
});
