"use client";

import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { useRouter } from "next/navigation";
import { getLanguagesFromManifest } from "../app/actions/languages";

export default function GlobeView() {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const initializedRef = useRef(false);
  const router = useRouter();
  const [globeLanguages, setGlobeLanguages] = useState<any[]>([]);

  // Load languages dynamically from manifest / DB fallback
  useEffect(() => {
    getLanguagesFromManifest().then((data) => {
      const activeLangs = data
        .filter(l => l.isActive)
        .map(l => ({
          lat: l.latitude,
          lng: l.longitude,
          name: l.name,
          code: l.slug,
          flag: l.flag
        }));
      setGlobeLanguages(activeLangs);
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (globeRef.current && dimensions.width > 0 && !initializedRef.current) {
      globeRef.current.controls().autoRotate = true;
      // Negative speed makes the surface move from left to right (West to East), which is the scientifically accurate rotation of the Earth.
      globeRef.current.controls().autoRotateSpeed = -0.6;
      globeRef.current.controls().enableZoom = true;
      
      // Set initial zoom dynamically based on aspect ratio to guarantee it's as big as possible without clipping width
      const aspectRatio = dimensions.width / dimensions.height;
      const altitude = aspectRatio < 1 ? 2.0 / aspectRatio : 2.0;
      globeRef.current.pointOfView({ lat: 20, lng: 10, altitude });
      initializedRef.current = true;
    } else if (globeRef.current) {
      globeRef.current.controls().enableZoom = true;
    }
  }, [dimensions.width, dimensions.height]);

  // Dynamically update pin length and direction
  useEffect(() => {
    if (!containerRef.current) return;
    
    let animationFrameId: number;
    const updatePins = () => {
      const containerRect = containerRef.current!.getBoundingClientRect();
      const cx = containerRect.left + containerRect.width / 2;
      const cy = containerRect.top + containerRect.height / 2;
      
      const wrappers = document.querySelectorAll('.lang-pin-wrapper');
      wrappers.forEach(wrapper => {
        const line = wrapper.querySelector('.lang-pin-line') as HTMLElement;
        const box = wrapper.querySelector('.lang-pin-box') as HTMLElement;
        if (!line || !box) return;
        
        const rect = wrapper.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return; // Hidden on back of globe
        
        // globe.gl centers the element on the coordinate
        const px = rect.left + rect.width / 2;
        const py = rect.top + rect.height / 2;
        
        const dx = px - cx;
        const dy = py - cy;
        
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.min(containerRect.width, containerRect.height) / 2;
        const length = Math.max(2, Math.min(36, (dist / maxDist) * 45));
        
        line.style.height = `${length}px`;
        line.style.transform = `translate(-50%, 0) rotate(${angle}deg)`;
        box.style.transform = `translate(-50%, -2px) rotate(${-angle}deg)`;
      });
      
      animationFrameId = requestAnimationFrame(updatePins);
    };
    
    updatePins();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleZoomIn = () => {
    if (globeRef.current) {
      const currentAlt = globeRef.current.pointOfView().altitude;
      globeRef.current.pointOfView({ altitude: Math.max(0.5, currentAlt - 0.5) }, 400);
    }
  };

  const handleZoomOut = () => {
    if (globeRef.current) {
      const currentAlt = globeRef.current.pointOfView().altitude;
      globeRef.current.pointOfView({ altitude: Math.min(5, currentAlt + 0.5) }, 400);
    }
  };

  const htmlElement = (d: any) => {
    const el = document.createElement("div");
    el.innerHTML = `
      <div class="lang-pin-wrapper" style="position:relative; width:0; height:0; display:flex; justify-content:center; align-items:center;">
        <div class="lang-pin-line" style="width:2px; height:24px; background:#b84a1e; transform-origin:bottom center; position:absolute; bottom:0; left:50%; transform:translate(-50%, 0);">
          <div class="lang-pin-box" style="position:absolute; bottom:100%; left:50%; transform:translate(-50%, -2px); pointer-events:auto; cursor:pointer;">
            <div style="background:#fffdf8;border:2px solid #b84a1e;border-radius:4px;padding:4px 8px;white-space:nowrap;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
              <span style="font-family:'Playfair Display',serif;font-size:0.85rem;font-weight:700;color:#1a1208;line-height:1.2;text-align:center;">${d.name}</span>
            </div>
          </div>
        </div>
        <div style="width:6px;height:6px;border-radius:50%;background:#b84a1e;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);z-index:2;box-shadow:0 0 4px rgba(184,74,30,0.8);"></div>
      </div>
    `;
    el.onclick = () => {
      router.push(`/learn/${d.code}`);
    };
    return el;
  };

  return (
    <div ref={containerRef} className="absolute inset-0 flex items-center justify-center">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-day.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          htmlElementsData={globeLanguages}
          htmlAltitude={0}
          htmlElement={htmlElement}
          atmosphereColor="#e8c96a"
          atmosphereAltitude={0.18}
        />
      )}
      
      {/* Zoom Controls Overlay */}
      <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 flex flex-row gap-2 z-10">
        <button 
          onClick={handleZoomIn} 
          className="w-10 h-10 bg-[#fffdf8] border border-[rgba(60,40,10,0.14)] rounded shadow flex items-center justify-center text-[#1a1208] text-xl font-bold hover:bg-[#f5efe3] transition-colors" 
          aria-label="Zoom In"
        >
          +
        </button>
        <button 
          onClick={handleZoomOut} 
          className="w-10 h-10 bg-[#fffdf8] border border-[rgba(60,40,10,0.14)] rounded shadow flex items-center justify-center text-[#1a1208] text-xl font-bold hover:bg-[#f5efe3] transition-colors" 
          aria-label="Zoom Out"
        >
          −
        </button>
      </div>
    </div>
  );
}
