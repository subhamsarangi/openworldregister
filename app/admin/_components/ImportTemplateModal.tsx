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
        character: "ภ",
        transliteration: "ph",
        charType: "consonant",
        example: "ภาษา (language)",
        pronunciationNote: "aspirated 'p' sound"
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
        character: "I",
        transliteration: "i",
        charType: "vowel",
        example: "idioma (language)",
        pronunciationNote: "like 'ee' in 'meet'",
        variants: [
          { variantType: "uppercase", variantChar: "I", label: "Uppercase" },
          { variantType: "lowercase", variantChar: "i", label: "Lowercase" },
          { variantType: "accented_uppercase", variantChar: "Í", label: "Accented Uppercase" },
          { variantType: "accented_lowercase", variantChar: "í", label: "Accented Lowercase" }
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
        character: "Я",
        transliteration: "ya",
        charType: "vowel",
        example: "язык (language)",
        pronunciationNote: "like 'ya' in 'yard'",
        variants: [
          { variantType: "uppercase", variantChar: "Я", label: "Uppercase" },
          { variantType: "lowercase", variantChar: "я", label: "Lowercase" }
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
        character: "ل",
        transliteration: "l",
        charType: "consonant",
        example: "لُغَة (language)",
        pronunciationNote: "like 'l' in 'lemon'",
        variants: [
          { variantType: "isolated", variantChar: "ل", label: "Isolated" },
          { variantType: "initial", variantChar: "لـ", label: "Initial" },
          { variantType: "medial", variantChar: "ـلـ", label: "Medial" },
          { variantType: "final", variantChar: "ـل", label: "Final" }
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
        character: "げ",
        transliteration: "ge",
        charType: "consonant",
        example: "げんご (language)",
        pronunciationNote: "like 'ge' in 'get'",
        variants: [
          { variantType: "hiragana", variantChar: "げ", label: "Hiragana" },
          { variantType: "katakana", variantChar: "ゲ", label: "Katakana" }
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
        character: "भ",
        transliteration: "bha",
        charType: "consonant",
        example: "भाषा (language)",
        pronunciationNote: "aspirated 'b' sound",
        variants: [
          { variantType: "base", variantChar: "भ", label: "Base Form" },
          { variantType: "conjunct", variantChar: "भ्य", label: "भ + य → भ्य (bhya)" },
          { variantType: "conjunct", variantChar: "भ्र", label: "भ + र → भ्र (bhra)" }
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
        example: "국어 (language)",
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

const copyToClipboard = (text: string): boolean => {
  const fallback = (txt: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = txt;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("Fallback copy failed:", err);
      return false;
    }
  };

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      navigator.clipboard.writeText(text).catch((err) => {
        console.warn("Clipboard API failed, using fallback:", err);
        fallback(text);
      });
      return true;
    } catch (err) {
      return fallback(text);
    }
  } else {
    return fallback(text);
  }
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
        className="relative w-full h-full rounded-none p-6 md:p-10 shadow-2xl overflow-y-auto"
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
            Pick the JSON structure that matches your language's writing system. The template will be copied to your clipboard for you to paste and fill with real data.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="group text-left p-5 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col min-h-[420px]"
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
                className="mt-3 p-3 rounded-lg text-[10px] leading-relaxed overflow-y-auto h-[220px]"
                style={{
                  backgroundColor: "#faf6ee",
                  color: "#6b5740",
                  fontFamily: "'Geist Mono', monospace",
                  border: "1px solid rgba(107, 87, 64, 0.06)",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(184, 74, 30, 0.3) transparent",
                }}
              >
                {t.json}
              </pre>

              {/* Copy Button */}
              <button
                type="button"
                onClick={() => {
                  copyToClipboard(t.json);
                  alert("Template JSON copied to clipboard!");
                  onSelect(t.json);
                  onClose();
                }}
                className="mt-auto w-full py-2 px-4 rounded-lg text-center text-xs font-semibold transition-colors bg-[#f5efe3] hover:bg-[#b84a1e] text-[#b84a1e] hover:text-white cursor-pointer"
              >
                Copy Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
