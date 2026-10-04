-- CreateTable
CREATE TABLE "counter" (
    "id" TEXT NOT NULL,
    "next" INTEGER NOT NULL DEFAULT 1042,

    CONSTRAINT "counter_pkey" PRIMARY KEY ("id")
);
