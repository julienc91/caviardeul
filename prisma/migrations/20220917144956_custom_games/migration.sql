-- CreateTable
CREATE TABLE "CustomArticle" (
    "id" STRING NOT NULL,
    "createdById" UUID NOT NULL,
    "pageId" STRING NOT NULL,
    "pageName" STRING NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nbWinners" INT4 NOT NULL DEFAULT 0,
    "stats" JSONB,

    CONSTRAINT "CustomArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomArticle_createdById_pageId_key" ON "CustomArticle"("createdById", "pageId");

-- AddForeignKey
ALTER TABLE "CustomArticle" ADD CONSTRAINT "CustomArticle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
