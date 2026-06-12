import { prisma } from './db'

const SCHEMA_SQL = `
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "priceRange" TEXT NOT NULL DEFAULT 'mid',
  "avatarUrl" TEXT,
  "googleCalendarConnected" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GoogleToken" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "GoogleToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Group" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "priceRange" TEXT NOT NULL DEFAULT 'mid',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GroupMember" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Availability" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "dayOfWeek" INTEGER,
  "date" TEXT,
  "type" TEXT NOT NULL,
  CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MeetingProposal" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "proposedDate" TEXT NOT NULL,
  "proposedTime" TEXT NOT NULL,
  "restaurantName" TEXT NOT NULL,
  "restaurantArea" TEXT NOT NULL,
  "restaurantGenre" TEXT NOT NULL,
  "estimatedCost" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingProposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MeetingVote" (
  "id" TEXT NOT NULL,
  "proposalId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "vote" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingVote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "genre" TEXT NOT NULL,
  "venue" TEXT NOT NULL,
  "area" TEXT NOT NULL,
  "description" TEXT,
  "url" TEXT,
  "imageUrl" TEXT,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EventLike" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "EventLike_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GroupMessage" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GroupMessage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "GoogleToken_userId_key" ON "GoogleToken"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "GroupMember_groupId_userId_key" ON "GroupMember"("groupId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "MeetingVote_proposalId_userId_key" ON "MeetingVote"("proposalId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "EventLike_eventId_userId_key" ON "EventLike"("eventId", "userId");
`

const FK_SQL = [
  `ALTER TABLE "GoogleToken" ADD CONSTRAINT "GoogleToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "MeetingProposal" ADD CONSTRAINT "MeetingProposal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "MeetingProposal" ADD CONSTRAINT "MeetingProposal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "MeetingVote" ADD CONSTRAINT "MeetingVote_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "MeetingProposal"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "MeetingVote" ADD CONSTRAINT "MeetingVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "EventLike" ADD CONSTRAINT "EventLike_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "EventLike" ADD CONSTRAINT "EventLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
  `ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE "GroupMessage" ADD CONSTRAINT "GroupMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
]

// Idempotent column additions for already-existing databases.
const MIGRATIONS = [
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT`,
]

async function runMigrations() {
  for (const sql of MIGRATIONS) {
    try {
      await prisma.$executeRawUnsafe(sql)
    } catch {
      // ignore — column may already exist
    }
  }
}

let initialized = false

export async function ensureDbReady(): Promise<void> {
  if (initialized) return
  try {
    await prisma.$executeRaw`SELECT 1 FROM "User" LIMIT 0`
    await runMigrations()
    initialized = true
  } catch {
    // Tables don't exist — create them
    for (const stmt of SCHEMA_SQL.split(';').map(s => s.trim()).filter(Boolean)) {
      await prisma.$executeRawUnsafe(stmt)
    }
    for (const fk of FK_SQL) {
      try {
        await prisma.$executeRawUnsafe(fk)
      } catch {
        // ignore "already exists"
      }
    }
    await runMigrations()
    await seedDemoUsers()
    initialized = true
  }
}

async function seedDemoUsers() {
  const { default: bcrypt } = await import('bcryptjs')
  const demos = [
    { id: 'demo-alice', name: 'Alice', email: 'alice@demo.com', password: 'demo1234' },
    { id: 'demo-bob',   name: 'Bob',   email: 'bob@demo.com',   password: 'demo1234' },
    { id: 'demo-carol', name: 'Carol', email: 'carol@demo.com', password: 'demo1234' },
  ]
  for (const u of demos) {
    const hash = await bcrypt.hash(u.password, 10)
    await prisma.$executeRawUnsafe(
      `INSERT INTO "User" (id, email, name, "passwordHash", "priceRange", "googleCalendarConnected", "createdAt")
       VALUES ($1, $2, $3, $4, 'mid', false, NOW())
       ON CONFLICT (email) DO NOTHING`,
      u.id, u.email, u.name, hash
    )
  }
}
