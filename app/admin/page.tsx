"use client";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Copy, Check } from "lucide-react";
import { getLanguages, updateLanguages, createLanguage, deleteLanguage, saveLanguage, LanguageConfig } from "../actions/languages";
import {
  getLetters,
  saveLetter,
  importLettersBulk,
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

const LANGUAGE_FAMILIES_MAP: Record<string, string[]> = {
  "Afroasiatic": ["Semitic", "Cushitic", "Berber", "Chadic", "Egyptian"],
  "Austroasiatic": ["Vietic", "Mon-Khmer", "Munda"],
  "Austronesian": ["Malayo-Polynesian", "Formosan"],
  "Dravidian": ["Southern", "South-Central", "Central", "Northern"],
  "Indo-European": [
    "Balto-Slavic",
    "Germanic",
    "Indo-Aryan",
    "Romance",
    "Hellenic",
    "Celtic",
    "Iranian",
    "Armenian",
    "Albanian"
  ],
  "Japonic": ["Japanese", "Ryukyuan"],
  "Kartvelian": ["Georgian", "Zan", "Svan"],
  "Koreanic": ["Korean", "Jeju"],
  "Kra-Dai": ["Tai", "Kam-Sui", "Hlai", "Kra"],
  "Mayan": ["Yucatecan", "Cholan-Tzeltalan", "K'ichean", "Huastecan"],
  "Mongolic": ["Eastern Mongolic", "Western Mongolic"],
  "Na-Dene": ["Athabaskan", "Eyak", "Tlingit"],
  "Niger-Congo": ["Bantu", "Atlantic-Congo", "Mande", "Gur", "Kwa"],
  "Nilo-Saharan": ["Nilotic", "Central Sudanic", "Songhay"],
  "Quechuan": ["Quechua I", "Quechua II"],
  "Sino-Tibetan": ["Sinitic", "Tibeto-Burman"],
  "Trans-New Guinea": ["Madang", "Finisterre-Huon", "Kainantu-Goroka"],
  "Tupian": ["Tupi-Guarani", "Munduruku", "Mawé"],
  "Turkic": ["Oghuz", "Karluk", "Kipchak", "Siberian Turkic", "Oghur"],
  "Uralic": ["Finno-Ugric", "Samoyedic"],
  "Uto-Aztecan": ["Nahuatlan", "Numic", "Takic", "Taracahitic"],
  "Language Isolate": ["Basque", "Ainu", "Burushaski", "Other Isolate"],
  "Other": ["Other"]
};


const LANGUAGE_GLYPHS: Record<string, string> = {
  spanish: "ñ",
  chinese: "文",
  arabic: "ض",
  hindi: "अ",
  german: "ß",
  russian: "ж",
  japanese: "あ",
  french: "ç",
  bengali: "আ",
  turkish: "ğ",
  korean: "한",
  portuguese: "ã",
  tamil: "ழ்",
  vietnamese: "đ",
  italian: "è",
  swedish: "å",
  navajo: "ł",
  english: "e",
  amharic: "ሀ",
  zulu: "q"
};

const getLanguageGlyph = (slug: string, nativeName: string, name: string): string => {
  const s = slug.toLowerCase().trim();
  if (LANGUAGE_GLYPHS[s]) {
    return LANGUAGE_GLYPHS[s];
  }
  const text = nativeName || name;
  return text ? Array.from(text)[0] : "🌐";
};

const WRITING_SYSTEMS = [
  "Latin / Latina",
  "Latin (Chữ Quốc ngữ) / Chữ Quốc ngữ",
  "Arabic alphabet / أبجدية عربية",
  "Armenian alphabet / Հայոց այბუბեն",
  "Bengali-Assamese script / বাংলা-অসমীয়া লিপি",
  "Burmese script / မြန်မာအက္ခရာ",
  "Cherokee syllabary / ᏣᎳᎩ ᏗᏕᎶᏆᏍᏙᏗ",
  "Chinese characters / 中文",
  "Cyrillic / Кириллица",
  "Devanagari / देवनागरी",
  "Ge'ez script / ግዕዝ",
  "Georgian script / ქართული დამწერლობა",
  "Greek alphabet / Ελληνικό αλφάβητο",
  "Gujarati script / ગુજરાતી લિપિ",
  "Gurmukhi (Punjabi) / ਗੁਰਮੁਖੀ",
  "Hangul / 한글",
  "Hebrew alphabet / אלפבית עברי",
  "Japanese (Kana and Kanji) / 日本語",
  "Kannada script / ಕನ್ನಡ ಲಿಪಿ",
  "Khmer script / អក្សរខ្មែរ",
  "Lao script / ອັກສອນລາວ",
  "Malayalam script / മലയാളലിപി",
  "Mongolian script / Монгол бичиг",
  "Odia script / ଓଡ଼ିଆ ଲିପિ",
  "Sinhala script / සිංහල අක්ෂර მාලාව",
  "Syriac alphabet / ܐܠܦܒܝܬ ܣܘܪܝܝܐ",
  "Tamil script / தமிழ் எழுத்துமுறை",
  "Telugu script / తెలుగు లిపి",
  "Thaana (Maldivian) / ތާނަ",
  "Thai script / อักษรไทย",
  "Tibetan script / བོད་ཡིག",
  "Tifinagh (Berber) / ⵜⵉⴼⵉⵏ ⴰⵖ",
  "Unified Canadian Aboriginal Syllabics / ᒐᓇᑕᒥ ᐊᓪᓚᖑᐊᒐᐃᑦ",
  "Other / Other"
];

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
  const [newLat, setNewLat] = useState("0.0");
  const [newLng, setNewLng] = useState("0.0");
  const [newIso1, setNewIso1] = useState("");
  const [newIso3, setNewIso3] = useState("");
  const [newFamily, setNewFamily] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [newWritingSystem, setNewWritingSystem] = useState("");
  const [newTotalSpeakers, setNewTotalSpeakers] = useState("");
  const [creating, setCreating] = useState(false);
  const [editForm, setEditForm] = useState<LanguageConfig | null>(null);
  const [savingIndividual, setSavingIndividual] = useState(false);

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

  const toggleActive = async (index: number) => {
    const updated = { ...languages[index], isActive: !languages[index].isActive };
    const res = await saveLanguage(updated);
    if (res.success) {
      const newLangs = [...languages];
      newLangs[index] = updated;
      setLanguages(newLangs);
    } else {
      alert(`Error toggling active state: ${res.error}`);
    }
  };

  const toggleApplicable = async (index: number, tab: "letters" | "words" | "patterns") => {
    const updated = { ...languages[index] };
    if (tab === "letters") updated.lettersApplicable = !updated.lettersApplicable;
    if (tab === "words") updated.wordsApplicable = !updated.wordsApplicable;
    if (tab === "patterns") updated.patternsApplicable = !updated.patternsApplicable;
    
    const res = await saveLanguage(updated);
    if (res.success) {
      const newLangs = [...languages];
      newLangs[index] = updated;
      setLanguages(newLangs);
    } else {
      alert(`Error toggling tab applicability: ${res.error}`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateLanguages(languages);
    setSaving(false);
    alert("Sorting order saved successfully!");
  };

  const handleSaveIndividual = async () => {
    if (!editForm) return;
    if (!editForm.name || !editForm.nativeName || !editForm.iso6393 || !editForm.slug) {
      alert("Please fill in all required fields (Name, Native Name, Slug, ISO 639-3).");
      return;
    }
    setSavingIndividual(true);
    const res = await saveLanguage(editForm);
    setSavingIndividual(false);
    if (res.success) {
      alert(`${editForm.name} saved successfully!`);
      setEditForm(null);
      onRefresh();
    } else {
      alert(`Error saving language: ${res.error}`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName || !newNative || !newIso3) {
      alert("All fields marked with * are required (Slug, Name, Native Name, ISO 639-3)");
      return;
    }
    setCreating(true);
    const res = await createLanguage({
      slug: newId,
      iso6391: newIso1 || undefined,
      iso6393: newIso3,
      name: newName,
      nativeName: newNative,
      flag: "🌐",
      latitude: parseFloat(newLat) || 0.0,
      longitude: parseFloat(newLng) || 0.0,
      family: newFamily || undefined,
      branch: newBranch || undefined,
      writingSystem: newWritingSystem || undefined,
      totalSpeakers: newTotalSpeakers ? parseInt(newTotalSpeakers) : undefined,
    });
    setCreating(false);
    if (res.success) {
      setNewId("");
      setNewName("");
      setNewNative("");
      setNewLat("0.0");
      setNewLng("0.0");
      setNewFamily("");
      setNewBranch("");
      setNewWritingSystem("");
      setNewTotalSpeakers("");
      setNewIso1("");
      setNewIso3("");
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
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Slug *</label>
              <input
                type="text"
                placeholder="swahili"
                value={newId}
                onChange={e => setNewId(e.target.value.toLowerCase().trim())}
                className="w-full p-2 rounded border border-black/10 text-xs outline-none text-[#1a1208]"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">ISO 639-1</label>
              <input
                type="text"
                maxLength={2}
                placeholder="sw"
                value={newIso1}
                onChange={e => setNewIso1(e.target.value.toLowerCase().trim())}
                className="w-full p-2 rounded border border-black/10 text-xs outline-none text-[#1a1208]"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">ISO 639-3 *</label>
              <input
                type="text"
                maxLength={3}
                placeholder="swh"
                value={newIso3}
                onChange={e => setNewIso3(e.target.value.toLowerCase().trim())}
                className="w-full p-2 rounded border border-black/10 text-xs outline-none text-[#1a1208]"
              />
            </div>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Language Family</label>
              <select
                value={newFamily}
                onChange={e => {
                  setNewFamily(e.target.value);
                  setNewBranch("");
                }}
                className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white cursor-pointer"
              >
                <option value="">Select Family...</option>
                {Object.keys(LANGUAGE_FAMILIES_MAP).map(fam => (
                  <option key={fam} value={fam}>{fam}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Branch</label>
              <select
                value={newBranch}
                onChange={e => setNewBranch(e.target.value)}
                disabled={!newFamily}
                className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Branch...</option>
                {newFamily && LANGUAGE_FAMILIES_MAP[newFamily]?.map(br => (
                  <option key={br} value={br}>{br}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Writing System</label>
              <select
                value={newWritingSystem}
                onChange={e => setNewWritingSystem(e.target.value)}
                className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white cursor-pointer"
              >
                <option value="">Select Writing System...</option>
                {WRITING_SYSTEMS.map(ws => (
                  <option key={ws} value={ws}>{ws}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Total Speakers</label>
              <input
                type="number"
                placeholder="e.g. 98000000"
                value={newTotalSpeakers}
                onChange={e => setNewTotalSpeakers(e.target.value)}
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
                <span className="w-8 h-8 rounded-full bg-[#f5efe3] text-[#b84a1e] font-bold text-sm flex items-center justify-center border border-black/5 flex-shrink-0 select-none">
                  {getLanguageGlyph(lang.slug, lang.nativeName, lang.name)}
                </span>
                <button
                  onClick={() => setEditForm({ ...lang })}
                  className="flex-1 min-w-0 text-left hover:text-[#b84a1e] transition-colors focus:outline-none group cursor-pointer"
                  title="Click to view and edit language details"
                >
                  <div className="font-bold text-base flex items-center gap-1.5 group-hover:underline decoration-[#b84a1e]">
                    {lang.name}
                    {lang.iso6393 && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-black/5 text-gray-500 font-mono font-normal no-underline">
                        {lang.iso6393}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{lang.nativeName}</div>
                </button>
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

              {/* Col 11-12: Visibility Toggle & Edit & Delete */}
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

      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div 
            className="bg-[#fffdf8] rounded-2xl w-full max-w-2xl shadow-2xl border border-black/10 overflow-hidden my-8"
            style={{ color: "#1a1208", fontFamily: "'DM Sans', sans-serif" }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-black/5 bg-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="w-8 h-8 rounded-full bg-[#f5efe3] text-[#b84a1e] font-bold text-sm flex items-center justify-center border border-black/5 select-none">
                  {getLanguageGlyph(editForm.slug, editForm.nativeName, editForm.name)}
                </span> Edit {editForm.name}
              </h3>
              <button 
                onClick={() => setEditForm(null)}
                className="text-gray-400 hover:text-black text-xl font-semibold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Display Name *</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Native Name *</label>
                  <input 
                    type="text" 
                    value={editForm.nativeName} 
                    onChange={e => setEditForm({ ...editForm, nativeName: e.target.value })}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">ISO 639-1 (2 chars)</label>
                  <input 
                    type="text" 
                    maxLength={2}
                    value={editForm.iso6391 || ""} 
                    onChange={e => setEditForm({ ...editForm, iso6391: e.target.value.toLowerCase().trim() || null })}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">ISO 639-3 * (3 chars)</label>
                  <input 
                    type="text" 
                    maxLength={3}
                    value={editForm.iso6393} 
                    onChange={e => setEditForm({ ...editForm, iso6393: e.target.value.toLowerCase().trim() })}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Slug *</label>
                  <input 
                    type="text" 
                    value={editForm.slug} 
                    onChange={e => setEditForm({ ...editForm, slug: e.target.value.toLowerCase().trim() })}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={editForm.latitude} 
                    onChange={e => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={editForm.longitude} 
                    onChange={e => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Language Family</label>
                  <select
                    value={editForm.family || ""}
                    onChange={e => setEditForm({ ...editForm, family: e.target.value || null, branch: null })}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white cursor-pointer"
                  >
                    <option value="">Select Family...</option>
                    {Object.keys(LANGUAGE_FAMILIES_MAP).map(fam => (
                      <option key={fam} value={fam}>{fam}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Branch</label>
                  <select
                    value={editForm.branch || ""}
                    onChange={e => setEditForm({ ...editForm, branch: e.target.value || null })}
                    disabled={!editForm.family}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Branch...</option>
                    {editForm.family && LANGUAGE_FAMILIES_MAP[editForm.family]?.map(br => (
                      <option key={br} value={br}>{br}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Writing System</label>
                  <select
                    value={editForm.writingSystem || ""}
                    onChange={e => setEditForm({ ...editForm, writingSystem: e.target.value || null })}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white cursor-pointer"
                  >
                    <option value="">Select Writing System...</option>
                    {WRITING_SYSTEMS.map(ws => (
                      <option key={ws} value={ws}>{ws}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Total Speakers</label>
                  <input 
                    type="number" 
                    value={editForm.totalSpeakers !== null ? editForm.totalSpeakers : ""} 
                    onChange={e => setEditForm({ ...editForm, totalSpeakers: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208] bg-white"
                  />
                </div>
              </div>

              <div className="border-t border-black/5 pt-4 mt-2 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Applicable Tabs</span>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.lettersApplicable} 
                        onChange={e => setEditForm({ ...editForm, lettersApplicable: e.target.checked })}
                        className="w-4 h-4" 
                        style={{ accentColor: "#b84a1e" }}
                      />
                      Letters/Script Tab
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.wordsApplicable} 
                        onChange={e => setEditForm({ ...editForm, wordsApplicable: e.target.checked })}
                        className="w-4 h-4" 
                        style={{ accentColor: "#b84a1e" }}
                      />
                      Words/Vocab Tab
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.patternsApplicable} 
                        onChange={e => setEditForm({ ...editForm, patternsApplicable: e.target.checked })}
                        className="w-4 h-4" 
                        style={{ accentColor: "#b84a1e" }}
                      />
                      Patterns/Phrases Tab
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editForm.isActive} 
                        onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="w-4 h-4" 
                        style={{ accentColor: "#b84a1e" }}
                      />
                      Show on Globe & Enable Language
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-black/5 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setEditForm(null)}
                disabled={savingIndividual}
                className="px-4 py-2 border border-black/10 rounded-lg text-sm text-gray-600 hover:bg-black/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveIndividual}
                disabled={savingIndividual}
                className="px-5 py-2 rounded-lg text-white font-bold bg-[#b84a1e] hover:opacity-90 transition-all flex items-center gap-2 text-sm"
              >
                {savingIndividual ? "Saving..." : "Save Language"}
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [importing, setImporting] = useState(false);
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
      {/* Left Column: Form + Bulk Import */}
      <div className="flex flex-col gap-8">
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
                <option key={l.id} value={l.id}>{l.name}</option>
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

      {/* Letters List */}
      <div className="lg:col-span-2 bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Current Letters List ({letters.length})
          </h3>
          
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
                className="bg-white p-4 rounded-xl shadow-sm border border-black/5 hover:border-[#b84a1e]/20 transition-all flex flex-col items-center text-center relative group"
              >
                {/* Character display */}
                <div className="text-3xl font-extrabold text-[#b84a1e] mb-2 select-all leading-tight">
                  {item.character}
                </div>

                {/* Transliteration */}
                <div className="text-sm font-bold text-gray-800 mb-1 leading-snug">
                  /{item.transliteration}/
                </div>

                {/* Tag for Type */}
                <div className="mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#faf6ee] text-[#6b5740] border border-black/5">
                    {item.charType}
                  </span>
                </div>

                {/* Example word */}
                {item.example && (
                  <div className="text-xs text-gray-600 mb-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">Ex:</span>
                    <span className="font-semibold">{item.example}</span>
                  </div>
                )}

                {/* Pronunciation Note */}
                {item.pronunciationNote && (
                  <div className="text-[10px] text-gray-400 italic mb-3 max-w-full truncate" title={item.pronunciationNote}>
                    {item.pronunciationNote}
                  </div>
                )}

                {/* Edit Icon (Top Right) */}
                <button
                  onClick={() => handleEdit(item)}
                  className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>

                {/* Delete Icon (Bottom Right) */}
                <button
                  onClick={() => handleDelete(item.id!)}
                  className="absolute bottom-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
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
                <option key={l.id} value={l.id}>{l.name}</option>
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
  const [formMode, setFormMode] = useState<"manual" | "json">("manual");
  const [jsonText, setJsonText] = useState("");
  const [copied, setCopied] = useState(false);

  const jsonTemplateStr = `{
  "template": "¿Estás ___?",
  "patternType": "affirmative | interrogative | negative | modal | imperative | conditional | comparative | exclamatory",
  "tense": "present",
  "tags": "basic",
  "exampleNativeText": "¿Estás feliz?",
  "exampleTranslation": "Are you happy?",
  "slotValues": [
    { 
      "slotValue": "feliz", 
      "transliteration": "feliz", 
      "translation": "happy",
      "sortOrder": 0
    },
    { 
      "slotValue": "ocupado", 
      "transliteration": "ocupado", 
      "translation": "busy",
      "sortOrder": 1
    },
    { 
      "slotValue": "bien", 
      "transliteration": "bien", 
      "translation": "okay",
      "sortOrder": 2
    }
  ]
}`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(jsonTemplateStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJsonTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    try {
      const json = JSON.parse(text);
      if (json && !Array.isArray(json) && json.template) {
        setTemplate(json.template || "");
        setPatternType(json.patternType || "");
        setTags(json.tags || "");
        setExampleNativeText(json.exampleNativeText || "");
        setExampleTranslation(json.exampleTranslation || "");
        if (json.slotValues) {
          setSlotValuesJson(JSON.stringify(json.slotValues, null, 2));
        }
      }
    } catch {
      // Ignore parse errors while typing
    }
  };

  const handleJsonSave = async () => {
    if (!jsonText.trim()) {
      alert("Please paste some JSON first.");
      return;
    }

    try {
      const json = JSON.parse(jsonText);
      if (Array.isArray(json)) {
        alert("Please provide a single JSON object, not an array.");
        return;
      }
      if (!json.template) {
        alert("Invalid structure: The object must contain a 'template' field.");
        return;
      }

      const parsedSlots = json.slotValues && Array.isArray(json.slotValues) ? json.slotValues : [];

      await savePattern({
        id: editingId ?? undefined,
        languageId: selectedLanguageId,
        template: json.template,
        patternType: json.patternType || null,
        tags: json.tags || null,
        exampleNativeText: json.exampleNativeText || null,
        exampleTranslation: json.exampleTranslation || null,
        slotValues: parsedSlots,
      });

      alert("Pattern successfully saved!");
      setJsonText("");
      refreshData();
      resetForm();
    } catch (e) {
      alert("Error saving pattern from JSON. Please ensure it is a valid format.");
    }
  };

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

  const isManualValid = template.trim().length > 0;
  let isJsonValid = false;
  try {
    const j = JSON.parse(jsonText);
    if (j && !Array.isArray(j) && j.template && j.template.trim().length > 0) {
      isJsonValid = true;
    }
  } catch (e) {
    isJsonValid = false;
  }

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

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Select Language</label>
          <select
            value={selectedLanguageId}
            onChange={e => setSelectedLanguageId(Number(e.target.value))}
            className="w-full p-2.5 rounded border border-black/10 bg-white text-sm outline-none"
          >
            {languages.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        
        {/* Mode Tabs */}
        <div className="flex border-b border-black/5 gap-4 mb-4">
          <button
            type="button"
            onClick={() => setFormMode("manual")}
            className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              formMode === "manual"
                ? "border-[#b84a1e] text-[#b84a1e]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setFormMode("json")}
            className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              formMode === "json"
                ? "border-[#b84a1e] text-[#b84a1e]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Paste JSON
          </button>
        </div>

        {formMode === "manual" ? (
        <form onSubmit={handleSave} className="flex flex-col gap-4">
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
              <option value="imperative">Imperative</option>
              <option value="conditional">Conditional</option>
              <option value="comparative">Comparative</option>
              <option value="exclamatory">Exclamatory</option>
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
            <button 
              type="submit" 
              disabled={!isManualValid}
              className={`flex-1 py-2.5 text-white text-sm rounded font-bold transition-all ${isManualValid ? "bg-[#b84a1e] hover:opacity-90" : "bg-gray-400 opacity-50 cursor-not-allowed"}`}
            >
              {editingId ? "Save Changes" : "Add Pattern"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-black/5 hover:bg-black/10 text-sm rounded font-semibold transition-all">
                Cancel
              </button>
            )}
          </div>
        </form>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end mb-1">
              <label className="block text-xs font-semibold text-gray-500">Paste JSON Object</label>
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="flex items-center gap-1 text-[10px] font-bold text-[#b84a1e] hover:text-[#a6421a] hover:bg-[#b84a1e]/10 px-2 py-1 rounded transition-all"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy Template"}
              </button>
            </div>
            <textarea
              rows={15}
              placeholder={jsonTemplateStr}
              value={jsonText}
              onChange={handleJsonTextChange}
              className="w-full p-2.5 rounded border border-black/10 text-xs font-mono outline-none text-[#1a1208] bg-white resize-y"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleJsonSave}
                disabled={!isJsonValid}
                className={`w-full py-2 text-white text-xs font-bold rounded shadow-sm transition-all ${isJsonValid ? "bg-[#b84a1e] hover:bg-[#a6421a]" : "bg-gray-400 opacity-50 cursor-not-allowed"}`}
              >
                Save from JSON
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-black/5 hover:bg-black/10 text-sm rounded font-semibold transition-all">
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
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
