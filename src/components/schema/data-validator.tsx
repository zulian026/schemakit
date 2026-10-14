"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { AlertCircle, CheckCircle2, Play, RotateCcw } from "lucide-react";

import { validateJsonData } from "@/lib/validator";

type DataValidatorProps = {
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
};

export default function DataValidator({ sampleJson }: DataValidatorProps) {
  const [inputJson, setInputJson] = useState(sampleJson);
  const [hasValidated, setHasValidated] = useState(false);

  const result = hasValidated ? validateJsonData(sampleJson, inputJson) : null;

  function handleReset() {
    setInputJson(sampleJson);
    setHasValidated(false);
  }


  return (
    <section
      id="validator"
      className="rounded-xl border border-white/[0.09] bg-[#242520] p-5 md:p-6"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <Play size={15} className="text-[#d6c5a5]" />

            <h2 className="text-sm font-medium text-[#e5e2d9]">
              JSON Data Validator
            </h2>
          </div>

          <p className="mt-2 max-w-xl text-xs leading-6 text-[#99998f]">
            Test whether your JSON data matches the structure and data types
            inferred from the example in the main editor.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/[0.09] px-3 py-2 text-xs text-[#aaa99f] transition-colors hover:bg-white/[0.04] hover:text-[#f0eee8]"
        >
          <RotateCcw size={13} />
          Reset input
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-white/[0.09]">
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#20211e] px-4 py-3">
          <span className="text-xs text-[#aaa99f]">Input data</span>

          <span className="font-mono text-[10px] text-[#77776e]">JSON</span>
        </div>

        <Editor
          height="280px"
          language="json"
          theme="vs-dark"
          value={inputJson}
          onChange={(value) => {
            setInputJson(value ?? "");
            setHasValidated(false);
          }}
          options={editorOptions}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setHasValidated(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d6c5a5] px-4 py-2.5 text-xs font-medium text-[#20211e] transition-colors hover:bg-[#e4d5b9]"
        >
          <Play size={13} />
          Validate JSON
        </button>

        <p className="self-center text-[11px] text-[#77776e]">
          Validation runs locally in your browser.
        </p>
      </div>

      {result && (
        <div
          aria-live="polite"
          className="mt-5 rounded-lg border border-white/[0.08] bg-[#20211e] p-4"
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 text-[#a8c39a]"
              />
            ) : (
              <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-400" />
            )}

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  result.success ? "text-[#a8c39a]" : "text-red-400"
                }`}
              >
                {result.success
                  ? "Validation successful"
                  : `Validation failed · ${result.issues.length} issue(s)`}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#99998f]">
                {result.success
                  ? "The input matches the inferred JSON structure."
                  : "Review the issues below and correct the input data."}
              </p>

              {!result.success && (
                <ul className="mt-4 space-y-3">
                  {result.issues.map((issue, index) => (
                    <li
                      key={`${issue.path}-${index}`}
                      className="border-t border-white/[0.06] pt-3"
                    >
                      <p className="break-all font-mono text-xs text-[#d6c5a5]">
                        {issue.path}
                      </p>

                      <p className="mt-1 break-words text-xs leading-5 text-[#99998f]">
                        {issue.message}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
