"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { getPatterns, savePattern, deletePattern, DBPattern } from "../../actions/adminActions";
import { LanguageConfig } from "../../actions/languages";
import { FormPanel } from "./FormPanel";

export interface ContentTabProps {
  languages: LanguageConfig[];
  selectedLanguageId: number;
  setSelectedLanguageId: (id: number) => void;
  selectedLang?: LanguageConfig;
}

export function PatternsTab({ languages, selectedLanguageId, setSelectedLanguageId, selectedLang }: ContentTabProps) {
  const [patterns, setPatterns] = useState<DBPattern[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(true);

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

  const resetForm = () => {
    setTemplate(""); setTags(""); setPatternType(""); setExampleNativeText(""); setExampleTranslation("");
    setSlotValuesJson(JSON.stringify([{ slotValue: "French", transliteration: "français", translation: "French" }], null, 2));
    setEditingId(null);
  };

  const jsonTemplateStr = `{
  "template": "¿Estás ___?",
  "patternType": "affirmative | interrogative | negative | modal | imperative | conditional | comparative | exclamatory",
  "tense": "present",
  "tags": "basic",
  "exampleNativeText": "¿Estás feliz?",
  "exampleTranslation": "Are you happy?",
  "slotValues": [
    { "slotValue": "feliz", "transliteration": "feliz", "translation": "happy", "sortOrder": 0 },
    { "slotValue": "ocupado", "transliteration": "ocupado", "translation": "busy", "sortOrder": 1 },
    { "slotValue": "bien", "transliteration": "bien", "translation": "okay", "sortOrder": 2 }
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
        if (json.slotValues) setSlotValuesJson(JSON.stringify(json.slotValues, null, 2));
      }
    } catch { /* ignore parse errors while typing */ }
  };

  const handleJsonSave = async () => {
    if (!jsonText.trim()) { alert("Please paste some JSON first."); return; }
    try {
      const json = JSON.parse(jsonText);
      if (Array.isArray(json)) { alert("Please provide a single JSON object, not an array."); return; }
      if (!json.template) { alert("Invalid structure: The object must contain a 'template' field."); return; }
      const parsedSlots = json.slotValues && Array.isArray(json.slotValues) ? json.slotValues : [];
      await savePattern({ id: editingId ?? undefined, languageId: selectedLanguageId, template: json.template, patternType: json.patternType || null, tags: json.tags || null, exampleNativeText: json.exampleNativeText || null, exampleTranslation: json.exampleTranslation || null, slotValues: parsedSlots });
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
      setLoadingData(true);
      getPatterns(selectedLanguageId).then((data) => {
        setPatterns(data);
        setLoadingData(false);
      });
    }
  };

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguageId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) { alert("Pattern Template is required"); return; }
    let parsedSlots: { slotValue: string; transliteration?: string; translation?: string }[] = [];
    try { parsedSlots = JSON.parse(slotValuesJson || "[]"); }
    catch { alert("Invalid JSON in slot values."); return; }
    try {
      await savePattern({ id: editingId ?? undefined, languageId: selectedLanguageId, template, patternType: patternType || null, tags: tags || null, exampleNativeText: exampleNativeText || null, exampleTranslation: exampleTranslation || null, slotValues: parsedSlots });
      refreshData(); resetForm();
    } catch (e) { alert("Error saving pattern."); }
  };

  const handleEdit = (item: DBPattern) => {
    setEditingId(item.id ?? null);
    setTemplate(item.template);
    setTags(item.tags ?? "");
    setPatternType(item.patternType ?? "");
    setExampleNativeText(item.exampleNativeText ?? "");
    setExampleTranslation(item.exampleTranslation ?? "");
    setSlotValuesJson(JSON.stringify(item.slotValues ?? [], null, 2));
    setIsFormVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this pattern?")) {
      try { await deletePattern(id); refreshData(); }
      catch (e) { alert("Error deleting pattern"); }
    }
  };

  const isManualValid = template.trim().length > 0;
  let isJsonValid = false;
  try {
    const j = JSON.parse(jsonText);
    if (j && !Array.isArray(j) && j.template && j.template.trim().length > 0) isJsonValid = true;
  } catch (e) { isJsonValid = false; }

  if (selectedLang && !selectedLang.patternsApplicable) {
    return (
      <div className="bg-[#fffdf8] p-8 rounded-2xl shadow-sm border border-black/5 text-center">
        <h2 className="text-xl font-bold mb-2">Sentence Patterns Editor</h2>
        <p className="text-gray-500">This tab is marked as **Not Applicable** for {selectedLang.name}. Enable it in the Languages tab first.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Language Filter Bar */}
      <div className="bg-[#fffdf8] px-5 py-3.5 rounded-xl border border-black/5 shadow-sm flex items-center gap-4 flex-wrap sm:flex-nowrap">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Working on</span>
        <select value={selectedLanguageId} onChange={e => setSelectedLanguageId(Number(e.target.value))} className="flex-1 max-w-xs p-2 rounded border border-black/10 bg-white text-sm font-semibold outline-none text-[#1a1208] cursor-pointer">
          {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        {selectedLang && <span className="text-xs text-gray-500">{selectedLang.nativeName} · {selectedLang.iso6393?.toUpperCase()}</span>}
        <div className="sm:ml-auto">
          <Link
            href="/admin/category-grouper"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#b84a1e]/8 hover:bg-[#b84a1e]/15 text-[#b84a1e] font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
          >
            📋 Category Grouper Tool
          </Link>
        </div>
      </div>

      <FormPanel
        isVisible={isFormVisible}
        onHide={() => setIsFormVisible(false)}
        onShow={() => setIsFormVisible(true)}
        title={editingId ? "Edit Pattern" : "Add New Pattern"}
        listTitle="Current Patterns List"
        listCount={patterns.length}
        listChildren={
          loadingData ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 rounded-full border-4 border-black/10 border-t-[#b84a1e] animate-spin" />
            </div>
          ) : patterns.length === 0 ? (
            <div className="py-12 text-center text-gray-500 border-2 border-dashed border-black/5 rounded-xl">No patterns added yet.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {patterns.map((item) => (
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
                      <span key={idx} className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-[#faf6ee] text-[#6b5740] border border-black/5">#{tag}</span>
                    ))}
                    {item.patternType && <span className="px-2 py-0.5 rounded-full text-[0.62rem] font-bold bg-blue-50 text-blue-700 border border-blue-100">{item.patternType}</span>}
                  </div>
                  {item.slotValues && item.slotValues.length > 0 && (
                    <div className="text-xs border-t border-black/5 pt-2.5 mt-2">
                      <span className="font-semibold text-gray-500 block mb-1">Slot Variations:</span>
                      <div className="flex flex-wrap gap-1.5 text-gray-600 bg-black/2 p-2 rounded">
                        {item.slotValues.slice(0, 4).map((sv: { slotValue: string; transliteration?: string; translation?: string }, svIdx: number) => (
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
              ))}
            </div>
          )
        }
      >
        {/* Mode Tabs */}
        <div className="flex border-b border-black/5 gap-4 mb-4">
          <button type="button" onClick={() => setFormMode("manual")} className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${formMode === "manual" ? "border-[#b84a1e] text-[#b84a1e]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>Manual Entry</button>
          <button type="button" onClick={() => setFormMode("json")} className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${formMode === "json" ? "border-[#b84a1e] text-[#b84a1e]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>Paste JSON</button>
        </div>

        {formMode === "manual" ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Pattern Template</label>
              <input type="text" placeholder="e.g. Are you ___?" value={template} onChange={e => setTemplate(e.target.value)} className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]" />
              <p className="text-[0.68rem] text-gray-400 mt-1">Use `___` (3 underscores) to specify the blank slot.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Pattern Type (Optional)</label>
              <select value={patternType} onChange={e => setPatternType(e.target.value)} className="w-full p-2.5 rounded border border-black/10 bg-white text-sm outline-none">
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
              <input type="text" placeholder="e.g. greetings, basic, question" value={tags} onChange={e => setTags(e.target.value)} className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Example Sentence (Native)</label>
              <input type="text" placeholder="e.g. Tu es français?" value={exampleNativeText} onChange={e => setExampleNativeText(e.target.value)} className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Example Translation (English)</label>
              <input type="text" placeholder="e.g. Are you French?" value={exampleTranslation} onChange={e => setExampleTranslation(e.target.value)} className="w-full p-2.5 rounded border border-black/10 text-sm outline-none text-[#1a1208]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Slot Values (JSON array)</label>
              <textarea rows={6} placeholder='[{"slotValue":"French","transliteration":"français","translation":"French"}]' value={slotValuesJson} onChange={e => setSlotValuesJson(e.target.value)} className="w-full p-2.5 rounded border border-black/10 text-xs font-mono outline-none text-[#1a1208] bg-[#faf6ee]" />
              <p className="text-[0.68rem] text-gray-400 mt-1">Each object: slotValue (required), transliteration, translation (optional)</p>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" disabled={!isManualValid} className={`flex-1 py-2.5 text-white text-sm rounded font-bold transition-all ${isManualValid ? "bg-[#b84a1e] hover:opacity-90" : "bg-gray-400 opacity-50 cursor-not-allowed"}`}>
                {editingId ? "Save Changes" : "Add Pattern"}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-black/5 hover:bg-black/10 text-sm rounded font-semibold transition-all">Cancel</button>}
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end mb-1">
              <label className="block text-xs font-semibold text-gray-500">Paste JSON Object</label>
              <button type="button" onClick={handleCopyTemplate} className="flex items-center gap-1 text-[10px] font-bold text-[#b84a1e] hover:text-[#a6421a] hover:bg-[#b84a1e]/10 px-2 py-1 rounded transition-all">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy Template"}
              </button>
            </div>
            <textarea rows={15} placeholder={jsonTemplateStr} value={jsonText} onChange={handleJsonTextChange} className="w-full p-2.5 rounded border border-black/10 text-xs font-mono outline-none text-[#1a1208] bg-white resize-y" />
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={handleJsonSave} disabled={!isJsonValid} className={`w-full py-2 text-white text-xs font-bold rounded shadow-sm transition-all ${isJsonValid ? "bg-[#b84a1e] hover:bg-[#a6421a]" : "bg-gray-400 opacity-50 cursor-not-allowed"}`}>
                Save from JSON
              </button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-black/5 hover:bg-black/10 text-sm rounded font-semibold transition-all">Cancel</button>}
            </div>
          </div>
        )}
      </FormPanel>
    </div>
  );
}
