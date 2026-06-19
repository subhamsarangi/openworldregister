"use server";

import fs from "fs/promises";
import path from "path";
import { prisma } from "../lib/db";

export type LanguageConfig = {
  id: string;
  name: string;
  native: string;
  flag: string;
  isActive: boolean;
  order: number;
  latitude: number;
  longitude: number;
  lettersApplicable: boolean;
  wordsApplicable: boolean;
  patternsApplicable: boolean;
  lettersFile: string | null;
  wordsFile: string | null;
  patternsFile: string | null;
};

// Check if languages exist in DB, if not auto-seed from languages.json
async function ensureSeeded() {
  const count = await prisma.language.count();
  if (count === 0) {
    try {
      const jsonPath = path.join(process.cwd(), "data", "languages.json");
      const jsonData = await fs.readFile(jsonPath, "utf-8");
      const initialLanguages = JSON.parse(jsonData);
      
      console.log("Auto-seeding languages table from languages.json...");
      for (let i = 0; i < initialLanguages.length; i++) {
        const lang = initialLanguages[i];
        await prisma.language.create({
          data: {
            id: lang.id,
            name: lang.name,
            native: lang.native,
            flag: lang.flag,
            isActive: lang.isActive,
            order: i,
            lettersApplicable: true,
            wordsApplicable: true,
            patternsApplicable: true,
          },
        });
      }
      console.log("Auto-seeding complete.");
    } catch (err) {
      console.error("Auto-seeding failed:", err);
    }
  }
}

export async function getLanguages(): Promise<LanguageConfig[]> {
  try {
    await ensureSeeded();
    const dbLanguages = await prisma.language.findMany({
      orderBy: { order: "asc" },
    });
    
    return dbLanguages.map(lang => ({
      id: lang.id,
      name: lang.name,
      native: lang.native,
      flag: lang.flag,
      isActive: lang.isActive,
      order: lang.order,
      latitude: lang.latitude,
      longitude: lang.longitude,
      lettersApplicable: lang.lettersApplicable,
      wordsApplicable: lang.wordsApplicable,
      patternsApplicable: lang.patternsApplicable,
      lettersFile: lang.lettersFile,
      wordsFile: lang.wordsFile,
      patternsFile: lang.patternsFile,
    }));
  } catch (err) {
    console.error("Error reading languages from database:", err);
    return [];
  }
}

export async function updateLanguages(languages: any[]) {
  try {
    // Perform bulk updates in a transaction
    await prisma.$transaction(
      languages.map((lang, index) =>
        prisma.language.update({
          where: { id: lang.id },
          data: {
            isActive: lang.isActive,
            order: index, // Use current array index as order
            lettersApplicable: lang.lettersApplicable !== undefined ? lang.lettersApplicable : true,
            wordsApplicable: lang.wordsApplicable !== undefined ? lang.wordsApplicable : true,
            patternsApplicable: lang.patternsApplicable !== undefined ? lang.patternsApplicable : true,
          },
        })
      )
    );
    return { success: true };
  } catch (err) {
    console.error("Error writing languages to database:", err);
    return { success: false, error: String(err) };
  }
}

export async function getLanguagesFromManifest(): Promise<LanguageConfig[]> {
  try {
    const manifestPath = path.join(process.cwd(), "public", "r2", "manifest.json");
    const manifestData = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestData);
    
    const langs: LanguageConfig[] = [];
    let order = 0;
    for (const [id, lang] of Object.entries(manifest.languages) as [string, any][]) {
      langs.push({
        id,
        name: lang.name,
        native: lang.native || "",
        flag: lang.flag || "🌍",
        isActive: true,
        order: typeof lang.order === "number" ? lang.order : order++,
        latitude: lang.latitude || 0.0,
        longitude: lang.longitude || 0.0,
        lettersApplicable: lang.tabs.letters?.applicable ?? false,
        wordsApplicable: lang.tabs.words?.applicable ?? false,
        patternsApplicable: lang.tabs.patterns?.applicable ?? false,
        lettersFile: lang.tabs.letters?.file ?? null,
        wordsFile: lang.tabs.words?.file ?? null,
        patternsFile: lang.tabs.patterns?.file ?? null,
      });
    }
    return langs.sort((a, b) => a.order - b.order);
  } catch (err) {
    console.log("Manifest not found or failed to load, falling back to database query...");
    return getLanguages();
  }
}

export async function createLanguage(lang: { id: string; name: string; native: string; flag: string; latitude: number; longitude: number }) {
  try {
    const existing = await prisma.language.findUnique({ where: { id: lang.id } });
    if (existing) {
      return { success: false, error: "Language with this Code/ID already exists." };
    }

    const count = await prisma.language.count();
    await prisma.language.create({
      data: {
        id: lang.id.toLowerCase().trim(),
        name: lang.name.trim(),
        native: lang.native.trim(),
        flag: lang.flag.trim(),
        latitude: lang.latitude,
        longitude: lang.longitude,
        isActive: true,
        order: count,
        lettersApplicable: true,
        wordsApplicable: true,
        patternsApplicable: true,
      },
    });
    return { success: true };
  } catch (err) {
    console.error("Error creating language:", err);
    return { success: false, error: String(err) };
  }
}

export async function deleteLanguage(id: string) {
  try {
    await prisma.language.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    console.error("Error deleting language:", err);
    return { success: false, error: String(err) };
  }
}



