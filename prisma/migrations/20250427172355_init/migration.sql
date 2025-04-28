-- CreateTable
CREATE TABLE "Game" (
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
    "releaseDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_appid_key" ON "Game"("appid");
