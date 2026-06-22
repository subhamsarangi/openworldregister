"use client";
import React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface FormPanelProps {
  isVisible: boolean;
  onHide: () => void;
  onShow: () => void;
  title: string;
  listTitle: string;
  listCount: number;
  listHeaderExtra?: React.ReactNode;
  children: React.ReactNode;
  listChildren: React.ReactNode;
}

export function FormPanel({
  isVisible,
  onHide,
  onShow,
  title,
  listTitle,
  listCount,
  listHeaderExtra,
  children,
  listChildren,
}: FormPanelProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start overflow-hidden">
      {/* Sliding Form Column */}
      <div
        className={`flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isVisible
            ? "w-full lg:w-[320px] xl:w-[380px] gap-8 opacity-100"
            : "w-0 h-0 lg:h-auto opacity-0"
        }`}
      >
        <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col gap-8 pb-4">
          <div className="bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 h-fit relative">
            <button
              type="button"
              onClick={onHide}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-[#b84a1e] hover:bg-[#b84a1e]/10 rounded-md transition-all"
              title="Hide Form"
            >
              <PanelLeftClose size={18} />
            </button>
            <h3
              className="text-lg font-bold mb-4 pr-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {title}
            </h3>
            {children}
          </div>
        </div>
      </div>

      {/* List Panel (grows to fill space) */}
      <div className="flex-1 min-w-0 w-full bg-[#fffdf8] p-6 rounded-2xl shadow-sm border border-black/5 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {!isVisible && (
              <button
                type="button"
                onClick={onShow}
                className="p-1.5 text-gray-500 hover:text-[#b84a1e] hover:bg-[#b84a1e]/10 rounded-md transition-all shadow-sm bg-white border border-black/5"
                title="Show Form"
              >
                <PanelLeftOpen size={16} />
              </button>
            )}
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {listTitle} ({listCount})
            </h3>
          </div>
          {listHeaderExtra}
        </div>
        {listChildren}
      </div>
    </div>
  );
}
