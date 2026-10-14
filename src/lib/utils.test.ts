import { describe, expect, it } from "vitest";

import {
  generateFromJson,
  generateZodFromJson,
  generateJsonSchemaFromJson,
  generateSqlFromJson,
} from "./utils";

describe("SchemaKit generators", () => {
  const input = JSON.stringify({
    id: 101,
    name: "Zyan",
    isActive: true,
    roles: ["admin", "user"],
  });

  it("generates TypeScript interfaces", () => {
    const result = generateFromJson(input, "User");

    expect(result.error).toBeNull();
    expect(result.code).toContain("export interface User");
    expect(result.code).toContain("id: number;");
    expect(result.code).toContain("roles: string[];");
  });

  it("generates Zod schemas", () => {
    const result = generateZodFromJson(input, "UserSchema");

    expect(result.error).toBeNull();
    expect(result.code).toContain('import { z } from "zod";');
    expect(result.code).toContain("z.number().int()");
    expect(result.code).toContain("z.array(z.string())");
  });

  it("generates JSON Schema", () => {
    const result = generateJsonSchemaFromJson(input, "User");

    expect(result.error).toBeNull();

    const schema = JSON.parse(result.code);

    expect(schema.title).toBe("User");
    expect(schema.type).toBe("object");
    expect(schema.properties.id.type).toBe("integer");
    expect(schema.required).toContain("name");
  });

  it("generates PostgreSQL SQL", () => {
    const result = generateSqlFromJson(input, "users", "id");

    expect(result.error).toBeNull();
    expect(result.code).toContain('CREATE TABLE "users"');
    expect(result.code).toContain('"id" INTEGER PRIMARY KEY');
    expect(result.code).toContain('"is_active" BOOLEAN NOT NULL');
  });

  it("reports invalid JSON", () => {
    const result = generateFromJson('{"id": }', "User");

    expect(result.error).not.toBeNull();
    expect(result.code).toBe("");
  });

  it("normalizes invalid TypeScript names", () => {
    const result = generateFromJson(input, "user profile");

    expect(result.code).toContain("export interface UserProfile");
  });

  it("maps large safe integers to BIGINT", () => {
    const result = generateSqlFromJson(
      JSON.stringify({ id: 3000000000 }),
      "users",
      "id",
    );

    expect(result.error).toBeNull();
    expect(result.code).toContain('"id" BIGINT PRIMARY KEY');
  });

  it("rejects duplicate normalized SQL column names", () => {
    const result = generateSqlFromJson(
      JSON.stringify({
        isActive: true,
        is_active: false,
      }),
      "users",
      "",
    );

    expect(result.error).not.toBeNull();
    expect(result.error).toContain("Duplicate SQL column names detected");
    expect(result.code).toBe("");
  });

  it("rejects a primary key that does not exist", () => {
    const result = generateSqlFromJson(
      JSON.stringify({
        id: 101,
        name: "Zyan",
      }),
      "users",
      "user_id",
    );

    expect(result.error).not.toBeNull();
    expect(result.error).toContain("Primary key");
    expect(result.code).toBe("");
  });

  it("handles unusual JSON property names in TypeScript", () => {
    const result = generateFromJson(
      JSON.stringify({
        "user-name": "Zyan",
        "first name": "Alex",
        "123code": "ABC",
      }),
      "User",
    );

    expect(result.error).toBeNull();
    expect(result.code).toContain('"user-name": string;');
    expect(result.code).toContain('"first name": string;');
    expect(result.code).toContain('"123code": string;');
  });

  it("handles unusual JSON property names in Zod", () => {
    const result = generateZodFromJson(
      JSON.stringify({
        "user-name": "Zyan",
        "first name": "Alex",
      }),
      "UserSchema",
    );

    expect(result.error).toBeNull();
    expect(result.code).toContain('"user-name": z.string()');
    expect(result.code).toContain('"first name": z.string()');
  });
});
