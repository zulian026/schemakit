type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function normalizeTypeName(value: string, fallback: string): string {
  const normalized = value
    .trim()
    .replace(/[^A-Za-z0-9_$]+(.)?/g, (_, next: string | undefined) =>
      next ? next.toUpperCase() : "",
    )
    .replace(/^[a-z]/, (character) => character.toUpperCase());

  if (!normalized) return fallback;

  return /^[A-Za-z_$]/.test(normalized) ? normalized : `Type${normalized}`;
}

type JsonObject = { [key: string]: JsonValue };

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidIdentifier(key: string): boolean {
  return /^[$A-Z_a-z][$\w]*$/.test(key);
}

function formatPropertyName(key: string): string {
  return isValidIdentifier(key) ? key : JSON.stringify(key);
}

function inferType(value: JsonValue, depth = 0): string {
  if (value === null) return "null";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";

  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";

    const types = [...new Set(value.map((item) => inferType(item, depth)))];
    const itemType = types
      .map((type) => (type.includes(" | ") ? `(${type})` : type))
      .join(" | ");

    return `${itemType}[]`;
  }

  if (isObject(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) return "Record<string, never>";

    const indent = "  ".repeat(depth + 1);
    const closingIndent = "  ".repeat(depth);

    const properties = entries.map(
      ([key, propertyValue]) =>
        `${indent}${formatPropertyName(key)}: ${inferType(
          propertyValue,
          depth + 1,
        )};`,
    );

    return `{\n${properties.join("\n")}\n${closingIndent}}`;
  }

  return "unknown";
}

export function generateTypeScript(
  value: JsonValue,
  typeName = "Root",
): string {
  const safeTypeName = normalizeTypeName(typeName, "Root");

  if (isObject(value)) {
    const properties = Object.entries(value).map(
      ([key, propertyValue]) =>
        `  ${formatPropertyName(key)}: ${inferType(propertyValue, 1)};`,
    );

    return `export interface ${safeTypeName} {\n${properties.join("\n")}\n}`;
  }

  return `export type ${safeTypeName} = ${inferType(value)};`;
}

export function generateFromJson(
  source: string,
  typeName = "Root",
): { code: string; error: string | null } {
  try {
    const parsed: JsonValue = JSON.parse(source);

    return {
      code: generateTypeScript(parsed, typeName),
      error: null,
    };
  } catch {
    return {
      code: "",
      error: "Invalid JSON. Check commas, quotes, brackets, and braces.",
    };
  }
}

function inferZodType(value: JsonValue, key?: string): string {
  if (value === null) {
    return "z.null()";
  }

  if (typeof value === "string") {
    if (key?.toLowerCase() === "email") {
      return "z.string().email()";
    }

    return "z.string()";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? "z.number().int()" : "z.number()";
  }

  if (typeof value === "boolean") {
    return "z.boolean()";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "z.array(z.unknown())";
    }

    const uniqueTypes = [...new Set(value.map((item) => inferZodType(item)))];

    const itemSchema =
      uniqueTypes.length === 1
        ? uniqueTypes[0]
        : `z.union([${uniqueTypes.join(", ")}])`;

    return `z.array(${itemSchema})`;
  }

  if (isObject(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return "z.object({})";
    }

    const properties = entries.map(([property, propertyValue]) => {
      return `  ${formatPropertyName(property)}: ${inferZodType(
        propertyValue,
        property,
      )},`;
    });

    return `z.object({\n${properties.join("\n")}\n})`;
  }

  return "z.unknown()";
}

export function generateZodSchema(
  value: JsonValue,
  schemaName = "UserSchema",
): string {
  const safeName = normalizeTypeName(schemaName, "UserSchema");

  return [
    'import { z } from "zod";',
    "",
    `export const ${safeName} = ${inferZodType(value)};`,
    "",
    `export type ${safeName.replace(/Schema$/, "")} = z.infer<typeof ${safeName}>;`,
  ].join("\n");
}

export function generateZodFromJson(
  source: string,
  schemaName = "UserSchema",
): { code: string; error: string | null } {
  try {
    const parsed: JsonValue = JSON.parse(source);

    return {
      code: generateZodSchema(parsed, schemaName),
      error: null,
    };
  } catch {
    return {
      code: "",
      error: "Invalid JSON. Check commas, quotes, brackets, and braces.",
    };
  }
}

type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: JsonValue[];
  additionalProperties?: boolean;
};

