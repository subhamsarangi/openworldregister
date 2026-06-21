"use server";

import { supabase } from "../lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type DBLetter = {
  id?: number;
  languageId: number;            // integer FK to languages.id
  character: string;
  transliteration: string;       // roman equivalent
  charType: string;              // vowel / consonant / special / diacritic / tone-mark
  example?: string | null;
  pronunciationNote?: string | null;
  audioUrl?: string | null;
  sortOrder?: number | null;
};

export type DBWord = {
  id?: number;
  languageId: number;
  word: string;
  transliteration: string;
  translation: string;           // "meaning" in old schema
  partOfSpeech?: string | null;
  cefrLevel: string;             // A1 / A2 / B1 / B2 / C1 / C2
  frequencyRank?: number | null;
  audioUrl?: string | null;
  notes?: string | null;
};

// A pattern maps to sentence_patterns + sentence_examples + sentence_example_variants
export type DBSlotValue = {
  id?: number;
  slotValue: string;
  transliteration?: string | null;
  translation?: string | null;
  sortOrder?: number;
};

export type DBPattern = {
  id?: number;
  languageId: number;
  template: string;              // e.g. "Are you ___?"
  patternType?: string | null;   // interrogative / negative / affirmative / modal
  tense?: string | null;
  aspect?: string | null;
  tags?: string | null;          // comma-separated
  description?: string | null;
  // The single sentence_example attached to this pattern (object_slot + native_text)
  exampleObjectSlot?: string | null;
  exampleNativeText?: string | null;
  exampleTranslation?: string | null;
  slotValues?: DBSlotValue[];
};

// ---------------------------------------------------------------------------
// Letters (alphabet_entries)
// ---------------------------------------------------------------------------
export async function getLetters(languageId: number): Promise<DBLetter[]> {
  try {
    const { data, error } = await supabase
      .from("alphabet_entries")
      .select("*")
      .eq("language_id", languageId)
      .order("sort_order", { ascending: true, nullsFirst: false });

    if (error) throw error;
    return (data ?? []).map(mapLetterRow);
  } catch (err) {
    console.error("Error fetching letters:", err);
    return [];
  }
}

