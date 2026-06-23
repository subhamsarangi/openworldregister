"use client";
import React from "react";

export interface ImportTemplate {
  id: string;
  name: string;
  bestFor: string;
  hint: string;
  json: string;
}

const TEMPLATES: ImportTemplate[] = [
  {
    id: "simple",
    name: "Simple (No Variants)",
    bestFor: "Thai, Amharic, Georgian",
    hint: "Truly caseless scripts with single-form characters. No uppercase/lowercase, no positional forms, no conjuncts.",
    json: JSON.stringify([
      {
        character: "ก",
        transliteration: "k",
        charType: "consonant",
        example: "กา (crow)",
        pronunciationNote: "like 'g' in 'go'"
      }
    ], null, 2),
  },
  {
    id: "latin",
    name: "Latin with Upper/Lowercase",
    bestFor: "French, German, Spanish, Italian, Portuguese, Swedish, Turkish, Vietnamese, Zulu, Navajo",
    hint: "Latin-script languages where each letter has an uppercase and lowercase form.",
    json: JSON.stringify([
      {
        character: "É",
        transliteration: "e",
        charType: "vowel",
        example: "café",
        pronunciationNote: "/ay/",
        variants: [
          { variantType: "uppercase", variantChar: "É", label: "Uppercase" },
          { variantType: "lowercase", variantChar: "é", label: "Lowercase" }
        ]
      }
    ], null, 2),
  },
  {
    id: "cyrillic",
    name: "Cyrillic with Upper/Lowercase",
    bestFor: "Russian, Ukrainian, Bulgarian, Serbian",
    hint: "Cyrillic-script languages with uppercase and lowercase letter forms.",
    json: JSON.stringify([
      {
        character: "Б",
        transliteration: "b",
        charType: "consonant",
        example: "Брат (brother)",
        pronunciationNote: "like 'b' in 'box'",
        variants: [
          { variantType: "uppercase", variantChar: "Б", label: "Uppercase" },
          { variantType: "lowercase", variantChar: "б", label: "Lowercase" }
        ]
      }
    ], null, 2),
  },
  {
    id: "arabic",
    name: "Arabic Positional Forms",
    bestFor: "Arabic, Urdu, Persian, Pashto",
    hint: "Right-to-left scripts where each letter changes shape based on its position in a word.",
    json: JSON.stringify([
      {
        character: "ع",
        transliteration: "ayn",
        charType: "consonant",
        example: "عَرَبِيّ",
        pronunciationNote: "deep throat sound",
        variants: [
          { variantType: "isolated", variantChar: "ع", label: "Isolated" },
          { variantType: "initial", variantChar: "عـ", label: "Initial" },
          { variantType: "medial", variantChar: "ـعـ", label: "Medial" },
          { variantType: "final", variantChar: "ـع", label: "Final" }
        ]
      }
    ], null, 2),
  },
  {
    id: "japanese",
    name: "Japanese Dual Script",
    bestFor: "Japanese",
    hint: "Maps each sound to both Hiragana and Katakana forms.",
    json: JSON.stringify([
      {
        character: "あ",
        transliteration: "a",
        charType: "vowel",
        example: "あめ (rain)",
        pronunciationNote: "like 'a' in 'father'",
        variants: [
          { variantType: "hiragana", variantChar: "あ", label: "Hiragana" },
          { variantType: "katakana", variantChar: "ア", label: "Katakana" }
        ]
      }
    ], null, 2),
  },
  {
    id: "indic",
    name: "Indic Conjuncts",
    bestFor: "Hindi, Bengali, Odia, Marathi, Nepali",
    hint: "Devanagari or other Indic scripts with combined/conjunct characters (juktakkhor, sanyuktakshar).",
    json: JSON.stringify([
      {
        character: "क",
        transliteration: "ka",
        charType: "consonant",
        example: "कमल (lotus)",
        pronunciationNote: "like 'k' in 'kite'",
        variants: [
          { variantType: "base", variantChar: "क", label: "Base Form" },
          { variantType: "conjunct", variantChar: "क्ष", label: "क + ष → क्ष (ksha)" },
          { variantType: "conjunct", variantChar: "क्र", label: "क + र → क्र (kra)" }
        ]
      }
    ], null, 2),
  },
  {
    id: "korean",
    name: "Korean Jamo",
    bestFor: "Korean",
    hint: "Consonants and vowels with initial/final/tense forms (Jamo decomposition).",
    json: JSON.stringify([
      {
        character: "ㄱ",
        transliteration: "g/k",
        charType: "consonant",
        example: "가방 (bag)",
        pronunciationNote: "like 'g' in 'go'",
        variants: [
          { variantType: "initial", variantChar: "ㄱ", label: "Initial Jamo" },
          { variantType: "final", variantChar: "ㄱ", label: "Final Batchim" },
          { variantType: "double", variantChar: "ㄲ", label: "Double (tense)" }
        ]
      }
    ], null, 2),
  },
];

interface ImportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (json: string) => void;
}

const TEMPLATE_ICONS: Record<string, string> = {
  simple: "✦",
  latin: "Aa",
  cyrillic: "Бб",
  arabic: "عـ",
  japanese: "あア",
  indic: "क्ष",
  korean: "한",
};

export function ImportTemplateModal({ isOpen, onClose, onSelect }: ImportTemplateModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(26, 18, 8, 0.6)", backdropFilter: "blur(6px)" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal */}
      <div
        className="relative w-11/12 max-w-3xl rounded-2xl p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{
          backgroundColor: "#fffdf8",
          border: "1px solid rgba(184, 74, 30, 0.2)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(184, 74, 30, 0.3) transparent",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          style={{ color: "#1a1208", fontSize: "1rem" }}
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: "#1a1208" }}>
            Choose Import Template
          </h2>
          <p className="text-xs text-gray-500">
            Pick the JSON structure that matches your language's writing system. The template will be pasted into the editor for you to fill with real data.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onSelect(t.json);
                onClose();
              }}
              className="group text-left p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              style={{
                backgroundColor: "white",
                border: "1px solid rgba(107, 87, 64, 0.1)",
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors group-hover:bg-[#b84a1e] group-hover:text-white"
                  style={{
                    backgroundColor: "#f5efe3",
                    color: "#b84a1e",
                  }}
                >
                  {TEMPLATE_ICONS[t.id] || "?"}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name */}
                  <div className="font-bold text-sm mb-0.5" style={{ color: "#1a1208" }}>
                    {t.name}
                  </div>

                  {/* Best for */}
                  <div className="text-[10px] font-semibold mb-1.5" style={{ color: "#b84a1e" }}>
                    Best for: {t.bestFor}
                  </div>

                  {/* Hint */}
                  <div className="text-[10px] text-gray-500 leading-relaxed">
                    {t.hint}
                  </div>
                </div>
              </div>

              {/* JSON preview */}
              <pre
                className="mt-3 p-2 rounded-lg text-[9px] leading-tight overflow-hidden max-h-16"
                style={{
                  backgroundColor: "#faf6ee",
                  color: "#6b5740",
                  fontFamily: "'Geist Mono', monospace",
                  border: "1px solid rgba(107, 87, 64, 0.06)",
                }}
              >
                {t.json.slice(0, 180)}
                {t.json.length > 180 ? "\n  ..." : ""}
              </pre>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
