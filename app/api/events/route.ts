import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const EVENT_TEMPLATES = [
  { title: '渋谷ジャズナイト', genre: 'music', venue: 'Blue Note Tokyo', area: '渋谷', description: '一流ジャズミュージシャンによるライブパフォーマンス' },
  { title: '代官山フードフェスティバル', genre: 'food', venue: '代官山アドレス', area: '代官山', description: '全国各地の名物料理が集結するグルメイベント' },
  { title: '新宿アートギャラリー展', genre: 'art', venue: '新宿文化センター', area: '新宿', description: '現代アーティストたちの作品展示会' },
  { title: '恵比寿マラソン大会', genre: 'sports', venue: '恵比寿ガーデンプレイス', area: '恵比寿', description: '5km・10kmコースを選べる市民マラソン' },
  { title: '中目黒演劇フェスティバル', genre: 'theater', venue: '中目黒GTプラザ', area: '中目黒', description: '若手劇団による演劇フェスティバル' },
  { title: '渋谷ストリートミュージックフェス', genre: 'festival', venue: '渋谷公園通り', area: '渋谷', description: '渋谷の街を音楽で盛り上げるフェスティバル' },
  { title: '原宿ポップカルチャーマーケット', genre: 'art', venue: '明治神宮前', area: '原宿', description: '日本のポップカルチャーを体験できるマーケット' },
  { title: '六本木クラシックコンサート', genre: 'music', venue: '東京ミッドタウン', area: '六本木', description: 'オーケストラによるクラシックコンサート' },
  { title: '下北沢カレーフェス', genre: 'food', venue: '下北沢駅前広場', area: '下北沢', description: '30店舗以上が参加するカレーの祭典' },
  { title: '表参道ファッションショー', genre: 'art', venue: '表参道ヒルズ', area: '表参道', description: '日本の新進デザイナーたちのファッションショー' },
  { title: '代々木公園スポーツフェスティバル', genre: 'sports', venue: '代々木公園', area: '代々木', description: 'フリスビー・バドミントン・ヨガなど様々なスポーツ体験' },
  { title: '池袋演劇まつり', genre: 'theater', venue: '東京芸術劇場', area: '池袋', description: '年に一度の大規模演劇イベント' },
  { title: '吉祥寺ジャズストリート', genre: 'music', venue: '吉祥寺駅周辺', area: '吉祥寺', description: '街全体がライブ会場になる音楽祭' },
  { title: '銀座グルメサミット', genre: 'food', venue: '銀座シックス', area: '銀座', description: '銀座の名店が集う究極のグルメイベント' },
]

async function autoSeedEvents(month: string) {
  const [y, m] = month.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const shuffled = [...EVENT_TEMPLATES].sort(() => Math.random() - 0.5)
  const data = shuffled.map((t, i) => {
    const day = Math.min(1 + i * 2, daysInMonth)
    return { ...t, date: `${month}-${String(day).padStart(2, '0')}` }
  })
  await prisma.event.createMany({ data })
}

export async function GET(request: NextRequest) {
  const userId = await getSession(request)
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')
  const genre = searchParams.get('genre')

  const where: {
    date?: { gte: string; lte: string }
    genre?: string
  } = {}

  if (month) {
    where.date = {
      gte: `${month}-01`,
      lte: `${month}-31`,
    }
  }
  if (genre && genre !== 'all') where.genre = genre

  let events = await prisma.event.findMany({
    where,
    include: { likes: true },
    orderBy: { date: 'asc' },
  })

  if (events.length === 0 && !genre) {
    const targetMonth = month || new Date().toISOString().slice(0, 7)
    const monthCount = await prisma.event.count({
      where: { date: { gte: `${targetMonth}-01`, lte: `${targetMonth}-31` } },
    })
    if (monthCount === 0) {
      await autoSeedEvents(targetMonth)
      events = await prisma.event.findMany({
        where,
        include: { likes: true },
        orderBy: { date: 'asc' },
      })
    }
  }

  const eventsWithLike = events.map((event) => ({
    id: event.id,
    date: event.date,
    title: event.title,
    genre: event.genre,
    venue: event.venue,
    area: event.area,
    description: event.description,
    url: event.url,
    liked: userId ? event.likes.some((l) => l.userId === userId) : false,
    likeCount: event.likes.length,
  }))

  return NextResponse.json({ events: eventsWithLike })
}
