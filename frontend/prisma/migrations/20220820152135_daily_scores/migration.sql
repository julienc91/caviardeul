-- AlterTable
ALTER TABLE "DailyArticle" ADD COLUMN     "nbDailyWinners" INT4 NOT NULL DEFAULT 0;
ALTER TABLE "DailyArticle" ADD COLUMN     "nbWinners" INT4 NOT NULL DEFAULT 0;
ALTER TABLE "DailyArticle" ADD COLUMN     "stats" JSONB;

-- CreateTable
CREATE TABLE "DailyArticleScore" (
    "dailyArticleId" INT4 NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nbAttempts" INT4 NOT NULL DEFAULT 0,
    "nbCorrect" INT4 NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyArticleScore_dailyArticleId_userId_key" ON "DailyArticleScore"("dailyArticleId", "userId");

-- AddForeignKey
ALTER TABLE "DailyArticleScore" ADD CONSTRAINT "DailyArticleScore_dailyArticleId_fkey" FOREIGN KEY ("dailyArticleId") REFERENCES "DailyArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyArticleScore" ADD CONSTRAINT "DailyArticleScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
