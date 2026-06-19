"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function OWRClient() {
  useEffect(() => {
    // Inject the script manually to guarantee it loads even on client-side navigation
    if (!document.querySelector('script[src="https://unpkg.com/globe.gl@2/dist/globe.gl.min.js"]')) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/globe.gl@2/dist/globe.gl.min.js";
      document.head.appendChild(script);
    }

    // 1. Initialize Globe
    let retryCount = 0;
    const initGlobe = () => {
      const el = document.getElementById("hero-globe");
      if (!el) {
        if (retryCount < 50) {
          retryCount++;
          setTimeout(initGlobe, 100);
        }
        return;
      }

      // Prevent double initialization
      if (el.innerHTML !== "" && !el.querySelector(".globe-spinner")) return;

      if (typeof (window as any).Globe === "undefined") {
        if (retryCount < 50) {
          retryCount++;
          setTimeout(initGlobe, 100);
        }
        return;
      }

      const Globe = (window as any).Globe;

      const w = el.offsetWidth || 480;
      const h = el.offsetHeight || 480;

      const pins = [
        { lat: 35.68, lng: 139.69, flag: "🇯🇵", name: "Japan", sub: "47 Prefectures", tag: "East Asia" },
        { lat: -15.79, lng: -47.88, flag: "🇧🇷", name: "Brazil", sub: "26 States + DF", tag: "South America" },
        { lat: 22.57, lng: 88.36, flag: "🇮🇳", name: "India", sub: "28 States + 8 UTs", tag: "South Asia" },
        { lat: 38.89, lng: -77.03, flag: "🇺🇸", name: "United States", sub: "50 States + DC", tag: "North America" },
        { lat: 50.45, lng: 30.52, flag: "🇺🇦", name: "Ukraine", sub: "25 Oblasts", tag: "Eastern Europe" },
        { lat: -1.29, lng: 36.82, flag: "🇰🇪", name: "Kenya", sub: "47 Counties", tag: "East Africa" },
      ];

      function makeCard(d: any) {
        const wrap = document.createElement("div");
        wrap.className = "globe-pin-card";
        wrap.innerHTML = `
          <div class="globe-pin-dot"></div>
          <div class="globe-pin-body">
            <span class="globe-pin-flag">${d.flag}</span>
            <span class="globe-pin-name">${d.name}</span>
            <span class="globe-pin-sub">${d.sub}</span>
            <span class="globe-pin-tag">${d.tag}</span>
          </div>`;
        return wrap;
      }

      el.innerHTML = ""; // clear spinner

      const globe = Globe({ animateIn: false })(el)
        .width(w)
        .height(h)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-day.jpg")
        .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
        .atmosphereColor("#e8c96a")
        .atmosphereAltitude(0.18)
        .pointOfView({ lat: 20, lng: 10, altitude: 1.8 })
        .htmlElementsData(pins)
        .htmlElement(makeCard)
        .htmlAltitude(0.02)
        .onGlobeReady(() => {
          const spinner = document.getElementById("globe-spinner");
          if (spinner) spinner.style.display = "none";
        });

      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.6;
      globe.controls().enableZoom = false;
    };

    initGlobe();

    // 2. Initialize Intersection Observers (re-attaches on client navigation)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));

    // 3. Initialize Tabs
    document.querySelectorAll(".content-tab").forEach((tab) => {
      // Clone node to drop old event listeners
      const newTab = tab.cloneNode(true) as HTMLElement;
      if (tab.parentNode) {
        tab.parentNode.replaceChild(newTab, tab);
      }
      newTab.addEventListener("click", function () {
        document.querySelectorAll(".content-tab").forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        this.classList.add("active");
        this.setAttribute("aria-selected", "true");
      });
    });
  }, []);

  return (
    <>
      <Script src="/owr-scripts.js" strategy="lazyOnload" />
    </>
  );
}
