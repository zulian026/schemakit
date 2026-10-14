import { describe, expect, it } from "vitest";

import { validateJsonData } from "./validator";

describe("JSON data validator", () => {
  const sample = JSON.stringify({
    id: 101,
    name: "Zyan",
    isActive: true,
  });

  it("accepts valid data", () => {
    const result = validateJsonData(
      sample,
      JSON.stringify({
        id: 102,
        name: "Alex",
        isActive: false,
      }),
    );

    expect(result.success).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects incorrect data types", () => {
    const result = validateJsonData(
      sample,
      JSON.stringify({
        id: "102",
        name: "Alex",
        isActive: true,
      }),
    );

    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.path === "id")).toBe(true);
  });

  it("rejects missing properties", () => {
    const result = validateJsonData(
      sample,
      JSON.stringify({
        id: 102,
        name: "Alex",
      }),
    );

    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.path === "isActive")).toBe(true);
  });

  it("rejects additional properties", () => {
    const result = validateJsonData(
      sample,
      JSON.stringify({
        id: 102,
        name: "Alex",
        isActive: true,
        extra: "unexpected",
      }),
    );

    expect(result.success).toBe(false);
  });

  it("reports invalid JSON", () => {
    const result = validateJsonData(sample, '{"id": }');

    expect(result.success).toBe(false);
    expect(result.issues).toHaveLength(1);
  });

  it("validates nested object properties", () => {
    const sample = JSON.stringify({
      profile: {
        city: "Padang",
        age: 21,
      },
    });

    const result = validateJsonData(
      sample,
      JSON.stringify({
        profile: {
          city: "Jakarta",
          age: "21",
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.path === "profile.age")).toBe(
      true,
    );
  });

  it("rejects null when the reference expects a string", () => {
    const result = validateJsonData(
      JSON.stringify({ name: "Zyan" }),
      JSON.stringify({ name: null }),
    );

    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.path === "name")).toBe(true);
  });

  it("validates array element types", () => {
    const result = validateJsonData(
      JSON.stringify({ roles: ["admin", "user"] }),
      JSON.stringify({ roles: ["admin", 123] }),
    );

    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.path === "roles.1")).toBe(true);
  });

  it("accepts an empty array when the reference array is empty", () => {
    const result = validateJsonData(
      JSON.stringify({ tags: [] }),
      JSON.stringify({ tags: [] }),
    );

    expect(result.success).toBe(true);
  });

  it("supports mixed-type arrays", () => {
    const result = validateJsonData(
      JSON.stringify({ values: [1, "hello"] }),
      JSON.stringify({ values: [2, "world", 3] }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects unsupported types in mixed arrays", () => {
    const result = validateJsonData(
      JSON.stringify({ values: [1, "hello"] }),
      JSON.stringify({ values: [2, true] }),
    );

    expect(result.success).toBe(false);
    expect(result.issues.some((issue) => issue.path === "values.1")).toBe(true);
  });
});
