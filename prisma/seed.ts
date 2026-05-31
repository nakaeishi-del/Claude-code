import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up existing data
  await prisma.eventLike.deleteMany()
  await prisma.meetingVote.deleteMany()
  await prisma.meetingProposal.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.groupMember.deleteMany()
  await prisma.group.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('demo1234', 10)

  // Create users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@demo.com',
      name: 'アリス',
      passwordHash,
      priceRange: 'mid',
    },
  })

  const bob = await prisma.user.create({
    data: {
      email: 'bob@demo.com',
      name: 'ボブ',
      passwordHash,
      priceRange: 'mid',
    },
  })

  const carol = await prisma.user.create({
    data: {
      email: 'carol@demo.com',
      name: 'キャロル',
      passwordHash,
      priceRange: 'high',
    },
  })

  // Create group
  const group = await prisma.group.create({
    data: {
      name: '渋谷グルメ部',
      description: '渋谷周辺のおいしいお店を探索するグループです',
      priceRange: 'mid',
    },
  })

  // Add members
  await prisma.groupMember.create({
    data: { groupId: group.id, userId: alice.id, role: 'owner' },
  })
  await prisma.groupMember.create({
    data: { groupId: group.id, userId: bob.id, role: 'member' },
  })
  await prisma.groupMember.create({
    data: { groupId: group.id, userId: carol.id, role: 'member' },
  })

  // Add availability for Alice (free on weekends)
  await prisma.availability.createMany({
    data: [
      { userId: alice.id, dayOfWeek: 5, type: 'free' }, // Friday
      { userId: alice.id, dayOfWeek: 6, type: 'free' }, // Saturday
      { userId: alice.id, dayOfWeek: 0, type: 'free' }, // Sunday
      { userId: alice.id, dayOfWeek: 1, type: 'busy' }, // Monday
      { userId: alice.id, dayOfWeek: 2, type: 'busy' }, // Tuesday
    ],
  })

  // Add availability for Bob
  await prisma.availability.createMany({
    data: [
      { userId: bob.id, dayOfWeek: 5, type: 'free' }, // Friday
      { userId: bob.id, dayOfWeek: 6, type: 'free' }, // Saturday
      { userId: bob.id, dayOfWeek: 3, type: 'free' }, // Wednesday
      { userId: bob.id, dayOfWeek: 0, type: 'busy' }, // Sunday
    ],
  })

  // Add availability for Carol
  await prisma.availability.createMany({
    data: [
      { userId: carol.id, dayOfWeek: 6, type: 'free' }, // Saturday
      { userId: carol.id, dayOfWeek: 0, type: 'free' }, // Sunday
      { userId: carol.id, dayOfWeek: 5, type: 'free' }, // Friday
    ],
  })

  // Create mock events for next 2 weeks
  const today = new Date()
  const events = []
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    if (i === 1) {
      events.push({
        date: dateStr,
        title: '渋谷ジャズナイト',
        genre: 'music',
        venue: 'Blue Note Tokyo',
        area: '渋谷',
        description: '一流ジャズミュージシャンによるライブパフォーマンス',
      })
    }
    if (i === 2) {
      events.push({
        date: dateStr,
        title: '代官山フードフェスティバル',
        genre: 'food',
        venue: '代官山アドレス',
        area: '代官山',
        description: '全国各地の名物料理が集結するグルメイベント',
      })
    }
    if (i === 3) {
      events.push({
        date: dateStr,
        title: '新宿アートギャラリー展',
        genre: 'art',
        venue: '新宿文化センター',
        area: '新宿',
        description: '現代アーティストたちの作品展示会',
      })
    }
    if (i === 4) {
      events.push({
        date: dateStr,
        title: '恵比寿マラソン大会',
        genre: 'sports',
        venue: '恵比寿ガーデンプレイス',
        area: '恵比寿',
        description: '5km・10kmコースを選べる市民マラソン',
      })
    }
    if (i === 5) {
      events.push({
        date: dateStr,
        title: '中目黒演劇フェスティバル',
        genre: 'theater',
        venue: '中目黒GTプラザ',
        area: '中目黒',
        description: '若手劇団による演劇フェスティバル',
      })
    }
    if (i === 7) {
      events.push({
        date: dateStr,
        title: '渋谷ストリートミュージックフェス',
        genre: 'festival',
        venue: '渋谷公園通り',
        area: '渋谷',
        description: '渋谷の街を音楽で盛り上げるフェスティバル',
      })
      events.push({
        date: dateStr,
        title: '原宿ポップカルチャーマーケット',
        genre: 'art',
        venue: '明治神宮前',
        area: '原宿',
        description: '日本のポップカルチャーを体験できるマーケット',
      })
    }
    if (i === 9) {
      events.push({
        date: dateStr,
        title: '六本木クラシックコンサート',
        genre: 'music',
        venue: '東京ミッドタウン',
        area: '六本木',
        description: 'オーケストラによるクラシックコンサート',
      })
    }
    if (i === 10) {
      events.push({
        date: dateStr,
        title: '下北沢カレーフェス',
        genre: 'food',
        venue: '下北沢駅前広場',
        area: '下北沢',
        description: '30店舗以上が参加するカレーの祭典',
      })
    }
    if (i === 12) {
      events.push({
        date: dateStr,
        title: '表参道ファッションショー',
        genre: 'art',
        venue: '表参道ヒルズ',
        area: '表参道',
        description: '日本の新進デザイナーたちのファッションショー',
      })
    }
    if (i === 14) {
      events.push({
        date: dateStr,
        title: '代々木公園スポーツフェスティバル',
        genre: 'sports',
        venue: '代々木公園',
        area: '代々木',
        description: 'フリスビー・バドミントン・ヨガなど様々なスポーツ体験',
      })
      events.push({
        date: dateStr,
        title: '池袋演劇まつり',
        genre: 'theater',
        venue: '東京芸術劇場',
        area: '池袋',
        description: '年に一度の大規模演劇イベント',
      })
    }
  }

  for (const event of events) {
    await prisma.event.create({ data: event })
  }

  console.log('Seed complete!')
  console.log(`Created users: ${alice.name}, ${bob.name}, ${carol.name}`)
  console.log(`Created group: ${group.name}`)
  console.log(`Created ${events.length} events`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