export async function saveLetter(data: DBLetter) {
  try {
    const row = {
      language_id: data.languageId,
      character: data.character,
      transliteration: data.transliteration,
      char_type: data.charType,
      example: data.example ?? null,
      pronunciation_note: data.pronunciationNote ?? null,
      audio_url: data.audioUrl ?? null,
      sort_order: data.sortOrder ?? null,
    };

    if (data.id) {
      const { error } = await supabase
        .from("alphabet_entries")
        .update(row)
        .eq("id", data.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("alphabet_entries")
        .insert(row);
      if (error) throw error;
    }
    return { success: true };
  } catch (err) {
    console.error("Error saving letter:", err);
    throw new Error("Failed to save letter");
  }
}

export async function deleteLetter(id: number) {
  try {
    const { error } = await supabase
      .from("alphabet_entries")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error deleting letter:", err);
    throw new Error("Failed to delete letter");
  }
}

// ---------------------------------------------------------------------------
// Words (vocabulary)
// ---------------------------------------------------------------------------
export async function getWords(languageId: number): Promise<DBWord[]> {
  try {
    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("language_id", languageId)
      .order("frequency_rank", { ascending: true, nullsFirst: false });

    if (error) throw error;
    return (data ?? []).map(mapWordRow);
  } catch (err) {
    console.error("Error fetching words:", err);
    return [];
  }
}

export async function saveWord(data: DBWord) {
  try {
    const row = {
      language_id: data.languageId,
      word: data.word,
      transliteration: data.transliteration,
      translation: data.translation,
      part_of_speech: data.partOfSpeech ?? null,
      cefr_level: data.cefrLevel,
      frequency_rank: data.frequencyRank ?? null,
      audio_url: data.audioUrl ?? null,
      notes: data.notes ?? null,
    };

    if (data.id) {
      const { error } = await supabase
        .from("vocabulary")
        .update(row)
        .eq("id", data.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("vocabulary")
        .insert(row);
      if (error) throw error;
    }
    return { success: true };
  } catch (err) {
    console.error("Error saving word:", err);
    throw new Error("Failed to save word");
  }
}

export async function deleteWord(id: number) {
  try {
    const { error } = await supabase
      .from("vocabulary")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error deleting word:", err);
    throw new Error("Failed to delete word");
  }
}

// ---------------------------------------------------------------------------
// Patterns (sentence_patterns + sentence_examples + sentence_example_variants)
// ---------------------------------------------------------------------------
export async function getPatterns(languageId: number): Promise<DBPattern[]> {
  try {
    const { data, error } = await supabase
      .from("sentence_patterns")
      .select(`
        *,
        sentence_examples (
          id,
          object_slot,
          native_text,
          translation,
          sentence_example_variants (
            id,
            slot_value,
            transliteration,
            translation,
            sort_order
          )
        )
      `)
      .eq("language_id", languageId)
      .order("id", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapPatternRow);
  } catch (err) {
    console.error("Error fetching patterns:", err);
    return [];
  }
}

export async function savePattern(data: DBPattern) {
  try {
    const patternRow = {
      language_id: data.languageId,
      template: data.template,
      pattern_type: data.patternType ?? null,
      tense: data.tense ?? null,
      aspect: data.aspect ?? null,
      tags: data.tags ?? null,
      description: data.description ?? null,
    };

    let patternId: number;

    if (data.id) {
      const { error } = await supabase
        .from("sentence_patterns")
        .update(patternRow)
        .eq("id", data.id);
      if (error) throw error;
      patternId = data.id;
    } else {
      const { data: inserted, error } = await supabase
        .from("sentence_patterns")
        .insert(patternRow)
        .select("id")
        .single();
      if (error) throw error;
      patternId = inserted.id;
    }

    // Upsert the single sentence_example for this pattern
    if (data.exampleNativeText) {
      const exampleRow = {
        sentence_pattern_id: patternId,
        vocabulary_id: null,
        object_slot: data.exampleObjectSlot ?? null,
        native_text: data.exampleNativeText,
        translation: data.exampleTranslation ?? null,
      };

      // Delete old examples for this pattern and re-insert
      await supabase
        .from("sentence_examples")
        .delete()
        .eq("sentence_pattern_id", patternId);

      const { data: insertedExample, error: exErr } = await supabase
        .from("sentence_examples")
        .insert(exampleRow)
        .select("id")
        .single();
      if (exErr) throw exErr;

      // Insert slot values
      if (data.slotValues && data.slotValues.length > 0) {
        const variants = data.slotValues.map((sv, i) => ({
          sentence_example_id: insertedExample.id,
          slot_value: sv.slotValue,
          transliteration: sv.transliteration ?? null,
          translation: sv.translation ?? null,
          sort_order: sv.sortOrder ?? i,
        }));

        const { error: varErr } = await supabase
          .from("sentence_example_variants")
          .insert(variants);
        if (varErr) throw varErr;
      }
    }

    return { success: true, id: patternId };
  } catch (err) {
    console.error("Error saving pattern:", err);
    throw new Error("Failed to save pattern.");
  }
}

export async function deletePattern(id: number) {
  try {
    // CASCADE handles sentence_examples and sentence_example_variants
    const { error } = await supabase
      .from("sentence_patterns")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error deleting pattern:", err);
    throw new Error("Failed to delete pattern");
  }
}

// ---------------------------------------------------------------------------
// Row mappers
// ---------------------------------------------------------------------------
function mapLetterRow(row: any): DBLetter {
  return {
    id: row.id,
    languageId: row.language_id,
    character: row.character,
    transliteration: row.transliteration ?? "",
    charType: row.char_type ?? "",
    example: row.example ?? null,
    pronunciationNote: row.pronunciation_note ?? null,
    audioUrl: row.audio_url ?? null,
    sortOrder: row.sort_order ?? null,
  };
}

function mapWordRow(row: any): DBWord {
  return {
    id: row.id,
    languageId: row.language_id,
    word: row.word,
    transliteration: row.transliteration ?? "",
    translation: row.translation,
    partOfSpeech: row.part_of_speech ?? null,
    cefrLevel: row.cefr_level ?? "A1",
    frequencyRank: row.frequency_rank ?? null,
    audioUrl: row.audio_url ?? null,
    notes: row.notes ?? null,
  };
}

function mapPatternRow(row: any): DBPattern {
  const example = row.sentence_examples?.[0] ?? null;
  const variants: DBSlotValue[] = (example?.sentence_example_variants ?? []).map((v: any) => ({
    id: v.id,
    slotValue: v.slot_value,
    transliteration: v.transliteration ?? null,
    translation: v.translation ?? null,
    sortOrder: v.sort_order ?? 0,
  }));

  return {
    id: row.id,
    languageId: row.language_id,
    template: row.template,
    patternType: row.pattern_type ?? null,
    tense: row.tense ?? null,
    aspect: row.aspect ?? null,
    tags: row.tags ?? null,
    description: row.description ?? null,
    exampleObjectSlot: example?.object_slot ?? null,
    exampleNativeText: example?.native_text ?? null,
    exampleTranslation: example?.translation ?? null,
    slotValues: variants,
  };
}
