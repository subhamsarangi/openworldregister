"use client";
import { LanguageConfig } from "../../actions/languages";
import { getLanguageGlyph } from "./constants";

interface PublishTabProps {
  languages: LanguageConfig[];
  onRefresh: () => void;
}

export function PublishTab({ languages, onRefresh }: PublishTabProps) {
  return (
    <div className="bg-[#fffdf8] p-8 rounded-2xl shadow-sm border border-black/5">
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Supabase Status</h2>
        <p className="text-sm text-gray-500 mt-1">
          Content is now served directly from Supabase — no publishing step needed.
          Add or edit content in any tab and it is live immediately.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {languages.map((lang) => (
          <div key={lang.id} className="p-5 rounded-xl border border-black/5 bg-[#fffdf8] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-[#f5efe3] text-[#b84a1e] font-bold text-lg flex items-center justify-center border border-black/5 select-none">
                {getLanguageGlyph(lang.slug, lang.nativeName, lang.name)}
              </span>
              <div>
                <h4 className="font-bold text-lg">{lang.name}</h4>
                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                  <span>Slug: <strong className="text-[#b84a1e]">{lang.slug}</strong></span>
                  <span>Letters: <strong className={lang.lettersApplicable ? "text-green-600" : "text-gray-400"}>{lang.lettersApplicable ? "Enabled" : "N/A"}</strong></span>
                  <span>Words: <strong className={lang.wordsApplicable ? "text-green-600" : "text-gray-400"}>{lang.wordsApplicable ? "Enabled" : "N/A"}</strong></span>
                  <span>Patterns: <strong className={lang.patternsApplicable ? "text-green-600" : "text-gray-400"}>{lang.patternsApplicable ? "Enabled" : "N/A"}</strong></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200">
              <span className="text-green-600 text-sm font-semibold">✓ Live on Supabase</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
