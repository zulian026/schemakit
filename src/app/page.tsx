"use client";

import { useState } from "react";
import { ArrowDownUp, Settings2, Sparkles } from "lucide-react";

import SchemaHeader from "@/components/schema/schema-header";
import SchemaEditor from "@/components/schema/schema-editor";
import SchemaOutput from "@/components/schema/schema-output";
import DataValidator from "@/components/schema/data-validator";
import MockDataGenerator from "@/components/schema/mock-data-generator";
import SchemaDiff from "@/components/schema/schema-diff";

import {
  generateFromJson,
  generateZodFromJson,
  generateJsonSchemaFromJson,
  generateSqlFromJson,
} from "@/lib/utils";

const initialJson = JSON.stringify(
  {
    id: 101,
    name: "Zyan",
    email: "zyan@example.com",
    isActive: true,
    profile: {
      city: "Padang",
    },
    roles: ["admin", "user"],
  },
  null,
  2,
);

const fieldClass =
  "mt-2 w-full rounded-lg border border-white/[0.09] bg-[#20211e] px-3 py-2.5 text-sm text-[#e5e2d9] outline-none transition-colors placeholder:text-[#66665e] focus:border-[#d6c5a5]/50";

export default function HomePage() {
  const [jsonInput, setJsonInput] = useState(initialJson);

  const [typeName, setTypeName] = useState("User");
  const [schemaName, setSchemaName] = useState("UserSchema");
  const [tableName, setTableName] = useState("users");
  const [primaryKey, setPrimaryKey] = useState("id");

  const result = generateFromJson(jsonInput, typeName);
  const zodResult = generateZodFromJson(jsonInput, schemaName);
  const jsonSchemaResult = generateJsonSchemaFromJson(jsonInput, typeName);
  const sqlResult = generateSqlFromJson(jsonInput, tableName, primaryKey);

  return (
    <main className="min-h-screen bg-[#20211e] text-[#f0eee8]">
      <SchemaHeader />

      <section className="mx-auto max-w-[1440px] px-6 py-14 md:px-10 md:py-20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 text-xs text-[#99998f]">
            <span>SchemaKit</span>
            <span className="text-[#55564f]">/</span>
            <span className="text-[#d6c5a5]">Playground</span>
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-[#d6c5a5]" />

                <span className="text-[11px] font-medium tracking-[0.18em] text-[#d6c5a5] uppercase">
                  Schema generator
                </span>
              </div>

              <h1 className="max-w-3xl text-4xl leading-tight font-medium tracking-tight md:text-5xl">
                From raw data to{" "}
                <span className="text-[#aaa99f]">reliable schemas.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#99998f]">
                Transform JSON into type definitions and validation schemas. One
                input, multiple outputs.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs text-[#99998f] lg:self-auto">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  result.error ? "bg-red-400" : "bg-[#a8c39a]"
                }`}
              />
              {result.error ? "Invalid JSON" : "JSON ready"}
            </div>
          </div>

          <section className="mt-5 rounded-xl border border-white/[0.09] bg-[#242520] p-5 md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Settings2 size={16} className="text-[#d6c5a5]" />
              <h2 className="text-sm font-medium text-[#e5e2d9]">
                Generator configuration
              </h2>
              <span className="text-[11px] text-[#77776e]">Live settings</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs text-[#aaa99f]">
                TypeScript type name
                <input
                  value={typeName}
                  onChange={(event) => setTypeName(event.target.value)}
                  placeholder="User"
                  className={fieldClass}
                />
              </label>

              <label className="text-xs text-[#aaa99f]">
                Zod schema name
                <input
                  value={schemaName}
                  onChange={(event) => setSchemaName(event.target.value)}
                  placeholder="UserSchema"
                  className={fieldClass}
                />
              </label>

              <label className="text-xs text-[#aaa99f]">
                PostgreSQL table name
                <input
                  value={tableName}
                  onChange={(event) => setTableName(event.target.value)}
                  placeholder="users"
                  className={fieldClass}
                />
              </label>

              <label className="text-xs text-[#aaa99f]">
                Primary key column
                <input
                  value={primaryKey}
                  onChange={(event) => setPrimaryKey(event.target.value)}
                  placeholder="id"
                  className={fieldClass}
                />
              </label>
            </div>

            <p className="mt-4 text-[11px] leading-5 text-[#77776e]">
              Changes are reflected automatically. The primary key must match an
              existing top-level JSON property after snake_case normalization.
            </p>
          </section>

          <div
            id="playground"
            className="grid grid-cols-1 gap-4 lg:grid-cols-2"
          >
            <SchemaEditor
              value={jsonInput}
              onChange={setJsonInput}
              error={result.error}
            />

            <SchemaOutput
              code={result.code}
              zodCode={zodResult.code}
              jsonSchemaCode={jsonSchemaResult.code}
              sqlCode={sqlResult.code}
              error={result.error ?? sqlResult.error}
            />
          </div>

          <DataValidator key={jsonInput} sampleJson={jsonInput} />

          <MockDataGenerator key={jsonInput} sampleJson={jsonInput} />

          <SchemaDiff sampleJson={jsonInput} />

          <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[#77776e]">
              JSON input <ArrowDownUp size={12} className="mx-1 inline" />{" "}
              Schema output
            </p>

            <p className="text-xs text-[#77776e]">
              SchemaKit · Developer toolkit
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
