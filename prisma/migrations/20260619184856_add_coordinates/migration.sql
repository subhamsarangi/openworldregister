-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Language" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "native" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "latitude" REAL NOT NULL DEFAULT 0.0,
    "longitude" REAL NOT NULL DEFAULT 0.0,
    "lettersApplicable" BOOLEAN NOT NULL DEFAULT true,
    "wordsApplicable" BOOLEAN NOT NULL DEFAULT true,
    "patternsApplicable" BOOLEAN NOT NULL DEFAULT true,
    "lettersFile" TEXT,
    "wordsFile" TEXT,
    "patternsFile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Language" ("createdAt", "flag", "id", "isActive", "lettersApplicable", "lettersFile", "name", "native", "order", "patternsApplicable", "patternsFile", "updatedAt", "wordsApplicable", "wordsFile") SELECT "createdAt", "flag", "id", "isActive", "lettersApplicable", "lettersFile", "name", "native", "order", "patternsApplicable", "patternsFile", "updatedAt", "wordsApplicable", "wordsFile" FROM "Language";
DROP TABLE "Language";
ALTER TABLE "new_Language" RENAME TO "Language";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
