"use client";
import { useEffect, useState } from "react";
import { getWords, saveWord, deleteWord, DBWord } from "../../actions/adminActions";
import { LanguageConfig } from "../../actions/languages";
import { FormPanel } from "./FormPanel";

export interface ContentTabProps {
  languages: LanguageConfig[];
  selectedLanguageId: number;
  setSelectedLanguageId: (id: number) => void;
  selectedLang?: LanguageConfig;
}

export function WordsTab({ languages, selectedLanguageId, setSelectedLanguageId, selectedLang }: ContentTabProps) {
  const [words, setWords] = useState<DBWord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Form states
  const [word, setWord] = useState("");
  const [transliteration, setTransliteration] = useState("");
  const [translation, setTranslation] = useState("");
  const [cefrLevel, setCefrLevel] = useState("A1");

  const refreshData = () => {
    if (selectedLanguageId) {
      setLoadingData(true);
      getWords(selectedLanguageId).then((data) => {
        setWords(data);
        setLoadingData(false);
      });
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
      await saveWord({ id: editingId ?? undefined, languageId: selectedLanguageId, word, transliteration, translation, cefrLevel });
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
    setIsFormVisible(true);
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

      <FormPanel
        isVisible={isFormVisible}
        onHide={() => setIsFormVisible(false)}
        onShow={() => setIsFormVisible(true)}
        title={editingId ? "Edit Word" : "Add New Word"}
        listTitle="Current Vocabulary List"
        listCount={words.length}
        listChildren={
          loadingData ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-[#b84a1e] animate-spin" />
            </div>
          ) : words.length === 0 ? (
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
          )
        }
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Word / Phrase</label>
            <input type="text" placeholder="e.g. Bonjour" value={word} onChange={e => setWord(e.target.value)} className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Romanized Spelling / Pronunciation</label>
            <input type="text" placeholder="e.g. bohn-zhoor" value={transliteration} onChange={e => setTransliteration(e.target.value)} className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">English Translation</label>
            <input type="text" placeholder="e.g. Hello / Good morning" value={translation} onChange={e => setTranslation(e.target.value)} className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">CEFR Level</label>
            <select value={cefrLevel} onChange={e => setCefrLevel(e.target.value)} className="w-full p-2.5 rounded border border-black/10 bg-white text-sm outline-none">
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
              <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-black/5 hover:bg-black/10 text-sm rounded font-semibold transition-all">Cancel</button>
            )}
          </div>
        </form>
      </FormPanel>
    </div>
  );
}