function inferJsonSchema(value: JsonValue): JsonSchema {
  if (value === null) {
    return { type: "null" };
  }

  if (typeof value === "string") {
    return { type: "string" };
  }

  if (typeof value === "boolean") {
    return { type: "boolean" };
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return {
        type: "array",
        items: {},
      };
    }

    const itemSchemas = value.map(inferJsonSchema);
    const uniqueSchemas = new Map<string, JsonSchema>();

    for (const schema of itemSchemas) {
      uniqueSchemas.set(JSON.stringify(schema), schema);
    }

    const schemas = [...uniqueSchemas.values()];

    return {
      type: "array",
      items:
        schemas.length === 1 ? schemas[0] : ({ anyOf: schemas } as JsonSchema),
    };
  }

  if (isObject(value)) {
    const entries = Object.entries(value);

    return {
      type: "object",
      properties: Object.fromEntries(
        entries.map(([key, propertyValue]) => [
          key,
          inferJsonSchema(propertyValue),
        ]),
      ),
      required: entries.map(([key]) => key),
      additionalProperties: false,
    };
  }

  return {};
}

export function generateJsonSchema(value: JsonValue, title = "Root"): string {
  const schema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title,
    ...inferJsonSchema(value),
  };

  return JSON.stringify(schema, null, 2);
}

export function generateJsonSchemaFromJson(
  source: string,
  title = "Root",
): { code: string; error: string | null } {
  try {
    const parsed: JsonValue = JSON.parse(source);

    return {
      code: generateJsonSchema(parsed, title),
      error: null,
    };
  } catch {
    return {
      code: "",
      error: "Invalid JSON. Check commas, quotes, brackets, and braces.",
    };
  }
}

type SqlColumn = {
  name: string;
  type: string;
  nullable: boolean;
};

function toSnakeCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

function quoteSqlIdentifier(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function inferSqlType(value: JsonValue): string {
  if (value === null) return "TEXT";
  if (typeof value === "string") return "TEXT";
  if (typeof value === "boolean") return "BOOLEAN";

  if (typeof value === "number") {
    if (!Number.isInteger(value)) {
      return "DOUBLE PRECISION";
    }

    if (value >= -2147483648 && value <= 2147483647) {
      return "INTEGER";
    }

    if (Number.isSafeInteger(value)) {
      return "BIGINT";
    }

    return "NUMERIC";
  }

  if (Array.isArray(value) || isObject(value)) {
    return "JSONB";
  }

  return "TEXT";
}

function findDuplicateSqlColumns(value: JsonObject): string[] {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];

  for (const key of Object.keys(value)) {
    const normalized = toSnakeCase(key);

    const existing = seen.get(normalized);

    if (existing !== undefined) {
      duplicates.push(
        `"${existing}" dan "${key}" sama-sama menjadi "${normalized}"`,
      );
    } else {
      seen.set(normalized, key);
    }
  }

  return duplicates;
}

function inferSqlColumns(value: JsonObject): SqlColumn[] {
  return Object.entries(value).map(([name, fieldValue]) => ({
    name: toSnakeCase(name),
    type: inferSqlType(fieldValue),
    nullable: fieldValue === null,
  }));
}

export function generatePostgresSql(
  value: JsonValue,
  tableName = "users",
  primaryKey = "id",
): string {
  const safeTableName = toSnakeCase(tableName.trim() || "users");

  if (!isObject(value)) {
    throw new Error("SQL generation requires a JSON object at the root.");
  }

  const columns = inferSqlColumns(value);

  if (columns.length === 0) {
    throw new Error("Cannot generate a table from an empty object.");
  }

  const normalizedPrimaryKey = primaryKey.trim()
    ? toSnakeCase(primaryKey.trim())
    : "";

  const primaryKeyExists =
    normalizedPrimaryKey !== "" &&
    columns.some((column) => column.name === normalizedPrimaryKey);

  const definitions = columns.map((column) => {
    const isPrimaryKey =
      primaryKeyExists && column.name === normalizedPrimaryKey;

    if (primaryKey.trim() && !primaryKeyExists) {
      throw new Error(
        `Primary key "${primaryKey}" tidak ditemukan pada properti JSON setelah normalisasi nama kolom.`,
      );
    }

    const constraints = isPrimaryKey
      ? " PRIMARY KEY"
      : column.nullable
        ? ""
        : " NOT NULL";

    return `  ${quoteSqlIdentifier(column.name)} ${column.type}${constraints}`;
  });

  const duplicates = findDuplicateSqlColumns(value);

  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate SQL column names detected: ${duplicates.join("; ")}`,
    );
  }

  return [
    `CREATE TABLE ${quoteSqlIdentifier(safeTableName)} (`,
    definitions.join(",\n"),
    ");",
  ].join("\n");
}

export function generateSqlFromJson(
  source: string,
  tableName = "users",
  primaryKey = "id",
): { code: string; error: string | null } {
  try {
    const parsed: JsonValue = JSON.parse(source);
    const code = generatePostgresSql(parsed, tableName, primaryKey);

    return { code, error: null };
  } catch (error) {
    return {
      code: "",
      error:
        error instanceof Error
          ? error.message
          : "Unable to generate PostgreSQL SQL.",
    };
  }
}
