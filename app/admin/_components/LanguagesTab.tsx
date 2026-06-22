"use client";
import React, { useState } from "react";
import { saveLanguage, updateLanguages, createLanguage, deleteLanguage, LanguageConfig } from "../../actions/languages";
import { LANGUAGE_FAMILIES_MAP, WRITING_SYSTEMS, getLanguageGlyph } from "./constants";

export interface LanguagesTabProps {
  languages: LanguageConfig[];
  setLanguages: React.Dispatch<React.SetStateAction<LanguageConfig[]>>;
  saving: boolean;
  setSaving: (s: boolean) => void;
  onRefresh: () => void;
}

export function LanguagesTab({ languages, setLanguages, saving, setSaving, onRefresh }: LanguagesTabProps) {
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
              onDragStart={() => { dragItem.current = idx; }}
              onDragEnter={() => { dragOverItem.current = idx; }}
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
