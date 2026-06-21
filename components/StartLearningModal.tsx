"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getLanguagesFromManifest, LanguageConfig } from "../app/actions/languages";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StartLearningModal({ isOpen, onClose }: ModalProps) {
  const [show, setShow] = useState(false);
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = "hidden";
      if (languages.length === 0) {
        getLanguagesFromManifest().then((data) => {
          setLanguages(data.filter(l => l.isActive));
        });
      }
    } else {
      setTimeout(() => setShow(false), 300); // fade out duration
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen && !show) return null;

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${isOpen ? "opacity-100 backdrop-blur-md" : "opacity-0 backdrop-blur-none"}`}
      style={{ backgroundColor: "rgba(26, 18, 8, 0.6)" }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div 
        className={`relative w-11/12 max-w-2xl rounded-2xl p-8 md:p-12 shadow-2xl transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}
        style={{ backgroundColor: "#faf6ee", border: "1px solid rgba(184, 74, 30, 0.2)" }}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
          style={{ color: "#1a1208", fontSize: "1.2rem" }}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ backgroundColor: "#f5efe3", color: "#b84a1e", fontSize: "1.8rem" }}>
            🌍
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a1208" }}>
            Choose Your Language
          </h2>
          <p className="text-sm md:text-base text-gray-500">
            Which language would you like to start learning?
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="Search by language or native name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm text-[#1a1208] transition-all bg-white"
              style={{ 
                borderColor: "rgba(107, 87, 64, 0.15)",
                boxShadow: "0 2px 8px rgba(26, 18, 8, 0.02)"
              }}
            />
          </div>
        </div>

        {/* Scrollable Container wrapper */}
        <div 
          className="max-h-80 overflow-y-auto pr-1"
          style={{ 
            scrollbarWidth: "thin", 
            scrollbarColor: "rgba(184, 74, 30, 0.3) transparent" 
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">Loading languages...</div>
            ) : filteredLanguages.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
                No languages match your search.
              </div>
            ) : (
              filteredLanguages.map((lang) => (
                <Link 
                  key={lang.id} 
                  href={`/learn/${lang.id}`}
                  className="group flex items-center justify-between p-4 rounded-xl transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: "#fffdf8", border: "1px solid rgba(107, 87, 64, 0.1)", boxShadow: "0 4px 12px rgba(26, 18, 8, 0.03)" }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-bold text-base" style={{ color: "#1a1208" }}>{lang.name}</span>
                      <span className="text-xs" style={{ color: "#6b5740" }}>{lang.nativeName}</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors group-hover:bg-[#b84a1e] group-hover:text-white" style={{ color: "#b84a1e", backgroundColor: "#f5efe3" }}>
                    →
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
