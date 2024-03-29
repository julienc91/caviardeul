-- CreateTable
CREATE TABLE "DailyArticle" (
    "id" INT4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    "pageId" STRING NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyArticle_pageId_key" ON "DailyArticle"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyArticle_date_key" ON "DailyArticle"("date");
