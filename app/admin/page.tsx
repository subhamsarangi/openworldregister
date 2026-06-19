"use client";
import React, { useEffect, useState } from "react";
import { getLanguages, updateLanguages, LanguageConfig } from "../actions/languages";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [auth, setAuth] = useState(false);
  
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf6ee]">
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            if (password === "admin") setAuth(true); 
            else alert("Incorrect password");
          }} 
          className="p-8 shadow-xl rounded-2xl w-full max-w-sm"
          style={{ backgroundColor: "#fffdf8", border: "1px solid rgba(184, 74, 30, 0.2)" }}
        >
          <div className="text-center mb-6">
            <span className="text-4xl">🌍</span>
            <h1 className="text-2xl font-bold mt-2" style={{ color: "#1a1208", fontFamily: "'Playfair Display', serif" }}>Admin Portal</h1>
          </div>
          <input 
            type="password" 
            placeholder="Password (hint: admin)"
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-3 rounded mb-4 outline-none"
            style={{ border: "1px solid rgba(107, 87, 64, 0.2)", backgroundColor: "#faf6ee" }}
          />
          <button className="w-full py-3 rounded text-white font-bold transition-transform hover:-translate-y-0.5" style={{ backgroundColor: "#b84a1e" }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLanguages().then(setLanguages);
  }, []);

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

  const handleSave = async () => {
    setSaving(true);
    await updateLanguages(languages);
    setSaving(false);
    alert("Saved successfully!");
  };

  return (
    <div className="min-h-screen py-12 px-6 bg-[#faf6ee]" style={{ color: "#1a1208", fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Featured Languages</h1>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="px-6 py-2 rounded text-white font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: "#b84a1e", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {languages.map((lang, idx) => (
            <div 
              key={lang.id} 
              className="flex items-center justify-between p-4 rounded-xl shadow-sm transition-all"
              style={{ backgroundColor: lang.isActive ? "#fffdf8" : "#f0ebd8", border: "1px solid rgba(107, 87, 64, 0.1)", opacity: lang.isActive ? 1 : 0.6 }}
            >
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1 bg-black/5 rounded p-1">
                  <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-gray-500 hover:text-black disabled:opacity-20 text-xs px-2 py-1 leading-none">▲</button>
                  <button onClick={() => moveDown(idx)} disabled={idx === languages.length - 1} className="text-gray-500 hover:text-black disabled:opacity-20 text-xs px-2 py-1 leading-none">▼</button>
                </div>
                <span className="text-4xl">{lang.flag}</span>
                <div>
                  <div className="font-bold text-lg">{lang.name}</div>
                  <div className="text-sm" style={{ color: "#6b5740" }}>{lang.native}</div>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded shadow-sm border border-black/5">
                  <input 
                    type="checkbox" 
                    checked={lang.isActive} 
                    onChange={() => toggleActive(idx)} 
                    className="w-4 h-4" 
                    style={{ accentColor: "#b84a1e" }}
                  />
                  <span className="font-medium text-sm">{lang.isActive ? "Visible" : "Hidden"}</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
