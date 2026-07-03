-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "googlePlaceId" TEXT,
    "websiteUrl" TEXT,
    "websiteStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "pipelineStatus" TEXT NOT NULL DEFAULT 'NEW',
    "assignedTo" TEXT NOT NULL DEFAULT 'ANAMIKA',
    "notes" TEXT,
    "rating" REAL,
    "lastContactedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_googlePlaceId_key" ON "Lead"("googlePlaceId");
