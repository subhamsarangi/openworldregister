"use server";

import { prisma } from "../lib/db";
import fs from "fs/promises";
import path from "path";

// Types
export type DBLetter = {
  id?: string;
  languageId: string;
  letter: string;
  roman: string;
  type: string;
  example: string;
  pronunciation?: string | null;
};

export type DBWord = {
  id?: string;
  languageId: string;
  word: string;
  roman: string;
  meaning: string;
  level: string;
};

export type DBPattern = {
  id?: string;
  languageId: string;
  pattern: string;
  blanks: string; // JSON string
  tags: string;
};

// CRUD for Letters
export async function getLetters(languageId: string) {
  try {
    return await prisma.letter.findMany({
      where: { languageId },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    console.error("Error fetching letters:", err);
    return [];
  }
}

export async function saveLetter(data: DBLetter) {
  try {
    if (data.id) {
      return await prisma.letter.update({
        where: { id: data.id },
        data: {
          letter: data.letter,
          roman: data.roman,
          type: data.type,
          example: data.example,
          pronunciation: data.pronunciation || null,
        },
      });
    } else {
      return await prisma.letter.create({
        data: {
          languageId: data.languageId,
          letter: data.letter,
          roman: data.roman,
          type: data.type,
          example: data.example,
          pronunciation: data.pronunciation || null,
        },
      });
    }
  } catch (err) {
    console.error("Error saving letter:", err);
    throw new Error("Failed to save letter");
  }
}

export async function deleteLetter(id: string) {
  try {
    await prisma.letter.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    console.error("Error deleting letter:", err);
    throw new Error("Failed to delete letter");
  }
}

// CRUD for Words
export async function getWords(languageId: string) {
  try {
    return await prisma.word.findMany({
      where: { languageId },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    console.error("Error fetching words:", err);
    return [];
  }
}

export async function saveWord(data: DBWord) {
  try {
    if (data.id) {
      return await prisma.word.update({
        where: { id: data.id },
        data: {
          word: data.word,
          roman: data.roman,
          meaning: data.meaning,
          level: data.level,
        },
      });
    } else {
      return await prisma.word.create({
        data: {
          languageId: data.languageId,
          word: data.word,
          roman: data.roman,
          meaning: data.meaning,
          level: data.level,
        },
      });
    }
  } catch (err) {
    console.error("Error saving word:", err);
    throw new Error("Failed to save word");
  }
}

export async function deleteWord(id: string) {
  try {
    await prisma.word.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    console.error("Error deleting word:", err);
    throw new Error("Failed to delete word");
  }
}

// CRUD for Patterns
export async function getPatterns(languageId: string) {
  try {
    return await prisma.pattern.findMany({
      where: { languageId },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    console.error("Error fetching patterns:", err);
    return [];
  }
}

export async function savePattern(data: DBPattern) {
  try {
    // Validate blanks is JSON
    JSON.parse(data.blanks);

    if (data.id) {
      return await prisma.pattern.update({
        where: { id: data.id },
        data: {
          pattern: data.pattern,
          blanks: data.blanks,
          tags: data.tags,
        },
      });
    } else {
      return await prisma.pattern.create({
        data: {
          languageId: data.languageId,
          pattern: data.pattern,
          blanks: data.blanks,
          tags: data.tags,
        },
      });
    }
  } catch (err) {
    console.error("Error saving pattern:", err);
    throw new Error("Failed to save pattern. Make sure 'blanks' is valid JSON.");
  }
}

export async function deletePattern(id: string) {
  try {
    await prisma.pattern.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    console.error("Error deleting pattern:", err);
    throw new Error("Failed to delete pattern");
  }
}

// Helper to increment version
function incrementVersion(currentFilename: string | null, baseName: string): string {
  if (!currentFilename) return `${baseName}.v1.json`;
  const match = currentFilename.match(/\.v(\d+)\.json$/);
  if (!match) return `${baseName}.v1.json`;
  const nextVer = parseInt(match[1], 10) + 1;
  return `${baseName}.v${nextVer}.json`;
}

// Publishing Pipeline (Simulated R2 inside public/r2/)
export async function publishLanguage(languageId: string) {
  try {
    const lang = await prisma.language.findUnique({
      where: { id: languageId },
      include: {
        letters: true,
        words: true,
        patterns: true,
      },
    });

    if (!lang) throw new Error("Language not found");

    const r2Dir = path.join(process.cwd(), "public", "r2");
    await fs.mkdir(r2Dir, { recursive: true });

    let lettersFile = lang.lettersFile;
    let wordsFile = lang.wordsFile;
    let patternsFile = lang.patternsFile;

    // 1. Publish Letters if applicable and we have entries
    if (lang.lettersApplicable && lang.letters.length > 0) {
      lettersFile = incrementVersion(lang.lettersFile, `${languageId}-letters`);
      const lettersData = lang.letters.map(l => ({
        letter: l.letter,
        roman: l.roman,
        type: l.type,
        example: l.example,
        pronunciation: l.pronunciation,
      }));
      await fs.writeFile(
        path.join(r2Dir, lettersFile),
        JSON.stringify(lettersData, null, 2),
        "utf8"
      );
    } else if (!lang.lettersApplicable) {
      lettersFile = null;
    }

    // 2. Publish Words if applicable and we have entries
    if (lang.wordsApplicable && lang.words.length > 0) {
      wordsFile = incrementVersion(lang.wordsFile, `${languageId}-words`);
      const wordsData = lang.words.map(w => ({
        word: w.word,
        roman: w.roman,
        meaning: w.meaning,
        level: w.level,
      }));
      await fs.writeFile(
        path.join(r2Dir, wordsFile),
        JSON.stringify(wordsData, null, 2),
        "utf8"
      );
    } else if (!lang.wordsApplicable) {
      wordsFile = null;
    }

    // 3. Publish Patterns if applicable and we have entries
    if (lang.patternsApplicable && lang.patterns.length > 0) {
      patternsFile = incrementVersion(lang.patternsFile, `${languageId}-patterns`);
      const patternsData = lang.patterns.map(p => {
        let parsedBlanks = [];
        try {
          parsedBlanks = JSON.parse(p.blanks);
        } catch (e) {
          console.error("Invalid blanks JSON in DB:", p.blanks);
        }
        return {
          pattern: p.pattern,
          blanks: parsedBlanks,
          tags: p.tags.split(",").map(t => t.trim()).filter(Boolean),
        };
      });
      await fs.writeFile(
        path.join(r2Dir, patternsFile),
        JSON.stringify(patternsData, null, 2),
        "utf8"
      );
    } else if (!lang.patternsApplicable) {
      patternsFile = null;
    }

    // Update filenames in DB
    const updatedLang = await prisma.language.update({
      where: { id: languageId },
      data: {
        lettersFile,
        wordsFile,
        patternsFile,
      },
    });

    // 4. Regenerate manifest.json
    await regenerateManifest();

    return { success: true, language: updatedLang };
  } catch (err) {
    console.error("Error publishing language:", err);
    return { success: false, error: String(err) };
  }
}

// Regenerate manifest.json
export async function regenerateManifest() {
  try {
    const activeLanguages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const manifest: Record<string, any> = {
      languages: {},
    };

    for (const lang of activeLanguages) {
      const tabs: Record<string, any> = {};
      
      tabs.letters = { applicable: lang.lettersApplicable };
      if (lang.lettersFile) tabs.letters.file = lang.lettersFile;

      tabs.words = { applicable: lang.wordsApplicable };
      if (lang.wordsFile) tabs.words.file = lang.wordsFile;

      tabs.patterns = { applicable: lang.patternsApplicable };
      if (lang.patternsFile) tabs.patterns.file = lang.patternsFile;

      manifest.languages[lang.id] = {
        name: lang.name,
        native: lang.native,
        flag: lang.flag,
        order: lang.order,
        latitude: lang.latitude,
        longitude: lang.longitude,
        tabs,
      };
    }

    const r2Dir = path.join(process.cwd(), "public", "r2");
    await fs.mkdir(r2Dir, { recursive: true });
    await fs.writeFile(
      path.join(r2Dir, "manifest.json"),
      JSON.stringify(manifest, null, 2),
      "utf8"
    );

    return { success: true };
  } catch (err) {
    console.error("Error regenerating manifest:", err);
    return { success: false, error: String(err) };
  }
}
