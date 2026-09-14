CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "userId" TEXT,
  "anonymousId" TEXT,
  "collegeId" TEXT,
  "tenantId" TEXT,
  "consent" TEXT,
  "properties" JSONB,
  "occurredAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalyticsEvent_idempotencyKey_key" ON "AnalyticsEvent"("idempotencyKey");
CREATE INDEX "AnalyticsEvent_collegeId_receivedAt_idx" ON "AnalyticsEvent"("collegeId", "receivedAt");
CREATE INDEX "AnalyticsEvent_userId_receivedAt_idx" ON "AnalyticsEvent"("userId", "receivedAt");
CREATE INDEX "AnalyticsEvent_name_receivedAt_idx" ON "AnalyticsEvent"("name", "receivedAt");
CREATE INDEX "AnalyticsEvent_tenantId_receivedAt_idx" ON "AnalyticsEvent"("tenantId", "receivedAt");
