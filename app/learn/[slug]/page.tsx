import React from 'react';
import Link from 'next/link';

const COMING_SOON_DATA: Record<string, { native: string, phonetic: string, english: string }> = {
  french: {
    native: 'Bientôt disponible',
    phonetic: 'bee-en-toe dis-po-nee-bl',
    english: 'Coming soon',
  },
  japanese: {
    native: '近日公開',
    phonetic: 'kin-jitsu kou-kai',
    english: 'Coming soon',
  },
  spanish: {
    native: 'Próximamente',
    phonetic: 'prohk-see-mah-men-teh',
    english: 'Coming soon',
  },
  arabic: {
    native: 'قريباً',
    phonetic: 'qa-ree-ban',
    english: 'Coming soon',
  },
  hindi: {
    native: 'जल्द आ रहा है',
    phonetic: 'jald aa raha hai',
    english: 'Coming soon',
  },
  russian: {
    native: 'Скоро',
    phonetic: 'sko-ra',
    english: 'Coming soon',
  },
  german: {
    native: 'Bald verfügbar',
    phonetic: 'bahlt fair-foog-bar',
    english: 'Coming soon',
  },
  chinese: {
    native: '即将推出',
    phonetic: 'jee-jeeang tway-choo',
    english: 'Coming soon',
  },
};

export default async function LearnLanguagePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();
  
  const data = COMING_SOON_DATA[slug] || {
    native: 'Coming soon',
    phonetic: 'kuh-ming soon',
    english: 'Coming soon',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf6ee] text-[#1a1208] p-4 text-center relative">
      <Link href="/" className="absolute top-8 left-8 text-[#b84a1e] hover:underline">
        &larr; Back to Map
      </Link>
      
      <div className="absolute top-8 right-8 text-3xl font-extrabold" style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-0.02em" }}>
        <span style={{ color: '#8a0303' }}>L</span>
        <span style={{ color: '#556b2f' }}>a</span>
        <span style={{ color: '#4b0082' }}>n</span>
        <span style={{ color: '#c57e00' }}>g</span>
        <span style={{ color: '#58111a' }}>t</span>
        <span style={{ color: '#333333' }}>o</span>
        <span style={{ color: '#333333' }}>o</span>
      </div>

      <div className="flex flex-col gap-8 items-center max-w-4xl mt-16">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight" style={{ color: '#8a0303' }}>
          {data.english}
        </h1>
        
        <h2 className="text-5xl md:text-7xl font-bold" style={{ color: '#556b2f' }}>
          {data.native}
        </h2>
        
        <p className="text-4xl md:text-6xl italic" style={{ color: '#6b5740' }}>
          "{data.phonetic}"
        </p>
      </div>
    </div>
  );
}
