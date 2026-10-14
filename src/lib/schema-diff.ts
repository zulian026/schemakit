type DiffKind = "added" | "removed" | "changed";

export type SchemaDiffItem = {
  path: string;
  kind: DiffKind;
  before?: string;
  after?: string;
};

function getType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";

  return typeof value;
}

function describeType(value: unknown): string {
  const type = getType(value);

  if (type === "array") {
    const array = value as unknown[];

    if (array.length === 0) {
      return "array<unknown>";
    }

    const itemTypes = [...new Set(array.map((item) => describeType(item)))];

    return `array<${itemTypes.join(" | ")}>`;
  }

  return type;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function compareValues(
  before: unknown,
  after: unknown,
  path: string,
  result: SchemaDiffItem[],
): void {
  const beforeType = getType(before);
  const afterType = getType(after);

  if (beforeType !== afterType) {
    result.push({
      path,
      kind: "changed",
      before: describeType(before),
      after: describeType(after),
    });

    return;
  }

  if (isRecord(before) && isRecord(after)) {
    compareObjects(before, after, path, result);
    return;
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    if (before.length === 0 || after.length === 0) {
      if (before.length !== after.length) {
        result.push({
          path,
          kind: "changed",
          before: describeType(before),
          after: describeType(after),
        });
      }

      return;
    }

    compareValues(before[0], after[0], `${path}[]`, result);
  }
}

function compareObjects(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  parentPath: string,
  result: SchemaDiffItem[],
): void {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of keys) {
    const path = parentPath ? `${parentPath}.${key}` : key;
    const hasBefore = Object.prototype.hasOwnProperty.call(before, key);
    const hasAfter = Object.prototype.hasOwnProperty.call(after, key);

    if (!hasBefore) {
      result.push({
        path,
        kind: "added",
        after: describeType(after[key]),
      });

      continue;
    }

    if (!hasAfter) {
      result.push({
        path,
        kind: "removed",
        before: describeType(before[key]),
      });

      continue;
    }

    compareValues(before[key], after[key], path, result);
  }
}

export function compareJsonSchemas(
  beforeJson: string,
  afterJson: string,
): { items: SchemaDiffItem[]; error: string | null } {
  try {
    const before: unknown = JSON.parse(beforeJson);
    const after: unknown = JSON.parse(afterJson);

    if (!isRecord(before) || !isRecord(after)) {
      return {
        items: [],
        error: "Kedua input harus berupa JSON object.",
      };
    }

    const items: SchemaDiffItem[] = [];

    compareObjects(before, after, "", items);

    return {
      items,
      error: null,
    };
  } catch {
    return {
      items: [],
      error: "Pastikan kedua input merupakan JSON yang valid.",
    };
  }
}
