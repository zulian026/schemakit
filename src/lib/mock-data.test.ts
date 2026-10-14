import { describe, expect, it } from "vitest";

import { generateMockData } from "./mock-data";

describe("Mock data generator", () => {
  const sample = JSON.stringify({
    id: 101,
    name: "Zyan",
    email: "zyan@example.com",
    isActive: true,
    profile: {
      city: "Padang",
    },
  });

  it("generates the requested number of records", () => {
    const result = generateMockData(sample, { count: 5 });

    expect(result.error).toBeNull();

    const records = JSON.parse(result.code);

    expect(records).toHaveLength(5);
  });

  it("preserves the sample structure", () => {
    const result = generateMockData(sample, { count: 1 });
    const [record] = JSON.parse(result.code);

    expect(Object.keys(record)).toEqual([
      "id",
      "name",
      "email",
      "isActive",
      "profile",
    ]);

    expect(typeof record.id).toBe("number");
    expect(typeof record.name).toBe("string");
    expect(typeof record.isActive).toBe("boolean");
    expect(typeof record.profile.city).toBe("string");
  });

  it("rejects invalid JSON", () => {
    const result = generateMockData('{"id": }', { count: 2 });

    expect(result.error).not.toBeNull();
    expect(result.code).toBe("");
  });

  it("rejects invalid record counts", () => {
    const result = generateMockData(sample, { count: 0 });

    expect(result.error).not.toBeNull();
  });

  it("rejects array as the root reference", () => {
    const result = generateMockData("[1, 2, 3]", { count: 2 });

    expect(result.error).not.toBeNull();
  });
});
