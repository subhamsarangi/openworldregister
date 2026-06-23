"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, ListRestart } from "lucide-react";

interface GroupData {
  title: string;
  num: number | null;
  lines: string[];
}

export default function CategoryGrouperPage() {
  const [inputText, setInputText] = useState("");
  const [groups, setGroups] = useState<{ [key: string]: GroupData }>({});
  const [order, setOrder] = useState<string[]>([]);
  const [totalSentences, setTotalSentences] = useState(0);
  const [clipboardText, setClipboardText] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  const parseHeading = (line: string) => {
    const t = line.trim();

    let m = t.match(/^##\s+(\d+)\.\s+(.+)/);
    if (m) return { key: m[2].trim(), num: parseInt(m[1], 10), title: t };

    m = t.match(/^(\d+)\.\s+(.+)/);
    if (m) return { key: m[2].trim(), num: parseInt(m[1], 10), title: t };

    m = t.match(/^##\s+(.+)/);
    if (m) return { key: m[1].trim(), num: null, title: t };

    return null;
  };

  const toMarkdownHeading = (title: string) => {
    if (title.startsWith("##")) return title;
    return "## " + title;
  };

  const handleProcess = () => {
    const lines = inputText.split("\n");
    const parsedGroups: { [key: string]: GroupData } = {};
    const parsedOrder: string[] = [];
    let currentKey: string | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const h = parseHeading(line);
      if (h) {
        if (!parsedGroups[h.key]) {
          parsedGroups[h.key] = { title: h.title, num: h.num, lines: [] };
          parsedOrder.push(h.key);
        }
        currentKey = h.key;
      } else if (currentKey !== null) {
        parsedGroups[currentKey].lines.push(trimmed);
      }
    }

    const numbered = parsedOrder
      .filter((k) => parsedGroups[k].num !== null)
      .sort((a, b) => (parsedGroups[a].num || 0) - (parsedGroups[b].num || 0));
    const unnumbered = parsedOrder.filter((k) => parsedGroups[k].num === null);
    const sortedKeys = [...numbered, ...unnumbered];

    let sentenceCount = 0;
    const clipboardParts: string[] = [];

    for (const key of sortedKeys) {
      const g = parsedGroups[key];
      sentenceCount += g.lines.length;
      clipboardParts.push(toMarkdownHeading(g.title) + "\n" + g.lines.join("\n"));
    }

    setGroups(parsedGroups);
    setOrder(sortedKeys);
    setTotalSentences(sentenceCount);
    setClipboardText(
      clipboardParts.join("\n\n") + `\n\nTotal sentences: ${sentenceCount}`
    );
    setHasProcessed(true);
  };

  const handleCopy = () => {
    if (!clipboardText) return;
    navigator.clipboard.writeText(clipboardText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleReset = () => {
    setInputText("");
    setGroups({});
    setOrder([]);
    setTotalSentences(0);
    setClipboardText("");
    setHasProcessed(false);
  };

  return (
    <div className="min-h-screen bg-[#faf6ee]" style={{ color: "#1a1208", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="py-6 px-8 border-b border-black/5 bg-[#fffdf8] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/admin?tab=patterns"
            className="p-2 rounded-lg hover:bg-black/5 text-[#b84a1e] transition-colors"
            title="Back to Admin"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Category Grouper
            </h1>
            <p className="text-xs text-gray-500">Sentence & pattern category organizing utility</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-8 max-w-6xl mx-auto flex flex-col gap-6">
        <div className="bg-[#fffdf8] p-6 rounded-2xl border border-black/5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
            Instructions
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Paste raw text containing category headers and items. Headers can be formatted in any of these styles:
          </p>
          <ul className="list-disc pl-4 text-xs text-gray-600 mt-2 space-y-1">
            <li><code>## 1. Category Name</code></li>
            <li><code>1. Category Name</code></li>
            <li><code>## Category Name</code></li>
          </ul>
          <p className="text-xs text-gray-600 leading-relaxed mt-2">
            The tool will group lines following each heading under that category, sort numbered headings numerically, count total lines, and output normalized markdown headings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="bg-[#fffdf8] p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-gray-800">Raw Input Text</h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw text here...&#10;&#10;## 1. Greetings&#10;Hello&#10;Good morning&#10;&#10;2. Farewells&#10;Goodbye&#10;See you later"
              className="w-full h-[350px] p-3 rounded-xl border border-black/10 text-xs font-mono outline-none text-[#1a1208] bg-[#faf6ee]/30 focus:border-[#b84a1e] transition-colors resize-y"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleProcess}
                disabled={!inputText.trim()}
                className={`flex-1 py-2.5 text-white text-sm rounded-lg font-bold transition-all ${
                  inputText.trim()
                    ? "bg-[#b84a1e] hover:opacity-90 cursor-pointer"
                    : "bg-gray-300 opacity-50 cursor-not-allowed"
                }`}
              >
                Process Categories
              </button>
              {hasProcessed && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-lg border border-black/10 hover:bg-black/5 text-gray-600 transition-colors inline-flex items-center gap-1.5 text-sm"
                >
                  <ListRestart size={15} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-[#fffdf8] p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800">Grouped Output</h3>
              {hasProcessed && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#b84a1e] hover:text-[#a6421a] hover:bg-[#b84a1e]/10 px-3 py-1.5 rounded-lg border border-[#b84a1e]/20 transition-all cursor-pointer"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Output"}
                </button>
              )}
            </div>

            <div className="w-full h-[350px] p-4 rounded-xl border border-black/10 bg-[#faf6ee]/10 overflow-y-auto text-xs font-mono flex flex-col gap-4 select-text">
              {!hasProcessed ? (
                <div className="h-full flex items-center justify-center text-gray-400 italic">
                  Processed output will appear here...
                </div>
              ) : order.length === 0 ? (
                <div className="h-full flex items-center justify-center text-red-500 italic">
                  No categories found. Check the heading formats.
                </div>
              ) : (
                <>
                  {order.map((key) => {
                    const g = groups[key];
                    return (
                      <div key={key} className="border-b border-black/5 pb-3">
                        <div className="font-bold text-[#b84a1e] text-sm mb-1">
                          {toMarkdownHeading(g.title)}
                        </div>
                        <div className="text-gray-600 whitespace-pre-wrap pl-2 border-l-2 border-[#b84a1e]/20">
                          {g.lines.join("\n")}
                        </div>
                      </div>
                    );
                  })}
                  <div className="text-xs font-bold border-t border-black/5 pt-3 text-gray-500 italic">
                    Total sentences: {totalSentences}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
