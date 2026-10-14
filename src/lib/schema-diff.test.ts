import { describe, expect, it } from "vitest";

import { compareJsonSchemas } from "./schema-diff";

describe("Schema diff", () => {
  it("detects added properties", () => {
    const result = compareJsonSchemas(
      '{"id":101}',
      '{"id":101,"email":"test@example.com"}',
    );

    expect(result.error).toBeNull();
    expect(result.items).toContainEqual({
      path: "email",
      kind: "added",
      after: "string",
    });
  });

  it("detects removed properties", () => {
    const result = compareJsonSchemas('{"id":101,"name":"Zyan"}', '{"id":101}');

    expect(result.items).toContainEqual({
      path: "name",
      kind: "removed",
      before: "string",
    });
  });

  it("detects type changes", () => {
    const result = compareJsonSchemas('{"id":101}', '{"id":"101"}');

    expect(result.items).toContainEqual({
      path: "id",
      kind: "changed",
      before: "number",
      after: "string",
    });
  });

  it("detects nested changes", () => {
    const result = compareJsonSchemas(
      '{"profile":{"age":21}}',
      '{"profile":{"age":"21"}}',
    );

    expect(result.items).toContainEqual({
      path: "profile.age",
      kind: "changed",
      before: "number",
      after: "string",
    });
  });

  it("ignores changes to sample values with the same type", () => {
    const result = compareJsonSchemas('{"name":"Zyan"}', '{"name":"Alex"}');

    expect(result.error).toBeNull();
    expect(result.items).toHaveLength(0);
  });

  it("rejects invalid JSON", () => {
    const result = compareJsonSchemas('{"id":101}', '{"id":}');

    expect(result.error).not.toBeNull();
    expect(result.items).toHaveLength(0);
  });
});
