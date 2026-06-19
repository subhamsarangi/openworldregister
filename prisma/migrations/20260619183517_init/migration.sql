-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "native" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lettersApplicable" BOOLEAN NOT NULL DEFAULT true,
    "wordsApplicable" BOOLEAN NOT NULL DEFAULT true,
    "patternsApplicable" BOOLEAN NOT NULL DEFAULT true,
    "lettersFile" TEXT,
    "wordsFile" TEXT,
    "patternsFile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Letter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "letter" TEXT NOT NULL,
    "roman" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "pronunciation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Letter_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "roman" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Word_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "languageId" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "blanks" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pattern_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
