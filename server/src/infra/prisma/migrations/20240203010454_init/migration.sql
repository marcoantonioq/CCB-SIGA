/*
  Warnings:

  - The primary key for the `Igreja` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Igreja" (
    "cod" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "membros" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Igreja" ("cod", "membros", "nome") SELECT "cod", "membros", "nome" FROM "Igreja";
DROP TABLE "Igreja";
ALTER TABLE "new_Igreja" RENAME TO "Igreja";
CREATE UNIQUE INDEX "Igreja_cod_key" ON "Igreja"("cod");
CREATE UNIQUE INDEX "Igreja_nome_key" ON "Igreja"("nome");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
