"use client";

import Editor from "@monaco-editor/react";
import { FileJson, RotateCcw } from "lucide-react";

type SchemaEditorProps = {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
};

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

export default function SchemaEditor({
  value,
  onChange,
  error,
}: SchemaEditorProps) {
  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-[#242520]">
      <div className="flex h-12 items-center justify-between border-b border-white/[0.08] px-4">
        <div className="flex items-center gap-2">
          <FileJson size={15} className="text-[#d6c5a5]" />
          <span className="text-xs font-medium text-[#dedbd2]">Input JSON</span>
          <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-[#85857b]">
            JSON
          </span>
        </div>

        <button
          type="button"
          onClick={() => onChange(initialJson)}
          className="flex items-center gap-1.5 text-xs text-[#85857b] transition-colors hover:text-[#e8e5dc]"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <div className="h-[360px] py-3">
        <Editor
          height="100%"
          language="json"
          theme="vs-dark"
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "var(--font-geist-mono), monospace",
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            padding: { top: 8, bottom: 8 },
            automaticLayout: true,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>

      <div className="flex min-h-10 items-center justify-between gap-3 border-t border-white/[0.08] px-4 py-2.5">
        {error ? (
          <span className="text-[11px] text-red-400">{error}</span>
        ) : (
          <span className="text-[11px] text-[#85857b]">
            Valid JSON structure
          </span>
        )}

        <span className="shrink-0 text-[11px] text-[#85857b]">UTF-8</span>
      </div>
    </section>
  );
}
