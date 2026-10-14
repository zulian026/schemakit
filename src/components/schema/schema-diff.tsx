"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  ArrowLeftRight,
  CheckCircle2,
  FileDiff,
  Plus,
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";

import { compareJsonSchemas, type SchemaDiffItem } from "@/lib/schema-diff";

type SchemaDiffProps = {
  sampleJson: string;
};

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 12,
  lineNumbers: "on" as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  padding: { top: 12, bottom: 12 },
  wordWrap: "on" as const,
};

const statusConfig = {
  added: {
    label: "Added",
    color: "text-[#a8c39a]",
    background: "bg-[#a8c39a]/10",
    icon: Plus,
  },
  removed: {
    label: "Removed",
    color: "text-red-400",
    background: "bg-red-400/10",
    icon: Trash2,
  },
  changed: {
    label: "Changed",
    color: "text-[#d6c5a5]",
    background: "bg-[#d6c5a5]/10",
    icon: ArrowLeftRight,
  },
};

function DiffItem({ item }: { item: SchemaDiffItem }) {
  const config = statusConfig[item.kind];
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-3 border-t border-white/[0.06] py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${config.background} ${config.color}`}
        >
          <Icon size={14} />
        </div>

        <div className="min-w-0">
          <p className="break-all font-mono text-xs text-[#e5e2d9]">
            {item.path}
          </p>

          <p className="mt-1 text-[11px] text-[#77776e]">
            {item.before !== undefined ? item.before : "—"}
            {" → "}
            {item.after !== undefined ? item.after : "—"}
          </p>
        </div>
      </div>

      <span
        className={`self-start rounded-md px-2 py-1 text-[10px] ${config.background} ${config.color}`}
      >
        {config.label}
      </span>
    </div>
  );
}

export default function SchemaDiff({ sampleJson }: SchemaDiffProps) {
  const [beforeJson, setBeforeJson] = useState(sampleJson);
  const [afterJson, setAfterJson] = useState(sampleJson);
  const [hasCompared, setHasCompared] = useState(false);

  const result = hasCompared ? compareJsonSchemas(beforeJson, afterJson) : null;

  function handleReset() {
    setBeforeJson(sampleJson);
    setAfterJson(sampleJson);
    setHasCompared(false);
  }

  function handleCompare() {
    setHasCompared(true);
  }

  const addedCount =
    result?.items.filter((item) => item.kind === "added").length ?? 0;

  const removedCount =
    result?.items.filter((item) => item.kind === "removed").length ?? 0;

  const changedCount =
    result?.items.filter((item) => item.kind === "changed").length ?? 0;

  return (
    <section
      id="schema-diff"
      className="rounded-xl border border-white/[0.09] bg-[#242520] p-5 md:p-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <FileDiff size={16} className="text-[#d6c5a5]" />

            <h2 className="text-sm font-medium text-[#e5e2d9]">Schema Diff</h2>
          </div>

          <p className="mt-2 max-w-xl text-xs leading-6 text-[#99998f]">
            Compare two JSON structures to identify added, removed, and changed
            properties.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/[0.09] px-3 py-2 text-xs text-[#aaa99f] transition-colors hover:bg-white/[0.04] hover:text-[#f0eee8]"
        >
          <RefreshCw size={13} />
          Reset
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-white/[0.09]">
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#20211e] px-4 py-3">
            <span className="text-xs text-[#aaa99f]">Original schema</span>

            <span className="text-[10px] text-[#77776e]">BEFORE</span>
          </div>

          <Editor
            height="300px"
            language="json"
            theme="vs-dark"
            value={beforeJson}
            onChange={(value) => {
              setBeforeJson(value ?? "");
              setHasCompared(false);
            }}
            options={editorOptions}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-white/[0.09]">
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#20211e] px-4 py-3">
            <span className="text-xs text-[#aaa99f]">Updated schema</span>

            <span className="text-[10px] text-[#77776e]">AFTER</span>
          </div>

          <Editor
            height="300px"
            language="json"
            theme="vs-dark"
            value={afterJson}
            onChange={(value) => {
              setAfterJson(value ?? "");
              setHasCompared(false);
            }}
            options={editorOptions}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={handleCompare}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d6c5a5] px-4 py-2.5 text-xs font-medium text-[#20211e] transition-colors hover:bg-[#e4d5b9]"
        >
          <ArrowLeftRight size={14} />
          Compare schemas
        </button>

        <p className="text-[11px] text-[#77776e]">
          Compares structure and data types, not actual values.
        </p>
      </div>

      {result && (
        <div className="mt-5 rounded-lg border border-white/[0.08] bg-[#20211e] p-4 md:p-5">
          {result.error ? (
            <div
              role="alert"
              className="flex items-start gap-2 text-xs leading-5 text-red-300"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {result.error}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-[#e5e2d9]">
                    Comparison results
                  </h3>

                  <p className="mt-1 text-xs text-[#77776e]">
                    {result.items.length === 0
                      ? "Both structures match."
                      : `${result.items.length} difference(s) detected.`}
                  </p>
                </div>

                {result.items.length === 0 && (
                  <CheckCircle2 size={18} className="text-[#a8c39a]" />
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-white/[0.06] p-3">
                  <p className="text-[10px] text-[#77776e]">Added</p>
                  <p className="mt-1 text-lg font-medium text-[#a8c39a]">
                    {addedCount}
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.06] p-3">
                  <p className="text-[10px] text-[#77776e]">Removed</p>
                  <p className="mt-1 text-lg font-medium text-red-400">
                    {removedCount}
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.06] p-3">
                  <p className="text-[10px] text-[#77776e]">Changed</p>
                  <p className="mt-1 text-lg font-medium text-[#d6c5a5]">
                    {changedCount}
                  </p>
                </div>
              </div>

              {result.items.length > 0 && (
                <div className="mt-4">
                  {result.items.map((item, index) => (
                    <DiffItem
                      key={`${item.path}-${item.kind}-${index}`}
                      item={item}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <p className="mt-3 text-[11px] leading-5 text-[#77776e]">
        Comparison runs locally in your browser. Changes to the editors require
        a new comparison.
      </p>
    </section>
  );
}
