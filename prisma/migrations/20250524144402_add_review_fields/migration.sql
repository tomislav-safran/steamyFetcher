/*
  Warnings:

  - You are about to drop the column `rating` on the `Game` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "appid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "shortDesc" TEXT,
    "detailedDesc" TEXT,
    "aboutTheGame" TEXT,
    "developers" TEXT,
    "publishers" TEXT,
    "platforms" TEXT,
    "genres" TEXT,
    "categories" TEXT,
    "price" TEXT,
    "metacriticScore" INTEGER,
    "isFree" BOOLEAN NOT NULL,
    "reviewCount" INTEGER,
    "reviewScore" INTEGER,
    "releaseDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Game" ("aboutTheGame", "appid", "categories", "createdAt", "detailedDesc", "developers", "genres", "id", "isFree", "metacriticScore", "name", "platforms", "price", "publishers", "releaseDate", "reviewCount", "shortDesc", "type") SELECT "aboutTheGame", "appid", "categories", "createdAt", "detailedDesc", "developers", "genres", "id", "isFree", "metacriticScore", "name", "platforms", "price", "publishers", "releaseDate", "reviewCount", "shortDesc", "type" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_appid_key" ON "Game"("appid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
