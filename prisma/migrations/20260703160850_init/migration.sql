-- CreateEnum
CREATE TYPE "TeamMember" AS ENUM ('ANAMIKA', 'JEET');

-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('NO_WEBSITE', 'SOCIAL_ONLY', 'HAS_WEBSITE', 'UNREACHABLE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PipelineStatus" AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'PROPOSAL', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "googlePlaceId" TEXT,
    "websiteUrl" TEXT,
    "websiteStatus" "WebsiteStatus" NOT NULL DEFAULT 'UNKNOWN',
    "pipelineStatus" "PipelineStatus" NOT NULL DEFAULT 'NEW',
    "assignedTo" "TeamMember" NOT NULL DEFAULT 'ANAMIKA',
    "notes" TEXT,
    "rating" DOUBLE PRECISION,
    "lastContactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_googlePlaceId_key" ON "Lead"("googlePlaceId");
