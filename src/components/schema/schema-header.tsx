"use client";

import Link from "next/link";
import { Braces, ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Playground", href: "#playground" },
  { label: "Validator", href: "#validator" },
  { label: "Mock Data", href: "#mock-data" },
  { label: "Schema Diff", href: "#schema-diff" },
];

export default function SchemaHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#20211e]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d6c5a5]/20 bg-[#d6c5a5]/[0.08]">
            <Braces size={17} className="text-[#d6c5a5]" />
          </div>

          <span className="text-sm font-semibold tracking-tight text-[#f0eee8]">
            SchemaKit
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs text-[#99998f] transition-colors hover:text-[#f0eee8]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/zulian026/schemakit"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-lg border border-white/[0.09] px-3.5 py-2 text-xs text-[#d6c5a5] transition-colors hover:bg-white/[0.04] sm:inline-flex"
          >
            GitHub
            <ArrowUpRight size={13} />
          </a>

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.09] text-[#aaa99f] transition-colors hover:bg-white/[0.04] md:hidden"
          >
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/[0.07] px-6 py-3 md:hidden">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-3 text-sm text-[#aaa99f] transition-colors hover:bg-white/[0.04] hover:text-[#f0eee8]"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
