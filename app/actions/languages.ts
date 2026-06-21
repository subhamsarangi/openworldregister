"use server";

import fs from "fs/promises";
import path from "path";
import { supabase } from "../lib/supabase";

export type LanguageConfig = {
  id: number;          // serial PK from Supabase
  slug: string;        // human-readable key, e.g. "odia", "tamil"
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
  displayOrder: number;
  latitude: number;
  longitude: number;
  lettersApplicable: boolean;
  wordsApplicable: boolean;
  patternsApplicable: boolean;
  iso6391: string | null;
  iso6393: string;
  family: string | null;
  branch: string | null;
  writingSystem: string | null;
  totalSpeakers: number | null;
};

// ---------------------------------------------------------------------------
// Seeding — auto-populate from data/languages.json on first run
// ---------------------------------------------------------------------------
async function ensureSeeded() {
  const { count, error: countError } = await supabase
    .from("languages")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("ensureSeeded: could not count languages:", countError.message);
    return;
  }

  if ((count ?? 0) === 0) {
    try {
      const jsonPath = path.join(process.cwd(), "data", "languages.json");
      const jsonData = await fs.readFile(jsonPath, "utf-8");
      const initialLanguages = JSON.parse(jsonData);

      console.log("Auto-seeding languages table from languages.json...");
      for (let i = 0; i < initialLanguages.length; i++) {
        const lang = initialLanguages[i];
        const { error } = await supabase.from("languages").insert({
          iso_639_3: lang.iso3 ?? lang.id.slice(0, 3),  // proper ISO 639-3 code
          slug: lang.id,
          name: lang.name,
          native_name: lang.native,
          flag: lang.flag,
          is_active: lang.isActive ?? true,
          display_order: i,
          latitude: lang.latitude ?? 0,
          longitude: lang.longitude ?? 0,
          letters_applicable: true,
          words_applicable: true,
          patterns_applicable: true,
        });
        if (error) console.error(`Auto-seeding failed for ${lang.name}:`, error.message);
      }
      console.log("Auto-seeding complete.");
    } catch (err) {
      console.error("Auto-seeding failed:", err);
    }
  }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------
export async function getLanguages(): Promise<LanguageConfig[]> {
  try {
    await ensureSeeded();
    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return (data ?? []).map(mapRow);
  } catch (err) {
    console.error("Error reading languages from Supabase:", err);
    return [];
  }
}

export async function updateLanguages(languages: LanguageConfig[]) {
  try {
    for (let i = 0; i < languages.length; i++) {
      const lang = languages[i];
      const { error } = await supabase
        .from("languages")
        .update({
          name: lang.name,
          native_name: lang.nativeName,
          flag: lang.flag,
          latitude: lang.latitude,
          longitude: lang.longitude,
          is_active: lang.isActive,
          display_order: i,
          letters_applicable: lang.lettersApplicable ?? true,
          words_applicable: lang.wordsApplicable ?? true,
          patterns_applicable: lang.patternsApplicable ?? true,
          family: lang.family || null,
          branch: lang.branch || null,
          writing_system: lang.writingSystem || null,
          total_speakers: lang.totalSpeakers || null,
          iso_639_1: lang.iso6391 || null,
          iso_639_3: lang.iso6393,
        })
        .eq("id", lang.id);

      if (error) throw error;
    }
    return { success: true };
  } catch (err) {
    console.error("Error updating languages in Supabase:", err);
    return { success: false, error: String(err) };
  }
}

export async function createLanguage(lang: {
  slug: string;
  iso6391?: string;
  iso6393: string;
  name: string;
  nativeName: string;
  flag: string;
  latitude: number;
  longitude: number;
  family?: string;
  branch?: string;
  writingSystem?: string;
  totalSpeakers?: number;
}) {
  try {
    // Check slug uniqueness
    const { data: existing } = await supabase
      .from("languages")
      .select("id")
      .eq("slug", lang.slug.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return { success: false, error: "A language with this slug already exists." };
    }

    const { count } = await supabase
      .from("languages")
      .select("*", { count: "exact", head: true });

    const { error } = await supabase.from("languages").insert({
      slug: lang.slug.toLowerCase().trim(),
      iso_639_1: lang.iso6391 || null,
      iso_639_3: lang.iso6393.toLowerCase().trim(),
      name: lang.name.trim(),
      native_name: lang.nativeName.trim(),
      flag: lang.flag.trim(),
      latitude: lang.latitude,
      longitude: lang.longitude,
      is_active: true,
      display_order: count ?? 0,
      letters_applicable: true,
      words_applicable: true,
      patterns_applicable: true,
      family: lang.family?.trim() || null,
      branch: lang.branch?.trim() || null,
      writing_system: lang.writingSystem?.trim() || null,
      total_speakers: lang.totalSpeakers || null,
    });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error creating language:", err);
    return { success: false, error: String(err) };
  }
}

export async function deleteLanguage(id: number) {
  try {
    const { error } = await supabase.from("languages").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error deleting language:", err);
    return { success: false, error: String(err) };
  }
}

// ---------------------------------------------------------------------------
// Manifest fallback (kept for backwards compat during transition)
// ---------------------------------------------------------------------------
export async function getLanguagesFromManifest(): Promise<LanguageConfig[]> {
  return getLanguages();
}

// ---------------------------------------------------------------------------
// Internal row mapper
// ---------------------------------------------------------------------------
function mapRow(row: any): LanguageConfig {
  return {
    id: row.id,
    slug: row.slug ?? row.iso_639_3,
    name: row.name,
    nativeName: row.native_name ?? "",
    flag: row.flag ?? "🌍",
    isActive: row.is_active ?? true,
    displayOrder: row.display_order ?? 0,
    latitude: row.latitude ?? 0,
    longitude: row.longitude ?? 0,
    lettersApplicable: row.letters_applicable ?? true,
    wordsApplicable: row.words_applicable ?? true,
    patternsApplicable: row.patterns_applicable ?? true,
    iso6391: row.iso_639_1 ?? null,
    iso6393: row.iso_639_3,
    family: row.family ?? null,
    branch: row.branch ?? null,
    writingSystem: row.writing_system ?? null,
    totalSpeakers: row.total_speakers ? Number(row.total_speakers) : null,
  };
}
