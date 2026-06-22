"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RainfallColumn } from "../components/RainfallMarquee";
import { StartLearningModal } from "../components/StartLearningModal";

const GlobeView = dynamic(() => import("../components/GlobeView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center" style={{ color: "#b84a1e" }}>
      Loading Earth...
    </div>
  ),
});

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.")) {
        setIsLocal(true);
      }
    }
  }, []);

  return (
    <main className="relative w-full min-h-screen flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-12 md:py-0 overflow-hidden" style={{ backgroundColor: "#faf6ee", color: "#1a1208", fontFamily: "'Lora', Georgia, serif" }}>
      <link rel="preload" as="image" href="https://unpkg.com/three-globe/example/img/earth-day.jpg" fetchPriority="high" />
      <link rel="preload" as="image" href="https://unpkg.com/three-globe/example/img/earth-topology.png" fetchPriority="high" />
      {/* Background pattern similar to OWR */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(200,154,46,0.08) 0%, transparent 60%)" }}></div>

      {/* Left Column (Top on mobile) */}
      <div className="relative z-10 w-full md:w-[35%] min-[1366px]:w-[25%] flex flex-col items-center md:items-start text-center md:text-left order-1 md:order-1 mb-6 md:mb-0">
        <div className="inline-flex items-center gap-2 mb-6" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#b84a1e" }}>
          <span className="w-8 h-px bg-[#b84a1e] hidden md:block"></span>
          Open World Register
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}>
          <span style={{ color: '#8a0303' }}>L</span>
          <span style={{ color: '#556b2f' }}>a</span>
          <span style={{ color: '#4b0082' }}>n</span>
          <span style={{ color: '#c57e00' }}>g</span>
          <span style={{ color: '#58111a' }}>t</span>
          <span style={{ color: '#333333' }}>o</span>
          <span style={{ color: '#333333' }}>o</span>: <br className="hidden md:block" />
          <em style={{ color: "#b84a1e", fontStyle: "italic" }}>you can learn a language too.</em>
        </h1>
        
        <p className="text-base md:text-lg mb-8 max-w-sm leading-relaxed" style={{ color: "#6b5740" }}>
          Immerse yourself in new cultures and words natively. Click a pin on the globe to begin your journey.
        </p>

        <div className="flex flex-col gap-4 w-full md:w-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 rounded transition-all hover:-translate-y-0.5 shadow text-center" style={{ backgroundColor: "#1a1208", color: "#fffdf8", fontSize: "0.88rem", fontWeight: 500, letterSpacing: "0.04em" }}>
            Start Learning &rarr;
          </button>
          
          {isLocal && (
            <Link 
              href="/admin" 
              className="text-xs text-center md:text-left hover:underline opacity-60 hover:opacity-100 transition-opacity mt-1 flex items-center justify-center md:justify-start gap-1"
              style={{ color: "#6b5740" }}
            >
              ⚙️ Admin Portal (Local Only)
            </Link>
          )}
        </div>
      </div>

      {/* Center Globe (Middle on mobile, takes remaining space on tablet, exactly 50% on desktop) */}
      <div className="relative z-0 w-full h-[55vh] md:h-screen flex-1 min-[1366px]:flex-none min-[1366px]:w-[50%] flex items-center justify-between order-2 md:order-2 overflow-hidden my-4 md:my-0">
        
        {/* Mobile Left Rainfall */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 h-[80%] min-[1366px]:hidden z-20 pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }}>
          <RainfallColumn speed={20} delay={3} opacity={0.6} />
        </div>

        {/* Globe Container */}
        <div className="absolute inset-0 z-10">
          <GlobeView />
        </div>

        {/* Mobile Right Rainfall */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 h-[80%] min-[1366px]:hidden z-20 pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }}>
          <RainfallColumn speed={24} delay={8} opacity={0.5} />
        </div>

      </div>

      {/* Right Column (Placeholder to keep globe perfectly centered on desktop only) */}
      <div className="relative z-10 hidden min-[1366px]:flex min-[1366px]:w-[25%] flex-row justify-center items-center gap-12 order-3 h-[70vh]" style={{ maskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)" }}>
        <RainfallColumn speed={28} delay={0} opacity={0.4} />
        <RainfallColumn speed={20} delay={7} opacity={0.7} />
        <RainfallColumn speed={35} delay={14} opacity={0.3} />
      </div>

      <StartLearningModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
