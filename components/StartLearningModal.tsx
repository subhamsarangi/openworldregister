"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getLanguages, LanguageConfig } from "../app/actions/languages";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StartLearningModal({ isOpen, onClose }: ModalProps) {
  const [show, setShow] = useState(false);
  const [languages, setLanguages] = useState<LanguageConfig[]>([]);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = "hidden";
      if (languages.length === 0) {
        getLanguages().then((data) => {
          setLanguages(data.filter(l => l.isActive));
        });
      }
    } else {
      setTimeout(() => setShow(false), 300); // fade out duration
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen && !show) return null;

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

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: "#f5efe3", color: "#b84a1e", fontSize: "2rem" }}>
            🌍
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a1208" }}>
            Choose Your Destination
          </h2>
          <p className="text-lg" style={{ color: "#6b5740" }}>
            Where would you like your language journey to begin?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {languages.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-500">Loading destinations...</div>
          ) : (
            languages.map((lang) => (
              <Link 
                key={lang.id} 
                href={`/learn/${lang.id}`}
                className="group flex items-center justify-between p-4 rounded-xl transition-all hover:-translate-y-1"
                style={{ backgroundColor: "#fffdf8", border: "1px solid rgba(107, 87, 64, 0.1)", boxShadow: "0 4px 12px rgba(26, 18, 8, 0.03)" }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{lang.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg" style={{ color: "#1a1208" }}>{lang.name}</span>
                    <span className="text-sm" style={{ color: "#6b5740" }}>{lang.native}</span>
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
  );
}
