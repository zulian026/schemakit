import { z } from "zod";

type ValidationIssue = {
  path: string;
  message: string;
};

type ValidationResult = {
  success: boolean;
  issues: ValidationIssue[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function inferValidatorSchema(value: unknown): z.ZodType {
  if (value === null) {
    return z.null();
  }

  if (typeof value === "string") {
    return z.string();
  }

  if (typeof value === "boolean") {
    return z.boolean();
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? z.number().int() : z.number();
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return z.array(z.unknown());
    }

    const uniqueSchemas = value.map((item) => inferValidatorSchema(item));

    return z.array(
      uniqueSchemas.length === 1
        ? uniqueSchemas[0]
        : z.union(uniqueSchemas as [z.ZodType, z.ZodType, ...z.ZodType[]]),
    );
  }

  if (isRecord(value)) {
    const shape: Record<string, z.ZodType> = {};

    for (const [key, fieldValue] of Object.entries(value)) {
      shape[key] = inferValidatorSchema(fieldValue);
    }

    return z.object(shape).strict();
  }

  return z.unknown();
}

export function validateJsonData(
  sampleJson: string,
  inputJson: string,
): ValidationResult {
  try {
    const sample = JSON.parse(sampleJson);
    const input = JSON.parse(inputJson);

    const schema = inferValidatorSchema(sample);
    const result = schema.safeParse(input);

    if (result.success) {
      return {
        success: true,
        issues: [],
      };
    }

    return {
      success: false,
      issues: result.error.issues.map((issue) => ({
        path: issue.path.map(String).join(".") || "(root)",
        message: issue.message,
      })),
    };
  } catch (error) {
    return {
      success: false,
      issues: [
        {
          path: "(input)",
          message: error instanceof Error ? error.message : "JSON tidak valid.",
        },
      ],
    };
  }
}
