"use client";

import { useState } from "react";
import { Check, Code2, Copy, Download } from "lucide-react";

const formats = ["TypeScript", "Zod", "JSON Schema", "SQL"] as const;

type Format = (typeof formats)[number];

type SchemaOutputProps = {
  code: string;
  zodCode: string;
  jsonSchemaCode: string;
  sqlCode: string;
  error: string | null;
};

export default function SchemaOutput({
  code,
  zodCode,
  jsonSchemaCode,
  sqlCode,
  error,
}: SchemaOutputProps) {
  const [format, setFormat] = useState<Format>("TypeScript");
  const [copied, setCopied] = useState(false);

  const displayedCode =
    format === "TypeScript"
      ? code
      : format === "Zod"
        ? zodCode
        : format === "JSON Schema"
          ? jsonSchemaCode
          : sqlCode;

  const handleCopy = async () => {
    if (!displayedCode || error) return;

    try {
      await navigator.clipboard.writeText(displayedCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    if (!displayedCode || error) return;

    const extension =
      format === "JSON Schema"
        ? "schema.json"
        : format === "SQL"
          ? "schema.sql"
          : "schema.ts";

    const blob = new Blob([displayedCode], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = extension;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-[#242520]">
      <div className="flex h-12 items-center justify-between border-b border-white/[0.08] px-4">
        <div className="flex items-center gap-2">
          <Code2 size={15} className="text-[#d6c5a5]" />
          <span className="text-xs font-medium text-[#dedbd2]">
            Generated output
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!displayedCode || !!error}
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-[#aaa99f] transition-colors hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            type="button"
            disabled={!displayedCode || !!error}
            onClick={handleDownload}
            className="rounded-md p-1.5 text-[#aaa99f] transition-colors hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Download generated code"
            title="Download generated code"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-white/[0.08] px-3 py-2">
        {formats.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setFormat(item);
              setCopied(false);
            }}
            className={`shrink-0 rounded-md px-2.5 py-1.5 text-[11px] transition-colors ${
              format === item
                ? "bg-[#d6c5a5]/10 text-[#d6c5a5]"
                : "text-[#85857b] hover:bg-white/[0.04] hover:text-[#dedbd2]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="min-h-[360px] flex-1 overflow-auto p-4">
        {error ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <p className="max-w-xs text-center text-xs leading-6 text-red-400">
              {error}
            </p>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-[#c7c5bb]">
            <code>{displayedCode}</code>
          </pre>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-2.5">
        <span className="text-[11px] text-[#85857b]">{format} · Preview</span>

        <span
          className={`text-[11px] ${error ? "text-red-400" : "text-[#a8c39a]"}`}
        >
          {error ? "Invalid input" : "Generated"}
        </span>
      </div>
    </section>
  );
}
