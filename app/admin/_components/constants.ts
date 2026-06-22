// Shared constants and helpers for the Admin dashboard

export const LANGUAGE_FAMILIES_MAP: Record<string, string[]> = {
  "Afroasiatic": ["Semitic", "Cushitic", "Berber", "Chadic", "Egyptian"],
  "Austroasiatic": ["Vietic", "Mon-Khmer", "Munda"],
  "Austronesian": ["Malayo-Polynesian", "Formosan"],
  "Dravidian": ["Southern", "South-Central", "Central", "Northern"],
  "Indo-European": [
    "Balto-Slavic",
    "Germanic",
    "Indo-Aryan",
    "Romance",
    "Hellenic",
    "Celtic",
    "Iranian",
    "Armenian",
    "Albanian"
  ],
  "Japonic": ["Japanese", "Ryukyuan"],
  "Kartvelian": ["Georgian", "Zan", "Svan"],
  "Koreanic": ["Korean", "Jeju"],
  "Kra-Dai": ["Tai", "Kam-Sui", "Hlai", "Kra"],
  "Mayan": ["Yucatecan", "Cholan-Tzeltalan", "K'ichean", "Huastecan"],
  "Mongolic": ["Eastern Mongolic", "Western Mongolic"],
  "Na-Dene": ["Athabaskan", "Eyak", "Tlingit"],
  "Niger-Congo": ["Bantu", "Atlantic-Congo", "Mande", "Gur", "Kwa"],
  "Nilo-Saharan": ["Nilotic", "Central Sudanic", "Songhay"],
  "Quechuan": ["Quechua I", "Quechua II"],
  "Sino-Tibetan": ["Sinitic", "Tibeto-Burman"],
  "Trans-New Guinea": ["Madang", "Finisterre-Huon", "Kainantu-Goroka"],
  "Tupian": ["Tupi-Guarani", "Munduruku", "Mawé"],
  "Turkic": ["Oghuz", "Karluk", "Kipchak", "Siberian Turkic", "Oghur"],
  "Uralic": ["Finno-Ugric", "Samoyedic"],
  "Uto-Aztecan": ["Nahuatlan", "Numic", "Takic", "Taracahitic"],
  "Language Isolate": ["Basque", "Ainu", "Burushaski", "Other Isolate"],
  "Other": ["Other"]
};

export const LANGUAGE_GLYPHS: Record<string, string> = {
  spanish: "ñ",
  chinese: "文",
  arabic: "ض",
  hindi: "अ",
  german: "ß",
  russian: "ж",
  japanese: "あ",
  french: "ç",
  bengali: "আ",
  turkish: "ğ",
  korean: "한",
  portuguese: "ã",
  tamil: "ழ்",
  vietnamese: "đ",
  italian: "è",
  swedish: "å",
  navajo: "ł",
  english: "e",
  amharic: "ሀ",
  zulu: "q"
};

export const WRITING_SYSTEMS = [
  "Latin / Latina",
  "Latin (Chữ Quốc ngữ) / Chữ Quốc ngữ",
  "Arabic alphabet / أبجدية عربية",
  "Armenian alphabet / Հայոց այբուբեն",
  "Bengali-Assamese script / বাংলা-অসমীয়া লিপি",
  "Burmese script / မြန်မာအက္ခရာ",
  "Cherokee syllabary / ᏣᎳᎩ ᏗᏕᎶᏆᏍᏙᏗ",
  "Chinese characters / 中文",
  "Cyrillic / Кириллица",
  "Devanagari / देवनागरी",
  "Ge'ez script / ግዕዝ",
  "Georgian script / ქართული დამწერლობა",
  "Greek alphabet / Ελληνικό αλφάβητο",
  "Gujarati script / ગુજરાતી લિપિ",
  "Gurmukhi (Punjabi) / ਗੁਰਮੁਖੀ",
  "Hangul / 한글",
  "Hebrew alphabet / אלפבית עברי",
  "Japanese (Kana and Kanji) / 日本語",
  "Kannada script / ಕನ್ನಡ ಲಿಪಿ",
  "Khmer script / អក្សរខ្មែរ",
  "Lao script / ອັກສອນລາວ",
  "Malayalam script / മലയാളലിപി",
  "Mongolian script / Монгол бичиг",
  "Odia script / ଓଡ଼ିଆ ଲିପି",
  "Sinhala script / සිංහල අක්ෂර მალاව",
  "Syriac alphabet / ܐܠܦܒܝܬ ܣܘܪܝܝܐ",
  "Tamil script / தமிழ் எழுத்துமுறை",
  "Telugu script / తెలుగు లిపి",
  "Thaana (Maldivian) / ތާނަ",
  "Thai script / อักษรไทย",
  "Tibetan script / བོད་ཡིག",
  "Tifinagh (Berber) / ⵜⵉⴼⵉⵏ ⴰⵖ",
  "Unified Canadian Aboriginal Syllabics / ᒐᓇᑕᒥ ᐊᓪᓚᖑᐊᒐᐃᑦ",
  "Other / Other"
];

export const getLanguageGlyph = (slug: string, nativeName: string, name: string): string => {
  const s = slug.toLowerCase().trim();
  if (LANGUAGE_GLYPHS[s]) {
    return LANGUAGE_GLYPHS[s];
  }
  const text = nativeName || name;
  return text ? Array.from(text)[0] : "🌐";
};
