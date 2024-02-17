-- CreateEnum
CREATE TYPE "ArticleSafety" AS ENUM ('SAFE', 'UNSAFE', 'UNKNOWN');

-- AlterTable
ALTER TABLE "CustomArticle" ADD COLUMN     "safety" "ArticleSafety" NOT NULL DEFAULT 'UNKNOWN';
