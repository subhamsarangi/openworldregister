"use client";
import React, { useEffect, useState } from "react";
import { getLanguages, updateLanguages, createLanguage, deleteLanguage, LanguageConfig } from "../actions/languages";
import {
  getLetters,
  saveLetter,
  deleteLetter,
  getWords,
  saveWord,
  deleteWord,
  getPatterns,
  savePattern,
  deletePattern,
  DBLetter,
  DBWord,
  DBPattern
} from "../actions/adminActions";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";

export default function AdminPage() {
  return <AdminDashboard />;
}

type TabType = "languages" | "letters" | "words" | "patterns";

function AdminDashboard() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [activeTab, setActiveTab] = useState<TabType>("languages");
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load languages
  const fetchLangs = () => {
    getLanguages().then((data) => {
      setLanguages(data);
      if (data.length > 0 && !selectedLanguageId) {
        setSelectedLanguageId(data[0].id);
      }
    });
  };

  useEffect(() => {
    fetchLangs();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const selectedLang = languages.find(l => l.id === selectedLanguageId);

  return (
    <div className="min-h-screen bg-[#faf6ee]" style={{ color: "#1a1208", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="py-6 px-8 border-b border-black/5 bg-[#fffdf8] flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏛</span>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Langtoo Admin</h1>
              <a 
                href="/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs px-2.5 py-1 rounded bg-[#f5efe3] hover:bg-[#e8c96a] transition-all font-medium text-[#b84a1e] flex items-center gap-1 shadow-xs"
              >
                🏠 View Site ↗
              </a>
            </div>
            <p className="text-xs text-gray-500">Local Content Management & R2 Publishing Pipeline</p>
          </div>
        </div>

        {/* Tab Selection & Logout */}
        <div className="flex items-center gap-4">
          <nav className="flex gap-2">
            {[
              { id: "languages", label: "Languages" },
              { id: "letters", label: "Letters" },
              { id: "words", label: "Words" },
              { id: "patterns", label: "Patterns" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-[#b84a1e] text-white shadow-sm" : "hover:bg-black/5 text-[#6b5740]"}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-[#b84a1e]/20 text-[#b84a1e] hover:bg-[#b84a1e]/5 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-8 w-full max-w-none">
        {activeTab === "languages" && (
          <LanguagesTab 
            languages={languages} 
            setLanguages={setLanguages} 
            saving={saving} 
            setSaving={setSaving} 
            onRefresh={fetchLangs}
          />
        )}

        {activeTab === "letters" && (
          <LettersTab 
            languages={languages} 
            selectedLanguageId={selectedLanguageId} 
            setSelectedLanguageId={setSelectedLanguageId} 
            selectedLang={selectedLang}
          />
        )}

        {activeTab === "words" && (
          <WordsTab 
            languages={languages} 
            selectedLanguageId={selectedLanguageId} 
            setSelectedLanguageId={setSelectedLanguageId} 
            selectedLang={selectedLang}
          />
        )}

        {activeTab === "patterns" && (
          <PatternsTab
            languages={languages}
            selectedLanguageId={selectedLanguageId}
            setSelectedLanguageId={setSelectedLanguageId}
            selectedLang={selectedLang}
          />
        )}
      </main>
    </div>
  );
}

// 1. LANGUAGES TAB COMPONENT
interface LanguagesTabProps {
  languages: LanguageConfig[];
  setLanguages: React.Dispatch<React.SetStateAction<LanguageConfig[]>>;
  saving: boolean;
  setSaving: (s: boolean) => void;
  onRefresh: () => void;
}

function LanguagesTab({ languages, setLanguages, saving, setSaving, onRefresh }: LanguagesTabProps) {
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newNative, setNewNative] = useState("");
  const [newFlag, setNewFlag] = useState("");
  const [newLat, setNewLat] = useState("0.0");
  const [newLng, setNewLng] = useState("0.0");
  const [creating, setCreating] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleFieldChange = (index: number, field: keyof LanguageConfig, value: any) => {
    const newLangs = [...languages];
    (newLangs[index] as any)[field] = value;
    setLanguages(newLangs);
  };

  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    const newLangs = [...languages];
    const draggedItemContent = newLangs[dragItem.current];
    newLangs.splice(dragItem.current, 1);
    newLangs.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setLanguages(newLangs);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newLangs = [...languages];
    [newLangs[index - 1], newLangs[index]] = [newLangs[index], newLangs[index - 1]];
    setLanguages(newLangs);
  };

  const moveDown = (index: number) => {
    if (index === languages.length - 1) return;
    const newLangs = [...languages];
    [newLangs[index + 1], newLangs[index]] = [newLangs[index], newLangs[index + 1]];
    setLanguages(newLangs);
  };

  const toggleActive = (index: number) => {
    const newLangs = [...languages];
    newLangs[index].isActive = !newLangs[index].isActive;
    setLanguages(newLangs);
  };

  const toggleApplicable = (index: number, tab: "letters" | "words" | "patterns") => {
    const newLangs = [...languages];
    if (tab === "letters") newLangs[index].lettersApplicable = !newLangs[index].lettersApplicable;
    if (tab === "words") newLangs[index].wordsApplicable = !newLangs[index].wordsApplicable;
    if (tab === "patterns") newLangs[index].patternsApplicable = !newLangs[index].patternsApplicable;
    setLanguages(newLangs);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateLanguages(languages);
    setSaving(false);
    alert("Languages configuration saved!");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName || !newNative || !newFlag) {
      alert("All fields are required");
      return;
    }
    setCreating(true);
    const res = await createLanguage({
      slug: newId,
      iso6393: newId,
      name: newName,
      nativeName: newNative,
      flag: newFlag,
      latitude: parseFloat(newLat) || 0.0,
      longitude: parseFloat(newLng) || 0.0
    });
    setCreating(false);
    if (res.success) {
      setNewId("");
      setNewName("");
      setNewNative("");
      setNewFlag("");
      setNewLat("0.0");
      setNewLng("0.0");
      alert("Language added successfully!");
      onRefresh();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleDeleteLang = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will delete all its letters, words, and patterns as well!`)) {
      const res = await deleteLanguage(id);
      if (res.success) {
        alert(`${name} deleted successfully!`);
        onRefresh();
      } else {
        alert(`Error deleting language: ${res.error}`);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Language Form */}
      <div className="bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 h-fit">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Add New Language
        </h3>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Code / ID (lowercase)</label>
            <input
              type="text"
              placeholder="e.g. swahili"
              value={newId}
              onChange={e => setNewId(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Display Name</label>
            <input
              type="text"
              placeholder="e.g. Swahili"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Native Name</label>
            <input
              type="text"
              placeholder="e.g. Kiswahili"
              value={newNative}
              onChange={e => setNewNative(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Flag Emoji</label>
            <input
              type="text"
              placeholder="e.g. 🇰🇪"
              value={newFlag}
              onChange={e => setNewFlag(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Latitude</label>
              <input
                type="text"
                placeholder="e.g. -1.29"
                value={newLat}
                onChange={e => setNewLat(e.target.value)}
                className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Longitude</label>
              <input
                type="text"
                placeholder="e.g. 36.82"
                value={newLng}
                onChange={e => setNewLng(e.target.value)}
                className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={creating}
            className="w-full py-2.5 bg-[#b84a1e] text-white text-sm rounded font-bold hover:opacity-90 transition-all"
          >
            {creating ? "Adding..." : "Add Language"}
          </button>
        </form>
      </div>

      {/* Languages List */}
      <div className="lg:col-span-2 bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Languages List</h2>
            <p className="text-sm text-gray-500">Configure global active states, order, and tab applicability.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-6 py-2 rounded text-white font-bold transition-all hover:opacity-90 bg-[#b84a1e]"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : "Save List Changes"}
          </button>
        </div>

        {/* Header row for grid columns */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-[0.72rem] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-black/5 pb-2">
          <div className="col-span-4">Language</div>
          <div className="col-span-2 text-center">Letters Tab</div>
          <div className="col-span-2 text-center">Words Tab</div>
          <div className="col-span-2 text-center">Patterns Tab</div>
          <div className="col-span-2 text-right">Show on Globe & Actions</div>
        </div>

        <div className="flex flex-col gap-3">
          {languages.map((lang, idx) => (
            <div 
              key={lang.id} 
              className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 rounded-xl shadow-xs transition-all border border-black/5"
              style={{ backgroundColor: lang.isActive ? "#fffdf8" : "#f0ebd8" }}
              draggable
              onDragStart={(e) => { dragItem.current = idx; }}
              onDragEnter={(e) => { dragOverItem.current = idx; }}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Col 1-4: Grab Handle + Order + Flag + Name */}
              <div className="col-span-1 lg:col-span-4 flex items-center gap-3">
                <div className="text-gray-400 cursor-grab active:cursor-grabbing text-base select-none pr-1" title="Drag to reorder">☰</div>
                <div className="flex flex-col gap-1 bg-black/5 rounded p-0.5">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-500 hover:text-black disabled:opacity-20 text-[10px] px-1 py-0.5 leading-none">▲</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === languages.length - 1} className="text-gray-500 hover:text-black disabled:opacity-20 text-[10px] px-1 py-0.5 leading-none">▼</button>
                </div>
                
                {editingIdx === idx ? (
                  <div className="flex flex-wrap gap-2 items-center w-full">
                    <input 
                      type="text" 
                      value={lang.flag} 
                      onChange={e => handleFieldChange(idx, "flag", e.target.value)}
                      className="w-12 p-1.5 rounded border border-black/15 text-center text-lg outline-none text-[#1a1208] bg-white"
                      title="Flag Emoji"
                    />
                    <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                      <input 
                        type="text" 
                        value={lang.name} 
                        onChange={e => handleFieldChange(idx, "name", e.target.value)}
                        className="w-full p-1.5 rounded border border-black/15 text-xs font-bold outline-none text-[#1a1208] bg-white"
                        placeholder="Language Name"
                      />
                      <input 
                        type="text" 
                        value={lang.nativeName} 
                        onChange={e => handleFieldChange(idx, "nativeName", e.target.value)}
                        className="w-full p-1.5 rounded border border-black/15 text-xs outline-none text-[#1a1208] bg-white"
                        placeholder="Native Name"
                      />
                      <div className="flex gap-1">
                        <input 
                          type="number" 
                          step="any"
                          value={lang.latitude} 
                          onChange={e => handleFieldChange(idx, "latitude", parseFloat(e.target.value) || 0)}
                          className="w-1/2 p-1 rounded border border-black/15 text-[10px] outline-none text-[#1a1208] bg-white"
                          placeholder="Lat"
                        />
                        <input 
                          type="number" 
                          step="any"
                          value={lang.longitude} 
                          onChange={e => handleFieldChange(idx, "longitude", parseFloat(e.target.value) || 0)}
                          className="w-1/2 p-1 rounded border border-black/15 text-[10px] outline-none text-[#1a1208] bg-white"
                          placeholder="Lng"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-3xl">{lang.flag}</span>
                    <div>
                      <div className="font-bold text-base">{lang.name}</div>
                      <div className="text-xs text-gray-500">{lang.nativeName} {`(${lang.latitude.toFixed(2)}, ${lang.longitude.toFixed(2)})`}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Col 5-6: Letters checkbox */}
              <div className="col-span-1 lg:col-span-2 flex justify-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={lang.lettersApplicable} 
                    onChange={() => toggleApplicable(idx, "letters")}
                    className="w-4 h-4"
                    style={{ accentColor: "#b84a1e" }}
                  />
                  <span className="text-xs text-gray-600 lg:hidden font-medium">Letters Tab</span>
                </label>
              </div>

              {/* Col 7-8: Words checkbox */}
              <div className="col-span-1 lg:col-span-2 flex justify-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={lang.wordsApplicable} 
                    onChange={() => toggleApplicable(idx, "words")}
                    className="w-4 h-4"
                    style={{ accentColor: "#b84a1e" }}
                  />
                  <span className="text-xs text-gray-600 lg:hidden font-medium">Words Tab</span>
                </label>
              </div>

              {/* Col 9-10: Patterns checkbox */}
              <div className="col-span-1 lg:col-span-2 flex justify-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={lang.patternsApplicable} 
                    onChange={() => toggleApplicable(idx, "patterns")}
                    className="w-4 h-4"
                    style={{ accentColor: "#b84a1e" }}
                  />
                  <span className="text-xs text-gray-600 lg:hidden font-medium">Patterns Tab</span>
                </label>
              </div>

              {/* Col 11-12: Visibility Toggle & Done/Edit & Delete */}
              <div className="col-span-1 lg:col-span-2 flex items-center justify-between lg:justify-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-2 py-1.5 rounded border border-black/5 shadow-xs">
                  <input 
                    type="checkbox" 
                    checked={lang.isActive} 
                    onChange={() => toggleActive(idx)} 
                    className="w-4 h-4" 
                    style={{ accentColor: "#b84a1e" }}
                  />
                  <span className="font-medium text-xs whitespace-nowrap">{lang.isActive ? "Show" : "Hidden"}</span>
                </label>
                
                <div className="flex items-center gap-1.5">
                  {editingIdx === idx ? (
                    <button
                      onClick={() => setEditingIdx(null)}
                      className="px-2.5 py-1.5 rounded text-xs font-bold text-white bg-green-700 hover:bg-green-800 transition-all shadow-xs"
                      title="Done editing fields"
                    >
                      ✓
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingIdx(idx)}
                      className="px-2.5 py-1.5 rounded text-xs font-medium border border-black/10 hover:bg-black/5 transition-all text-gray-600"
                      title="Edit fields"
                    >
                      ✏️
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleDeleteLang(lang.id, lang.name)}
                    className="px-2.5 py-1.5 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold transition-all"
                    title="Delete Language"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. LETTERS TAB COMPONENT
interface ContentTabProps {
  languages: LanguageConfig[];
  selectedLanguageId: number;
  setSelectedLanguageId: (id: number) => void;
  selectedLang?: LanguageConfig;
}

function LettersTab({ languages, selectedLanguageId, setSelectedLanguageId, selectedLang }: ContentTabProps) {
  const [letters, setLetters] = useState<DBLetter[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [character, setCharacter] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [charType, setCharType] = useState("consonant");
  const [example, setExample] = useState("");
  const [pronunciationNote, setPronunciationNote] = useState("");

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Edit/Add Form */}
      <div className="bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 h-fit">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          {editingId ? "Edit Letter" : "Add New Letter"}
        </h3>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Select Language</label>
            <select
              value={selectedLanguageId}
              onChange={e => setSelectedLanguageId(Number(e.target.value))}
              className="w-full p-2.5 rounded border border-black/10 bg-white text-sm outline-none"
            >
              {languages.map(l => (
                <option key={l.id} value={l.id}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>

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

      {/* Letters List */}
      <div className="lg:col-span-2 bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Current Letters List ({letters.length})
        </h3>
        
        {letters.length === 0 ? (
          <div className="py-12 text-center text-gray-500 border-2 border-dashed border-black/5 rounded-xl">
            No letters added yet. Fill the form to create the first character!
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

// 3. WORDS TAB COMPONENT
function WordsTab({ languages, selectedLanguageId, setSelectedLanguageId, selectedLang }: ContentTabProps) {
  const [words, setWords] = useState<DBWord[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [word, setWord] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [translation, setTranslation] = useState("");
  const [cefrLevel, setCefrLevel] = useState("A1");

  const refreshData = () => {
    if (selectedLanguageId) {
      getWords(selectedLanguageId).then(setWords);
    }
  };

  useEffect(() => {
    refreshData();
    resetForm();
  }, [selectedLanguageId]);

  const resetForm = () => {
    setWord("");
    setTransliteration("");
    setTranslation("");
    setCefrLevel("A1");
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word || !translation) {
      alert("Word and Translation are required");
      return;
    }

    try {
      await saveWord({
        id: editingId ?? undefined,
        languageId: selectedLanguageId,
        word,
        transliteration,
        translation,
        cefrLevel,
      });
      refreshData();
      resetForm();
    } catch (e) {
      alert("Error saving word");
    }
  };

  const handleEdit = (item: DBWord) => {
    setEditingId(item.id ?? null);
    setWord(item.word);
    setTransliteration(item.transliteration);
    setTranslation(item.translation);
    setCefrLevel(item.cefrLevel);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this word?")) {
      try {
        await deleteWord(id);
        refreshData();
      } catch (e) {
        alert("Error deleting word");
      }
    }
  };

  if (selectedLang && !selectedLang.wordsApplicable) {
    return (
      <div className="bg-[#fffdf8] p-8 rounded-2xl shadow-sm border border-black/5 text-center">
        <h2 className="text-xl font-bold mb-2">Words / Vocab Editor</h2>
        <p className="text-gray-500">This tab is marked as **Not Applicable** for {selectedLang.name}. Enable it in the Languages tab first.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Edit/Add Form */}
      <div className="bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 h-fit">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          {editingId ? "Edit Word" : "Add New Word"}
        </h3>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Select Language</label>
            <select
              value={selectedLanguageId}
              onChange={e => setSelectedLanguageId(Number(e.target.value))}
              className="w-full p-2.5 rounded border border-black/10 bg-white text-sm outline-none"
            >
              {languages.map(l => (
                <option key={l.id} value={l.id}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Word / Phrase</label>
            <input
              type="text"
              placeholder="e.g. Bonjour"
              value={word}
              onChange={e => setWord(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Romanized Spelling / Pronunciation</label>
            <input
              type="text"
              placeholder="e.g. bohn-zhoor"
              value={transliteration}
              onChange={e => setTransliteration(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">English Translation</label>
            <input
              type="text"
              placeholder="e.g. Hello / Good morning"
              value={translation}
              onChange={e => setTranslation(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">CEFR Level</label>
            <select
              value={cefrLevel}
              onChange={e => setCefrLevel(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 bg-white text-sm outline-none"
            >
              <option value="A1">A1 — Beginner</option>
              <option value="A2">A2 — Elementary</option>
              <option value="B1">B1 — Intermediate</option>
              <option value="B2">B2 — Upper Intermediate</option>
              <option value="C1">C1 — Advanced</option>
              <option value="C2">C2 — Proficient</option>
            </select>
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 py-2.5 bg-[#b84a1e] text-white text-sm rounded font-bold hover:opacity-90 transition-all">
              {editingId ? "Save Changes" : "Add Word"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-black/5 hover:bg-black/10 text-sm rounded font-semibold transition-all">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Words List */}
      <div className="lg:col-span-2 bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Current Vocabulary List ({words.length})
        </h3>
        
        {words.length === 0 ? (
          <div className="py-12 text-center text-gray-500 border-2 border-dashed border-black/5 rounded-xl">
            No vocabulary added yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-gray-400 font-bold uppercase text-[0.72rem] tracking-wider">
                  <th className="py-3 px-2">Word</th>
                  <th className="py-3 px-2">Roman</th>
                  <th className="py-3 px-2">Meaning</th>
                  <th className="py-3 px-2">Level</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {words.map((item) => (
                  <tr key={item.id} className="hover:bg-black/1">
                    <td className="py-3.5 px-2 font-bold text-[#b84a1e]">{item.word}</td>
                    <td className="py-3.5 px-2 text-gray-600">{item.transliteration || "-"}</td>
                    <td className="py-3.5 px-2 font-medium">{item.translation}</td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-[0.68rem] font-bold ${
                        item.cefrLevel === 'A1' || item.cefrLevel === 'A2' ? 'bg-green-50 text-green-700 border border-green-200' :
                        item.cefrLevel === 'B1' || item.cefrLevel === 'B2' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.cefrLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right flex justify-end gap-1.5">
                      <button onClick={() => handleEdit(item)} className="px-2.5 py-1 text-xs bg-black/5 hover:bg-black/10 rounded font-semibold transition-all">Edit</button>
                      <button onClick={() => handleDelete(item.id!)} className="px-2.5 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold transition-all">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// 4. PATTERNS TAB COMPONENT
function PatternsTab({ languages, selectedLanguageId, setSelectedLanguageId, selectedLang }: ContentTabProps) {
  const [patterns, setPatterns] = useState<DBPattern[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [template, setTemplate] = useState("");
  const [tags, setTags] = useState("");
  const [patternType, setPatternType] = useState("");
  const [exampleNativeText, setExampleNativeText] = useState("");
  const [exampleTranslation, setExampleTranslation] = useState("");
  const [slotValuesJson, setSlotValuesJson] = useState("");

  const refreshData = () => {
    if (selectedLanguageId) {
      getPatterns(selectedLanguageId).then(setPatterns);
    }
  };

  useEffect(() => {
    refreshData();
    resetForm();
  }, [selectedLanguageId]);

  const resetForm = () => {
    setTemplate("");
    setTags("");
    setPatternType("");
    setExampleNativeText("");
    setExampleTranslation("");
    setSlotValuesJson(JSON.stringify([
      { slotValue: "French", transliteration: "français", translation: "French" }
    ], null, 2));
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) {
      alert("Pattern Template is required");
      return;
    }

    let parsedSlots: { slotValue: string; transliteration?: string; translation?: string }[] = [];
    try {
      parsedSlots = JSON.parse(slotValuesJson || "[]");
    } catch {
      alert("Invalid JSON in slot values.");
      return;
    }

    try {
      await savePattern({
        id: editingId ?? undefined,
        languageId: selectedLanguageId,
        template,
        patternType: patternType || null,
        tags: tags || null,
        exampleNativeText: exampleNativeText || null,
        exampleTranslation: exampleTranslation || null,
        slotValues: parsedSlots,
      });
      refreshData();
      resetForm();
    } catch (e) {
      alert("Error saving pattern.");
    }
  };

  const handleEdit = (item: DBPattern) => {
    setEditingId(item.id ?? null);
    setTemplate(item.template);
    setTags(item.tags ?? "");
    setPatternType(item.patternType ?? "");
    setExampleNativeText(item.exampleNativeText ?? "");
    setExampleTranslation(item.exampleTranslation ?? "");
    setSlotValuesJson(JSON.stringify(item.slotValues ?? [], null, 2));
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this pattern?")) {
      try {
        await deletePattern(id);
        refreshData();
      } catch (e) {
        alert("Error deleting pattern");
      }
    }
  };

  if (selectedLang && !selectedLang.patternsApplicable) {
    return (
      <div className="bg-[#fffdf8] p-8 rounded-2xl shadow-sm border border-black/5 text-center">
        <h2 className="text-xl font-bold mb-2">Sentence Patterns Editor</h2>
        <p className="text-gray-500">This tab is marked as **Not Applicable** for {selectedLang.name}. Enable it in the Languages tab first.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Edit/Add Form */}
      <div className="bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 h-fit">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          {editingId ? "Edit Pattern" : "Add New Pattern"}
        </h3>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Select Language</label>
            <select
              value={selectedLanguageId}
              onChange={e => setSelectedLanguageId(Number(e.target.value))}
              className="w-full p-2.5 rounded border border-black/10 bg-white text-sm outline-none"
            >
              {languages.map(l => (
                <option key={l.id} value={l.id}>{l.flag} {l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Pattern Template</label>
            <input
              type="text"
              placeholder="e.g. Are you ___?"
              value={template}
              onChange={e => setTemplate(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
            <p className="text-[0.68rem] text-gray-400 mt-1">Use `___` (3 underscores) to specify the blank slot.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Pattern Type (Optional)</label>
            <select
              value={patternType}
              onChange={e => setPatternType(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 bg-white text-sm outline-none"
            >
              <option value="">— none —</option>
              <option value="affirmative">Affirmative</option>
              <option value="interrogative">Interrogative</option>
              <option value="negative">Negative</option>
              <option value="modal">Modal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. greetings, basic, question"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Example Sentence (Native)</label>
            <input
              type="text"
              placeholder="e.g. Tu es français?"
              value={exampleNativeText}
              onChange={e => setExampleNativeText(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Example Translation (English)</label>
            <input
              type="text"
              placeholder="e.g. Are you French?"
              value={exampleTranslation}
              onChange={e => setExampleTranslation(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Slot Values (JSON array)</label>
            <textarea
              rows={6}
              placeholder='[{"slotValue":"French","transliteration":"français","translation":"French"}]'
              value={slotValuesJson}
              onChange={e => setSlotValuesJson(e.target.value)}
              className="w-full p-2.5 rounded border border-black/10 text-xs font-mono outline-none text-[#1a1208] bg-[#faf6ee]"
            />
            <p className="text-[0.68rem] text-gray-400 mt-1">Each object: slotValue (required), transliteration, translation (optional)</p>
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 py-2.5 bg-[#b84a1e] text-white text-sm rounded font-bold hover:opacity-90 transition-all">
              {editingId ? "Save Changes" : "Add Pattern"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-black/5 hover:bg-black/10 text-sm rounded font-semibold transition-all">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Patterns List */}
      <div className="lg:col-span-2 bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5">
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Current Patterns List ({patterns.length})
        </h3>
        
        {patterns.length === 0 ? (
          <div className="py-12 text-center text-gray-500 border-2 border-dashed border-black/5 rounded-xl">
            No patterns added yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {patterns.map((item) => {
              return (
                <div key={item.id} className="p-4 rounded-xl border border-black/5 bg-[#fffdf8] hover:shadow-xs transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-base text-[#b84a1e]">{item.template}</h4>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleEdit(item)} className="px-2.5 py-1 text-xs bg-black/5 hover:bg-black/10 rounded font-semibold transition-all">Edit</button>
                      <button onClick={() => handleDelete(item.id!)} className="px-2.5 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded font-semibold transition-all">Delete</button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {(item.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean).map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#faf6ee] text-[#6b5740] border border-black/5">
                        #{tag}
                      </span>
                    ))}
                    {item.patternType && (
                      <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.patternType}
                      </span>
                    )}
                  </div>

                  {item.slotValues && item.slotValues.length > 0 && (
                    <div className="text-xs border-t border-black/5 pt-2.5 mt-2">
                      <span className="font-semibold text-gray-500 block mb-1">Slot Variations:</span>
                      <div className="flex flex-wrap gap-1.5 text-gray-600 bg-black/2 p-2 rounded">
                        {item.slotValues.slice(0, 4).map((sv: any, svIdx: number) => (
                          <span key={svIdx} className="bg-white px-2 py-0.5 rounded border border-black/5">
                            {sv.slotValue} {sv.transliteration ? `(${sv.transliteration})` : ""} {sv.translation ? `→ ${sv.translation}` : ""}
                          </span>
                        ))}
                        {item.slotValues.length > 4 && <span className="text-gray-400">+{item.slotValues.length - 4} more</span>}
                      </div>
                    </div>
                  )}

                  {item.exampleNativeText && (
                    <div className="text-xs border-t border-black/5 pt-2 mt-2 text-gray-500 italic">
                      e.g. &ldquo;{item.exampleNativeText}&rdquo; — {item.exampleTranslation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// 5. SUPABASE STATUS TAB
function PublishTab({ languages, onRefresh }: { languages: LanguageConfig[]; onRefresh: () => void }) {
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
              <span className="text-4xl">{lang.flag}</span>
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
