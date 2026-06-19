"use server";

import fs from "fs/promises";
import path from "path";

export type LanguageConfig = {
  id: string;
  name: string;
  native: string;
  flag: string;
  isActive: boolean;
};

// Adjust path as needed for where the data directory is located
const filePath = path.join(process.cwd(), "data", "languages.json");

export async function getLanguages(): Promise<LanguageConfig[]> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading languages.json:", err);
    return [];
  }
}

export async function updateLanguages(languages: LanguageConfig[]) {
  try {
    await fs.writeFile(filePath, JSON.stringify(languages, null, 2), "utf-8");
    return { success: true };
  } catch (err) {
    console.error("Error writing languages.json:", err);
    return { success: false, error: String(err) };
  }
}
