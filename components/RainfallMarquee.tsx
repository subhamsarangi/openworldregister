"use client";

import React, { useMemo } from 'react';

const GLYPHS = ['あ','Ω','چ','汉','Ж','ß','Δ','ש','א','म','ঙ','ய','గ','ള','ฝ','ツ','ی','λ','Σ','Φ','क','خ','ع','ض','ญ','ฃ','ไ','æ','ø','å','ñ','ç'];

export function RainfallColumn({ speed = 20, delay = 0, opacity = 0.3 }: { speed?: number, delay?: number, opacity?: number }) {
  const columnElements = useMemo(() => {
    // blood red, dark olive, indigo, saffron, red wine
    const COLORS = ['#8a0303', '#556b2f', '#4b0082', '#c57e00', '#58111a'];
    const elements = [];
    for (let i = 0; i < 40; i++) {
      const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      elements.push(
        <span key={i} style={{ color }}>{char}{'\n'}</span>
      );
    }
    return elements;
  }, []);

  return (
    <div className="w-8 h-full overflow-hidden relative flex justify-center" style={{ opacity }}>
      <style>{`
        @keyframes rainfall-anim {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0%); }
        }
        .rainfall-column {
          position: absolute;
          top: 0;
          display: flex;
          flex-direction: column;
          white-space: pre-wrap;
          text-align: center;
          line-height: 2.2;
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          text-shadow: 0px 4px 12px rgba(26, 18, 8, 0.6);
          animation: rainfall-anim linear infinite;
        }
      `}</style>
      <div 
        className="rainfall-column" 
        style={{ animationDuration: `${speed}s`, animationDelay: `-${delay}s` }}
      >
        {columnElements}
        {columnElements}
      </div>
    </div>
  );
}
