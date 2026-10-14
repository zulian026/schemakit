import { faker } from "@faker-js/faker";

type MockOptions = {
  count: number;
};

function generateValue(value: unknown, key = ""): unknown {
  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey === "email" || normalizedKey.endsWith("email")) {
      return faker.internet.email();
    }

    if (
      normalizedKey === "name" ||
      normalizedKey === "fullname" ||
      normalizedKey === "full_name"
    ) {
      return faker.person.fullName();
    }

    if (normalizedKey === "firstname" || normalizedKey === "first_name") {
      return faker.person.firstName();
    }

    if (normalizedKey === "lastname" || normalizedKey === "last_name") {
      return faker.person.lastName();
    }

    if (normalizedKey === "city" || normalizedKey.endsWith("city")) {
      return faker.location.city();
    }

    if (normalizedKey === "country" || normalizedKey.endsWith("country")) {
      return faker.location.country();
    }

    if (
      normalizedKey === "phone" ||
      normalizedKey === "phonenumber" ||
      normalizedKey === "phone_number"
    ) {
      return faker.phone.number();
    }

    if (normalizedKey === "username" || normalizedKey === "user_name") {
      return faker.internet.username();
    }

    if (normalizedKey.endsWith("url") || normalizedKey === "website") {
      return faker.internet.url();
    }

    if (normalizedKey.includes("date")) {
      return faker.date.recent().toISOString();
    }

    if (normalizedKey.includes("description")) {
      return faker.lorem.sentence();
    }

    if (normalizedKey.includes("title")) {
      return faker.lorem.words(3);
    }

    return faker.lorem.word();
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return faker.number.int({
        min: Math.max(Number.MIN_SAFE_INTEGER, value - 100),
        max: Math.min(Number.MAX_SAFE_INTEGER, value + 100),
      });
    }

    return faker.number.float({
      min: Math.max(-1000, value - 100),
      max: Math.min(1000, value + 100),
      fractionDigits: 2,
    });
  }

  if (typeof value === "boolean") {
    return faker.datatype.boolean();
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [];
    }

    return Array.from({ length: value.length }, () => generateValue(value[0]));
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        generateValue(childValue, childKey),
      ]),
    );
  }

  return value;
}

export function generateMockData(
  sampleJson: string,
  options: MockOptions = { count: 5 },
): { code: string; error: string | null } {
  try {
    const sample: unknown = JSON.parse(sampleJson);

    if (
      typeof sample !== "object" ||
      sample === null ||
      Array.isArray(sample)
    ) {
      return {
        code: "",
        error: "JSON referensi harus berupa object.",
      };
    }

    if (
      !Number.isInteger(options.count) ||
      options.count < 1 ||
      options.count > 100
    ) {
      return {
        code: "",
        error: "Jumlah data harus berupa bilangan bulat antara 1 dan 100.",
      };
    }

    const records = Array.from({ length: options.count }, () =>
      generateValue(sample),
    );

    return {
      code: JSON.stringify(records, null, 2),
      error: null,
    };
  } catch {
    return {
      code: "",
      error: "JSON referensi tidak valid.",
    };
  }
}
