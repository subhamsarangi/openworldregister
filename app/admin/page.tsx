"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLanguages, LanguageConfig } from "../actions/languages";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";
import { LanguagesTab } from "./_components/LanguagesTab";
import { LettersTab } from "./_components/LettersTab";
import { WordsTab } from "./_components/WordsTab";
import { PatternsTab } from "./_components/PatternsTab";

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab") as TabType | null;
    if (tabParam && ["languages", "letters", "words", "patterns"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    window.history.replaceState({}, "", url.toString());
  };

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
                onClick={() => handleTabChange(tab.id as TabType)}
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
