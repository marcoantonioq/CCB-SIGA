-- CreateTable
CREATE TABLE "Igreja" (
    "nome" TEXT NOT NULL PRIMARY KEY,
    "cod" TEXT NOT NULL,
    "membros" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Fluxo" (
    "igreja" TEXT NOT NULL,
    "fluxo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "valor" REAL NOT NULL DEFAULT 0.0,
    "detalhes" TEXT NOT NULL,
    "ref" TEXT,
    "created" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME,

    PRIMARY KEY ("igreja", "categoria", "data", "detalhes"),
    CONSTRAINT "Fluxo_igreja_fkey" FOREIGN KEY ("igreja") REFERENCES "Igreja" ("nome") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "igreja" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    PRIMARY KEY ("igreja", "description"),
    CONSTRAINT "Tarefa_igreja_fkey" FOREIGN KEY ("igreja") REFERENCES "Igreja" ("nome") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Igreja_nome_key" ON "Igreja"("nome");
