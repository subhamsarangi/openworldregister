"use client";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  getLetters,
  saveLetter,
  importLettersBulk,
  deleteLetter,
  DBLetter,
} from "../../actions/adminActions";
import { LanguageConfig } from "../../actions/languages";

export interface ContentTabProps {
  languages: LanguageConfig[];
  selectedLanguageId: number;
  setSelectedLanguageId: (id: number) => void;
  selectedLang?: LanguageConfig;
}

export function LettersTab({ languages, selectedLanguageId, setSelectedLanguageId, selectedLang }: ContentTabProps) {
  const [letters, setLetters] = useState<DBLetter[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [character, setCharacter] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [charType, setCharType] = useState("consonant");
  const [example, setExample] = useState("");
  const [pronunciationNote, setPronunciationNote] = useState("");
  const [importing, setImporting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [importMode, setImportMode] = useState<"upload" | "paste">("upload");
  const [jsonText, setJsonText] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          alert("JSON file must be an array of letters.");
          return;
        }

        // Validate structure
        for (const item of json) {
          if (!item.character) {
            alert("Invalid structure: Each item must contain at least a 'character' field.");
            return;
          }
        }

        if (confirm(`Are you sure you want to bulk import/update ${json.length} letters to this language?`)) {
          setImporting(true);
          const res = await importLettersBulk(selectedLanguageId, json);
          setImporting(false);
          if (res.success) {
            alert(`Successfully imported/updated ${json.length} letters!`);
            refreshData();
          } else {
            alert(`Error importing letters: ${res.error}`);
          }
        }
      } catch (err) {
        alert("Failed to parse JSON file. Please ensure it is valid JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = async () => {
    if (!jsonText.trim()) {
      alert("Please paste some JSON first.");
      return;
    }

    try {
      const json = JSON.parse(jsonText);
      if (!Array.isArray(json)) {
        alert("JSON must be an array of letters.");
        return;
      }

      // Validate structure
      for (const item of json) {
        if (!item.character) {
          alert("Invalid structure: Each item must contain at least a 'character' field.");
          return;
        }
      }

      if (confirm(`Are you sure you want to bulk import/update ${json.length} letters to this language?`)) {
        setImporting(true);
        const res = await importLettersBulk(selectedLanguageId, json);
        setImporting(false);
        if (res.success) {
          alert(`Successfully imported/updated ${json.length} letters!`);
          setJsonText("");
          refreshData();
        } else {
          alert(`Error importing letters: ${res.error}`);
        }
      }
    } catch (err) {
      alert("Failed to parse JSON. Please ensure it is valid JSON format.");
    }
  };

  const refreshData = () => {
    if (selectedLanguageId) {
      getLetters(selectedLanguageId).then(setLetters);
    }
  };

  useEffect(() => {
    refreshData();
    resetForm();
  }, [selectedLanguageId]);

  const resetForm = () => {
    setCharacter("");
    setTransliteration("");
    setCharType("consonant");
    setExample("");
    setPronunciationNote("");
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) {
      alert("Character is required");
      return;
    }

    try {
      await saveLetter({
        id: editingId ?? undefined,
        languageId: selectedLanguageId,
        character,
        transliteration,
        charType,
        example: example || null,
        pronunciationNote: pronunciationNote || null,
      });
      refreshData();
      resetForm();
    } catch (e) {
      alert("Error saving letter");
    }
  };

  const handleEdit = (item: DBLetter) => {
    setEditingId(item.id ?? null);
    setCharacter(item.character);
    setTransliteration(item.transliteration);
    setCharType(item.charType);
    setExample(item.example ?? "");
    setPronunciationNote(item.pronunciationNote ?? "");
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this letter?")) {
      try {
        await deleteLetter(id);
        refreshData();
      } catch (e) {
        alert("Error deleting letter");
      }
    }
  };

  if (selectedLang && !selectedLang.lettersApplicable) {
    return (
      <div className="bg-[#fffdf8] p-8 rounded-2xl shadow-sm border border-black/5 text-center">
        <h2 className="text-xl font-bold mb-2">Letters / Script Editor</h2>
        <p className="text-gray-500">This tab is marked as **Not Applicable** for {selectedLang.name}. Enable it in the Languages tab first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Language Filter Bar */}
      <div className="bg-[#fffdf8] px-5 py-3.5 rounded-xl border border-black/5 shadow-sm flex items-center gap-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Working on</span>
        <select
          value={selectedLanguageId}
          onChange={e => setSelectedLanguageId(Number(e.target.value))}
          className="flex-1 max-w-xs p-2 rounded border border-black/10 bg-white text-sm font-semibold outline-none text-[#1a1208] cursor-pointer"
        >
          {languages.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        {selectedLang && (
          <span className="text-xs text-gray-500">
            {selectedLang.nativeName} · {selectedLang.iso6393?.toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start overflow-hidden">
      {/* Left Column: Form + Bulk Import */}
      <div className={`flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${isFormVisible ? 'w-full lg:w-[320px] xl:w-[380px] gap-8 opacity-100' : 'w-0 h-0 lg:h-auto opacity-0'}`}>
        <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col gap-8 pb-4">
          {/* Edit/Add Form */}
          <div className="bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 h-fit relative">
            <button type="button" onClick={() => setIsFormVisible(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-[#b84a1e] hover:bg-[#b84a1e]/10 rounded-md transition-all" title="Hide Form">
              <PanelLeftClose size={18} />
            </button>
            <h3 className="text-lg font-bold mb-4 pr-8" style={{ fontFamily: "'Playfair Display', serif" }}>
              {editingId ? "Edit Letter" : "Add New Letter"}
            </h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Letter / Character</label>
            <input
              type="text"
              placeholder="e.g. é"
              value={character}
              onChange={e => setCharacter(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Roman Transliteration</label>
            <input
              type="text"
              placeholder="e.g. e"
              value={transliteration}
              onChange={e => setTransliteration(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
            <select
              value={charType}
              onChange={e => setCharType(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 bg-white text-sm outline-none"
            >
              <option value="vowel">Vowel</option>
              <option value="consonant">Consonant</option>
              <option value="special">Special Character</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Example usage</label>
            <input
              type="text"
              placeholder="e.g. café"
              value={example}
              onChange={e => setExample(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Pronunciation Guide (Optional)</label>
            <input
              type="text"
              placeholder="e.g. /ay/"
              value={pronunciationNote}
              onChange={e => setPronunciationNote(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 py-2.5 bg-[#b84a1e] text-white text-sm rounded font-bold hover:opacity-90 transition-all">
              {editingId ? "Save Changes" : "Add Letter"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-black/5 hover:bg-black/10 text-sm rounded font-semibold transition-all">
                Cancel
              </button>
            )}
          </div>
        </form>
        </div>

        {/* Bulk Import Section */}
        <div className="bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 h-fit flex flex-col gap-4">
          <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Bulk Import Letters
          </h3>
          <p className="text-xs text-gray-500">
            Import or update letters using a JSON file upload or raw pasted JSON text. Existing characters will be updated intelligently.
          </p>

          {/* Mode Tabs */}
          <div className="flex border-b border-black/5 gap-4 mt-2">
            <button
              type="button"
              onClick={() => setImportMode("upload")}
              className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                importMode === "upload"
                  ? "border-[#b84a1e] text-[#b84a1e]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setImportMode("paste")}
              className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                importMode === "paste"
                  ? "border-[#b84a1e] text-[#b84a1e]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              Paste JSON
            </button>
          </div>

          {importMode === "upload" ? (
            <div className="mt-2">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Upload JSON File</label>
              <input 
                type="file" 
                accept=".json"
                disabled={importing}
                onChange={handleFileUpload}
                className="w-full p-2 border border-black/10 rounded text-xs outline-none bg-white cursor-pointer file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#b84a1e]/10 file:text-[#b84a1e] hover:file:bg-[#b84a1e]/20"
              />
              {importing && <p className="text-xs text-[#b84a1e] font-semibold mt-1 animate-pulse">Importing letters, please wait...</p>}
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-3">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Paste JSON Text</label>
              <textarea
                rows={6}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={`[\n  {\n    "character": "é",\n    "transliteration": "e",\n    "charType": "vowel",\n    "example": "café",\n    "pronunciationNote": "/ay/"\n  }\n]`}
                disabled={importing}
                className="w-full p-2 border border-black/10 rounded text-xs font-mono outline-none bg-white resize-y leading-relaxed"
              />
              <button
                type="button"
                onClick={handlePasteImport}
                disabled={importing || !jsonText.trim()}
                className="w-full py-2 bg-[#b84a1e] text-white text-xs rounded font-bold hover:opacity-90 transition-all disabled:opacity-50"
              >
                {importing ? "Importing/Updating..." : "Import / Update Letters"}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Letters List */}
      <div className="flex-1 min-w-0 w-full bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {!isFormVisible && (
              <button type="button" onClick={() => setIsFormVisible(true)} className="p-1.5 text-gray-500 hover:text-[#b84a1e] hover:bg-[#b84a1e]/10 rounded-md transition-all shadow-sm bg-white border border-black/5" title="Show Form">
                <PanelLeftOpen size={16} />
              </button>
            )}
            <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Current Letters List ({letters.length})
            </h3>
          </div>
          
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg p-0.5 bg-black/5 gap-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-white text-[#b84a1e] shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[#b84a1e] shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Grid
            </button>
          </div>
        </div>
        
        {letters.length === 0 ? (
          <div className="py-12 text-center text-gray-500 border-2 border-dashed border-black/5 rounded-xl">
            No letters added yet. Fill the form to create the first character!
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-gray-400 font-bold uppercase text-[0.72rem] tracking-wider">
                  <th className="py-3 px-2">Letter</th>
                  <th className="py-3 px-2">Roman</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Example</th>
                  <th className="py-3 px-2">Pronounce</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {letters.map((item) => (
                  <tr key={item.id} className="hover:bg-black/1">
                    <td className="py-3.5 px-2 font-bold text-lg text-[#b84a1e]">{item.character}</td>
                    <td className="py-3.5 px-2 font-medium">{item.transliteration}</td>
                    <td className="py-3.5 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#faf6ee] text-[#6b5740] border border-black/5">
                        {item.charType}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-gray-600">{item.example}</td>
                    <td className="py-3.5 px-2 text-gray-400 italic">{item.pronunciationNote || "-"}</td>
                    <td className="py-3.5 px-2 text-right flex justify-end gap-1.5">
                      <button onClick={() => handleEdit(item)} className="px-2.5 py-1 text-xs bg-black/5 hover:bg-black/10 rounded font-semibold transition-all">Edit</button>
                      <button onClick={() => handleDelete(item.id!)} className="px-2.5 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold transition-all">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {letters.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-xl shadow-sm border border-black/5 hover:border-[#b84a1e]/30 transition-all flex flex-col relative group text-left"
              >
                {/* Top Row: Character, Roman, Type */}
                <div className="flex items-end justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-[#b84a1e] select-all leading-none">{item.character}</span>
                    <span className="text-sm font-bold text-gray-400">/{item.transliteration}/</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[0.6rem] font-bold bg-[#faf6ee] text-[#6b5740] border border-black/5 uppercase tracking-wider whitespace-nowrap">
                    {item.charType === "consonant" ? "cons" : item.charType}
                  </span>
                </div>

                {/* Bottom Section: Details */}
                <div className="bg-black/5 rounded p-2 mt-auto flex flex-col gap-1 min-h-[3.5rem] justify-center">
                  {item.example && (
                    <div className="text-xs text-gray-800 truncate w-full">
                      <span className="text-[9px] font-bold text-gray-500 uppercase mr-1">Ex:</span>
                      <span className="font-semibold">{item.example}</span>
                    </div>
                  )}
                  {item.pronunciationNote && (
                    <div className="text-[10px] text-gray-600 italic leading-tight line-clamp-2" title={item.pronunciationNote}>
                      {item.pronunciationNote}
                    </div>
                  )}
                  {!item.example && !item.pronunciationNote && (
                    <div className="text-[10px] text-gray-400 italic">No details</div>
                  )}
                </div>

                {/* Hover Actions (Floating Toolbar) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-sm rounded border border-black/5 p-0.5 z-10">
                  <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors" title="Edit">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(item.id!)} className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Delete">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
