"use client";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, PanelLeftClose, PanelLeftOpen, Plus, X, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import {
  getLetters,
  saveLetter,
  importLettersBulk,
  deleteLetter,
  deleteAllLetters,
  DBLetter,
} from "../../actions/adminActions";
import { LanguageConfig } from "../../actions/languages";
import { ImportTemplateModal } from "./ImportTemplateModal";

export interface ContentTabProps {
  languages: LanguageConfig[];
  selectedLanguageId: number;
  setSelectedLanguageId: (id: number) => void;
  selectedLang?: LanguageConfig;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateLettersJson = (json: any): { isValid: boolean; error?: string } => {
  if (!Array.isArray(json)) {
    return { isValid: false, error: "JSON must be an array of letters." };
  }

  for (let i = 0; i < json.length; i++) {
    const item = json[i];
    const letterNum = i + 1;

    if (!item.character || typeof item.character !== "string" || !item.character.trim()) {
      return { isValid: false, error: `Letter #${letterNum} is missing a valid 'character' field.` };
    }

    if (item.charType && typeof item.charType !== "string") {
      return { isValid: false, error: `Letter #${letterNum} ('${item.character}') has an invalid 'charType' (must be a string).` };
    }

    if (item.transliteration && typeof item.transliteration !== "string") {
      return { isValid: false, error: `Letter #${letterNum} ('${item.character}') has an invalid 'transliteration' (must be a string).` };
    }

    if (item.variants) {
      if (!Array.isArray(item.variants)) {
        return { isValid: false, error: `Letter #${letterNum} ('${item.character}') 'variants' field must be an array.` };
      }

      for (let j = 0; j < item.variants.length; j++) {
        const v = item.variants[j];
        const varNum = j + 1;

        if (!v.variantType || typeof v.variantType !== "string" || !v.variantType.trim()) {
          return { isValid: false, error: `Letter #${letterNum} ('${item.character}') Variant #${varNum} is missing a valid 'variantType'.` };
        }

        if (!v.variantChar || typeof v.variantChar !== "string" || !v.variantChar.trim()) {
          return { isValid: false, error: `Letter #${letterNum} ('${item.character}') Variant #${varNum} is missing a valid 'variantChar'.` };
        }

        if (v.label && typeof v.label !== "string") {
          return { isValid: false, error: `Letter #${letterNum} ('${item.character}') Variant #${varNum} ('${v.variantChar}') has an invalid 'label' (must be a string).` };
        }
      }
    }
  }

  return { isValid: true };
};

export function LettersTab({ languages, selectedLanguageId, setSelectedLanguageId, selectedLang }: ContentTabProps) {
  const [letters, setLetters] = useState<DBLetter[]>([]);
  const [loadingData, setLoadingData] = useState(true);
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
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [variants, setVariants] = useState<{ variantType: string; variantChar: string; label: string }[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Card Flip and Table Accordion States
  const [flippedCardIds, setFlippedCardIds] = useState<Record<number, boolean>>({});
  const [expandedLetterIds, setExpandedLetterIds] = useState<Record<number, boolean>>({});

  const toggleFlip = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCardIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpand = (id: number) => {
    setExpandedLetterIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validation = validateLettersJson(json);
        if (!validation.isValid) {
          alert(`Validation Error: ${validation.error}`);
          return;
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
      const validation = validateLettersJson(json);
      if (!validation.isValid) {
        alert(`Validation Error: ${validation.error}`);
        return;
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
      setLoadingData(true);
      getLetters(selectedLanguageId).then((data) => {
        setLetters(data);
        setLoadingData(false);
      });
    }
  };

  const resetForm = () => {
    setCharacter("");
    setTransliteration("");
    setCharType("consonant");
    setExample("");
    setPronunciationNote("");
    setEditingId(null);
    setVariants([]);
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetForm();
    setFlippedCardIds({});
    setExpandedLetterIds({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguageId]);

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
        variants: variants.filter(v => v.variantChar.trim()).map((v, i) => ({
          letterId: editingId ?? 0,
          variantType: v.variantType,
          variantChar: v.variantChar,
          label: v.label || null,
          sortOrder: i,
        })),
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
    setVariants((item.variants ?? []).map(v => ({
      variantType: v.variantType,
      variantChar: v.variantChar,
      label: v.label ?? "",
    })));
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

  const handleDeleteAll = async () => {
    if (confirm("Are you sure you want to delete ALL letters for this language? This action is permanent and cannot be undone.")) {
      try {
        setLoadingData(true);
        const res = await deleteAllLetters(selectedLanguageId);
        if (res.success) {
          alert("Successfully deleted all letters!");
          refreshData();
        } else {
          alert(`Error deleting letters: ${res.error}`);
          setLoadingData(false);
        }
      } catch (err) {
        alert("Failed to delete letters.");
        setLoadingData(false);
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
    <>
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
          {/* Bulk Import Section */}
          <div className="bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 h-fit flex flex-col gap-4 relative">
            <button type="button" onClick={() => setIsFormVisible(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-[#b84a1e] hover:bg-[#b84a1e]/10 rounded-md transition-all" title="Hide Sidebar">
              <PanelLeftClose size={18} />
            </button>
            <h3 className="text-lg font-bold pr-8" style={{ fontFamily: "'Playfair Display', serif" }}>
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-500">Paste JSON Text</label>
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="text-[10px] text-[#b84a1e] hover:underline font-bold bg-transparent border-none cursor-pointer flex items-center gap-1"
                  >
                    📋 Choose Template
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder={'Pick a template using "Choose Template" above, or paste your own JSON here.'}
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

          {/* Edit/Add Form */}
          <div className="bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 h-fit">
            <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
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

              {/* Variants Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-500">Variants</label>
                  <button
                    type="button"
                    onClick={() => setVariants([...variants, { variantType: "", variantChar: "", label: "" }])}
                    className="flex items-center gap-1 text-[10px] text-[#b84a1e] hover:underline font-bold bg-transparent border-none cursor-pointer"
                  >
                    <Plus size={10} /> Add Variant
                  </button>
                </div>
                {variants.length === 0 && (
                  <p className="text-[10px] text-gray-400 italic">No variants. Click &quot;Add Variant&quot; for uppercase/lowercase, positional forms, etc.</p>
                )}
                {variants.map((v, i) => (
                  <div key={i} className="flex gap-1.5 mb-2 items-center">
                    <input
                      type="text"
                      placeholder="Type (e.g. uppercase)"
                      value={v.variantType}
                      onChange={e => {
                        const updated = [...variants];
                        updated[i].variantType = e.target.value;
                        setVariants(updated);
                      }}
                      className="flex-1 p-1.5 rounded border border-black/10 text-xs outline-none text-[#1a1208]"
                    />
                    <input
                      type="text"
                      placeholder="Char"
                      value={v.variantChar}
                      onChange={e => {
                        const updated = [...variants];
                        updated[i].variantChar = e.target.value;
                        setVariants(updated);
                      }}
                      className="w-14 p-1.5 rounded border border-black/10 text-xs outline-none text-[#1a1208] text-center font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={v.label}
                      onChange={e => {
                        const updated = [...variants];
                        updated[i].label = e.target.value;
                        setVariants(updated);
                      }}
                      className="flex-1 p-1.5 rounded border border-black/10 text-xs outline-none text-[#1a1208]"
                    />
                    <button
                      type="button"
                      onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" className="flex-1 py-2.5 bg-[#b84a1e] text-white text-sm rounded font-bold hover:opacity-90 transition-all cursor-pointer">
                  {editingId ? "Save Changes" : "Add Letter"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-black/5 hover:bg-black/10 text-sm rounded font-semibold transition-all cursor-pointer">
                    Cancel
                  </button>
                )}
              </div>
            </form>
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
                viewMode === "table" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === "grid" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Grid
            </button>
          </div>
        </div>
        
        {loadingData ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-[#b84a1e] animate-spin" />
          </div>
        ) : letters.length === 0 ? (
          <div className="py-12 text-center text-gray-500 border-2 border-dashed border-black/5 rounded-xl">
            No letters added yet. Fill the form to create the first character!
          </div>
        ) : viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-gray-400 font-bold uppercase text-[0.72rem] tracking-wider">
                  <th className="py-3 px-2 w-10"></th>
                  <th className="py-3 px-2">Letter</th>
                  <th className="py-3 px-2">Roman</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Variants</th>
                  <th className="py-3 px-2">Example</th>
                  <th className="py-3 px-2">Pronounce</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {letters.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-black/1">
                      <td className="py-3.5 px-2">
                        {(item.variants ?? []).length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id!)}
                            className="p-1 rounded hover:bg-black/5 text-gray-500 hover:text-[#b84a1e] transition-colors cursor-pointer"
                          >
                            {expandedLetterIds[item.id!] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-2 font-bold text-lg text-[#b84a1e]">{item.character}</td>
                      <td className="py-3.5 px-2 font-medium">{item.transliteration}</td>
                      <td className="py-3.5 px-2">
                        <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-[#faf6ee] text-[#6b5740] border border-black/5">
                          {item.charType}
                        </span>
                      </td>
                      <td className="py-3.5 px-2">
                        {(item.variants ?? []).length === 0 ? (
                          <span className="text-xs text-gray-400 italic">—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id!)}
                            className="px-2.5 py-0.5 rounded text-[0.68rem] font-bold bg-[#b84a1e]/8 text-[#b84a1e] border border-[#b84a1e]/15 hover:bg-[#b84a1e]/15 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>{(item.variants ?? []).length} variants</span>
                            {expandedLetterIds[item.id!] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-2 text-gray-600">{item.example}</td>
                      <td className="py-3.5 px-2 text-gray-400 italic">{item.pronunciationNote || "-"}</td>
                      <td className="py-3.5 px-2 text-right flex justify-end gap-1.5">
                        <button onClick={() => handleEdit(item)} className="px-2.5 py-1 text-xs bg-black/5 hover:bg-black/10 rounded font-semibold transition-all">Edit</button>
                        <button onClick={() => handleDelete(item.id!)} className="px-2.5 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold transition-all">Delete</button>
                      </td>
                    </tr>
                    {expandedLetterIds[item.id!] && (item.variants ?? []).length > 0 && (
                      <tr className="bg-[#faf6ee]/30">
                        <td></td>
                        <td colSpan={7} className="p-4 border-t border-b border-black/5">
                          <div className="flex flex-col gap-2 pl-4 py-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                              Letter Variations
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mt-2">
                              {item.variants?.map((v, vi) => (
                                <div key={vi} className="bg-white p-3 rounded-xl border border-black/5 shadow-sm flex items-center gap-3">
                                  <span className="text-xl font-extrabold text-[#b84a1e] bg-[#f5efe3] w-10 h-10 rounded-lg flex items-center justify-center">
                                    {v.variantChar}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-700 capitalize">{v.variantType}</span>
                                    {v.label && <span className="text-[10px] text-gray-400">{v.label}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* Inline CSS for 3D card flip */}
            <style dangerouslySetInnerHTML={{__html: `
              .flip-card {
                perspective: 1000px;
              }
              .flip-card-inner {
                transition: transform 0.6s;
                transform-style: preserve-3d;
              }
              .flip-card-front, .flip-card-back {
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
              }
              .flip-card-back {
                transform: rotateY(180deg);
              }
            `}} />

            {letters.map((item) => (
              <div
                key={item.id}
                className="flip-card w-full h-[180px] group text-left relative"
              >
                <div
                  className={`flip-card-inner w-full h-full relative transition-transform duration-600 [transform-style:preserve-3d] ${
                    flippedCardIds[item.id!] ? "[transform:rotateY(180deg)]" : ""
                  }`}
                >
                  {/* Front Side */}
                  <div className="flip-card-front absolute inset-0 w-full h-full p-4 rounded-xl shadow-sm border border-black/5 bg-white [backface-visibility:hidden] flex flex-col justify-between hover:border-[#b84a1e]/30 transition-colors">
                    {/* Top Row: Character, Roman, Type */}
                    <div className="flex items-end justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-[#b84a1e] select-all leading-none">{item.character}</span>
                        <span className="text-sm font-bold text-gray-400">/{item.transliteration}/</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[0.6rem] font-bold bg-[#faf6ee] text-[#6b5740] border border-black/5 uppercase tracking-wider whitespace-nowrap">
                        {item.charType === "consonant" ? "cons" : item.charType}
                      </span>
                    </div>

                    {/* Mid Row: Variants Count & Flip Trigger */}
                    <div className="flex items-center justify-between my-2">
                      {(item.variants ?? []).length > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => toggleFlip(item.id!, e)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#b84a1e]/8 text-[#b84a1e] border border-[#b84a1e]/15 hover:bg-[#b84a1e]/15 transition-all cursor-pointer"
                        >
                          <RefreshCw size={10} />
                          <span>{(item.variants ?? []).length} variants</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No variants</span>
                      )}
                    </div>

                    {/* Bottom Section: Details */}
                    <div className="bg-black/5 rounded p-2 flex flex-col gap-1 min-h-[3.5rem] justify-center">
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
                      {(item.variants ?? []).length > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFlip(item.id!, e); }}
                          className="p-1.5 text-[#b84a1e] hover:bg-gray-100 rounded transition-colors cursor-pointer"
                          title="Show Back"
                        >
                          <RefreshCw size={12} />
                        </button>
                      ) : (
                        <div className="w-[24px]" />
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors" title="Edit">
                        <Pencil size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id!); }} className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
 
                  {/* Back Side */}
                  <div className="flip-card-back absolute inset-0 w-full h-full p-4 rounded-xl shadow-sm border border-[#b84a1e]/20 bg-[#fffdf8] [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-black/5 pb-2 mb-2 pr-20">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-[#b84a1e] select-all leading-none">{item.character}</span>
                        <span className="text-xs font-bold text-gray-400">/{item.transliteration}/</span>
                        <span className="text-[10px] text-gray-400 font-medium">({(item.variants ?? []).length})</span>
                      </div>
                    </div>
 
                    {/* Hover Actions (Floating Toolbar) */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-sm rounded border border-black/5 p-0.5 z-10">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleFlip(item.id!, e); }}
                        className="p-1.5 text-[#b84a1e] hover:bg-gray-100 rounded transition-colors cursor-pointer"
                        title="Show Front"
                      >
                        <RefreshCw size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(item); }} className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors" title="Edit">
                        <Pencil size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id!); }} className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-0.5 scrollbar-thin">
                      {(item.variants ?? []).map((v, vi) => {
                        const name = v.label || (v.variantType ? v.variantType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "");
                        return (
                          <div key={vi} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-black/5 text-xs shadow-sm">
                            <span className="font-extrabold text-[#b84a1e] text-lg leading-none">{v.variantChar}</span>
                            <span className="text-[10px] text-gray-600 font-medium truncate max-w-[130px]" title={name}>
                              {name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete All Letters (at the end of the page) */}
        {letters.length > 0 && (
          <div className="mt-8 pt-6 border-t border-black/5 flex justify-end">
            <button
              type="button"
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all cursor-pointer shadow-sm hover:scale-[1.01]"
            >
              <Trash2 size={13} />
              <span>Delete All Letters in this Alphabet</span>
            </button>
          </div>
        )}
      </div>
    </div>
    </div>

    <ImportTemplateModal
      isOpen={isTemplateModalOpen}
      onClose={() => setIsTemplateModalOpen(false)}
      onSelect={() => {}}
    />
    </>
  );
}
