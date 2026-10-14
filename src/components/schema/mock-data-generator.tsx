"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  Check,
  Clipboard,
  Download,
  FileJson,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { generateMockData } from "@/lib/mock-data";

type MockDataGeneratorProps = {
  sampleJson: string;
};

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: "on" as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  padding: { top: 16, bottom: 16 },
  wordWrap: "on" as const,
  readOnly: true,
};

export default function MockDataGenerator({
  sampleJson,
}: MockDataGeneratorProps) {
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    const result = generateMockData(sampleJson, { count });

    setOutput(result.code);
    setError(result.error);
    setCopied(false);
  }

  async function handleCopy() {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setError("Tidak dapat menyalin otomatis. Coba gunakan fitur download.");
    }
  }

  function handleDownload() {
    if (!output) return;

    const blob = new Blob([output], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mock-data.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <section
      id="mock-data"
      className="rounded-xl border border-white/[0.09] bg-[#242520] p-5 md:p-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-[#d6c5a5]" />

            <h2 className="text-sm font-medium text-[#e5e2d9]">
              Mock Data Generator
            </h2>
          </div>

          <p className="mt-2 max-w-xl text-xs leading-6 text-[#99998f]">
            Generate realistic dummy records using the structure of your main
            JSON input.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-lg border border-white/[0.08] px-3 py-2">
          <FileJson size={14} className="text-[#d6c5a5]" />
          <span className="text-xs text-[#aaa99f]">JSON output</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="block w-full text-xs text-[#aaa99f] sm:max-w-xs">
          Number of records
          <select
            value={count}
            onChange={(event) => {
              setCount(Number(event.target.value));
              setCopied(false);
            }}
            className="mt-2 w-full rounded-lg border border-white/[0.09] bg-[#20211e] px-3 py-2.5 text-sm text-[#e5e2d9] outline-none focus:border-[#d6c5a5]/50"
          >
            {[1, 5, 10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value} records
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d6c5a5] px-4 py-2.5 text-xs font-medium text-[#20211e] transition-colors hover:bg-[#e4d5b9]"
        >
          <RefreshCw size={13} />
          Generate data
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-400/20 bg-red-400/[0.05] p-3 text-xs leading-5 text-red-300"
        >
          {error}
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-lg border border-white/[0.09]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#20211e] px-4 py-3">
          <span className="text-xs text-[#aaa99f]">Generated records</span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-[#aaa99f] transition-colors hover:bg-white/[0.05] hover:text-[#f0eee8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? <Check size={13} /> : <Clipboard size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!output}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-[#aaa99f] transition-colors hover:bg-white/[0.05] hover:text-[#f0eee8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={13} />
              Download
            </button>
          </div>
        </div>

        {output ? (
          <Editor
            height="360px"
            language="json"
            theme="vs-dark"
            value={output}
            options={editorOptions}
          />
        ) : (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <FileJson size={18} className="text-[#77776e]" />
            </div>

            <p className="mt-4 text-sm text-[#aaa99f]">No generated data yet</p>

            <p className="mt-2 max-w-xs text-xs leading-5 text-[#77776e]">
              Choose a record count and click Generate data to create your first
              dataset.
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] leading-5 text-[#77776e]">
        Data is generated locally in your browser. The main JSON input is used
        as the structural reference.
      </p>
    </section>
  );
}
