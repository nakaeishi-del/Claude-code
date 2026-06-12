export interface Restaurant {
  name: string
  area: string
  genre: string
  priceRange: 'budget' | 'mid' | 'high'
  rating: number
  description: string
}

const restaurants: Restaurant[] = [
  // === BUDGET ===
  { name: '居酒屋 新宿 いろは', area: '新宿', genre: '居酒屋', priceRange: 'budget', rating: 4.1, description: 'アットホームな雰囲気で地酒と旬の料理を楽しめる居酒屋' },
  { name: 'ラーメン 中目黒 麺道場', area: '中目黒', genre: 'ラーメン', priceRange: 'budget', rating: 4.4, description: '豚骨醤油スープの濃厚ラーメンが人気の専門店' },
  { name: 'カフェ 渋谷 ブランシュ', area: '渋谷', genre: 'カフェ', priceRange: 'budget', rating: 4.0, description: 'こだわりのスペシャルティコーヒーとスイーツのカフェ' },
  { name: '韓国料理 新宿 ハニャン', area: '新宿', genre: '韓国料理', priceRange: 'budget', rating: 4.2, description: '本場韓国の味を再現したサムギョプサルとチゲ鍋' },
  { name: '焼き鳥 渋谷 鳥吉', area: '渋谷', genre: '焼き鳥', priceRange: 'budget', rating: 4.2, description: '炭火で丁寧に焼く厳選地鶏の焼き鳥専門店' },
  { name: 'もつ鍋 新宿 博多亭', area: '新宿', genre: '鍋料理', priceRange: 'budget', rating: 4.3, description: '博多直送の新鮮もつを使ったもつ鍋専門店' },
  { name: 'ピザ 渋谷 ドン・ペッペ', area: '渋谷', genre: 'イタリアン', priceRange: 'budget', rating: 4.1, description: '薪窯で焼くナポリ正統派ピッツァの専門店' },
  { name: 'カレー 神保町 スパイス工房', area: '神保町', genre: 'カレー', priceRange: 'budget', rating: 4.3, description: 'スリランカ直輸入スパイスを使った本格カレー専門店' },
  { name: '牛丼 秋葉原 肉之家', area: '秋葉原', genre: '丼もの', priceRange: 'budget', rating: 3.9, description: '厳選和牛を使ったこだわりの牛丼専門店' },
  { name: '餃子 高田馬場 点心楼', area: '高田馬場', genre: '中華料理', priceRange: 'budget', rating: 4.2, description: '手包み餃子と担々麺が人気の中華食堂' },
  { name: '立ち飲み 有楽町 ワインスタンド', area: '有楽町', genre: 'ワインバー', priceRange: 'budget', rating: 4.0, description: 'グラスワイン500円からの気軽なワインスタンド' },
  { name: 'そば 神田 手打ち庵', area: '神田', genre: 'そば', priceRange: 'budget', rating: 4.3, description: '毎朝石臼で挽く十割そばが絶品の老舗そば屋' },
  { name: 'やきとん 吉祥寺 大衆食堂', area: '吉祥寺', genre: '居酒屋', priceRange: 'budget', rating: 4.1, description: 'レトロな雰囲気でリーズナブルにやきとんが楽しめる' },
  { name: 'タコス 下北沢 メキシコ', area: '下北沢', genre: 'メキシコ料理', priceRange: 'budget', rating: 4.0, description: '本格メキシコ料理とタコスが安く楽しめる' },
  { name: '串かつ 上野 大阪屋', area: '上野', genre: '串かつ', priceRange: 'budget', rating: 4.2, description: '大阪直伝の二度付け禁止の本格串かつ店' },
  { name: '台湾料理 池袋 小吃堂', area: '池袋', genre: '台湾料理', priceRange: 'budget', rating: 4.3, description: '魯肉飯と台湾ラーメンが人気の台湾食堂' },
  { name: 'とんかつ 三軒茶屋 勝一', area: '三軒茶屋', genre: 'とんかつ', priceRange: 'budget', rating: 4.4, description: '特製パン粉で揚げるジューシーなとんかつ専門店' },
  { name: '鶏料理 学芸大学 にわとり', area: '学芸大学', genre: '鶏料理', priceRange: 'budget', rating: 4.1, description: 'ブランド地鶏を使った焼き鳥と鍋料理の店' },

  // === MID ===
  { name: '炭火焼き 渋谷 山本', area: '渋谷', genre: '焼肉', priceRange: 'mid', rating: 4.3, description: '厳選黒毛和牛を炭火で豪快に焼く人気の焼肉店' },
  { name: 'イタリアン 代官山 テラッツァ', area: '代官山', genre: 'イタリアン', priceRange: 'mid', rating: 4.5, description: 'テラス席で食べる本格ナポリピッツァとパスタ' },
  { name: 'バル 恵比寿 エル・スール', area: '恵比寿', genre: 'スペイン料理', priceRange: 'mid', rating: 4.3, description: '本格タパスとパエリアが楽しめるスペインバル' },
  { name: 'パスタ 中目黒 ポルチーニ', area: '中目黒', genre: 'イタリアン', priceRange: 'mid', rating: 4.4, description: '手打ちパスタとトリュフ料理が自慢のトラットリア' },
  { name: 'ワインバー 代官山 ラ・カーヴ', area: '代官山', genre: 'ワインバー', priceRange: 'mid', rating: 4.5, description: '世界各地のワインと合わせるシャルキュトリーが人気' },
  { name: '中華 横浜中華街 龍宝', area: '横浜', genre: '中華料理', priceRange: 'mid', rating: 4.4, description: '本格広東料理と飲茶が楽しめる老舗中国料理店' },
  { name: '日本酒バー 銀座 正宗', area: '銀座', genre: '和食', priceRange: 'mid', rating: 4.5, description: '全国の銘酒と合わせる創作和食のペアリングが絶品' },
  { name: 'ダイニングバー 下北沢 月光', area: '下北沢', genre: '居酒屋', priceRange: 'mid', rating: 4.2, description: 'クラフトビールと創作おつまみが楽しめるおしゃれなバー' },
  { name: 'ビストロ 目黒 ル・プチ', area: '目黒', genre: 'フレンチ', priceRange: 'mid', rating: 4.4, description: '気軽に楽しめる本格フランス家庭料理のビストロ' },
  { name: 'タイ料理 青山 チャオプラヤ', area: '青山', genre: 'タイ料理', priceRange: 'mid', rating: 4.3, description: 'バンコクから直輸入の食材を使う本格タイ料理店' },
  { name: '鉄板焼き 銀座 旬彩', area: '銀座', genre: '鉄板焼き', priceRange: 'mid', rating: 4.6, description: '目の前で焼き上げる旬の食材と和牛の鉄板焼き' },
  { name: 'クラフトビール 渋谷 ブルワリー', area: '渋谷', genre: 'バー', priceRange: 'mid', rating: 4.2, description: '自家醸造クラフトビールと相性抜群のグリル料理' },
  { name: 'うなぎ 浜松町 川勝', area: '浜松町', genre: 'うなぎ', priceRange: 'mid', rating: 4.5, description: '愛知直送の天然うなぎを備長炭で焼く専門店' },
  { name: '焼き鳥 恵比寿 串匠', area: '恵比寿', genre: '焼き鳥', priceRange: 'mid', rating: 4.5, description: '地鶏の全部位を一本一本丁寧に焼く本格焼き鳥店' },
  { name: 'インド料理 新宿 スパイス', area: '新宿', genre: 'インド料理', priceRange: 'mid', rating: 4.3, description: '北インド出身シェフによる本格タンドール料理' },
  { name: 'ガレット 麻布十番 ブルトン', area: '麻布十番', genre: 'フレンチ', priceRange: 'mid', rating: 4.4, description: 'ブルターニュ地方のそば粉ガレットとシードルの店' },
  { name: '天ぷら 銀座 揚小路', area: '銀座', genre: '天ぷら', priceRange: 'mid', rating: 4.5, description: 'ごまの香り漂う揚げたての天ぷらが楽しめる店' },
  { name: 'しゃぶしゃぶ 新宿 彩膳', area: '新宿', genre: 'しゃぶしゃぶ', priceRange: 'mid', rating: 4.3, description: '黒毛和牛と豆乳スープの体に優しいしゃぶしゃぶ' },

  // === HIGH ===
  { name: '鮨 銀座 一', area: '銀座', genre: '寿司', priceRange: 'high', rating: 4.8, description: '江戸前寿司の真髄を体験できる老舗寿司店' },
  { name: 'ビストロ 恵比寿 シェ・ポール', area: '恵比寿', genre: 'フレンチ', priceRange: 'high', rating: 4.6, description: '本格フランス料理をカジュアルに楽しめるビストロ' },
  { name: '天ぷら 表参道 天よし', area: '表参道', genre: '天ぷら', priceRange: 'high', rating: 4.7, description: '旬の食材を使った江戸前天ぷらのカウンタースタイル店' },
  { name: '和食 六本木 菊水', area: '六本木', genre: '和食', priceRange: 'high', rating: 4.9, description: '四季を感じる懐石料理を個室でゆっくりと楽しめる名店' },
  { name: 'ステーキ 六本木 グリルハウス', area: '六本木', genre: 'ステーキ', priceRange: 'high', rating: 4.6, description: 'A5ランク和牛のステーキを豪快に味わえる高級ステーキハウス' },
  { name: 'フレンチ 広尾 ル・クロ', area: '広尾', genre: 'フレンチ', priceRange: 'high', rating: 4.8, description: '素材を活かしたモダンフレンチのオーナーシェフ店' },
  { name: '焼肉 恵比寿 和牛苑', area: '恵比寿', genre: '焼肉', priceRange: 'high', rating: 4.6, description: '近江牛・松阪牛・神戸牛の三大和牛が楽しめる高級焼肉店' },
  { name: 'しゃぶしゃぶ 表参道 かすみ草', area: '表参道', genre: 'しゃぶしゃぶ', priceRange: 'high', rating: 4.7, description: '黒毛和牛を昆布だしで楽しむ上質なしゃぶしゃぶ店' },
  { name: 'イタリアン 麻布 ラ・ベッラ', area: '麻布', genre: 'イタリアン', priceRange: 'high', rating: 4.7, description: '白トリュフと熟成肉が自慢のモダンイタリアン' },
  { name: '鮨 西麻布 寿司職人', area: '西麻布', genre: '寿司', priceRange: 'high', rating: 4.8, description: '最高峰の食材を使ったカウンター寿司の名店' },
  { name: '中国料理 六本木 翡翠', area: '六本木', genre: '中華料理', priceRange: 'high', rating: 4.7, description: '香港直伝の高級広東料理を個室でゆっくりと' },
  { name: '日本料理 赤坂 蓬来', area: '赤坂', genre: '和食', priceRange: 'high', rating: 4.9, description: '江戸料理の伝統を継承する老舗割烹料理店' },
  { name: 'フレンチ 丸の内 グラン・テーブル', area: '丸の内', genre: 'フレンチ', priceRange: 'high', rating: 4.7, description: '東京の夜景を望む最上階のコース料理レストラン' },
  { name: 'ワインダイニング 代官山 セラー', area: '代官山', genre: 'ワインバー', priceRange: 'high', rating: 4.6, description: '世界100種以上のグランヴァンとガストロノミー料理' },
  { name: '懐石 四谷 如是', area: '四谷', genre: '和食', priceRange: 'high', rating: 4.8, description: '四季折々の食材を使う本格茶懐石料理' },
]

export function getRestaurantSuggestions(
  priceRange: string,
  count: number = 1
): Restaurant[] {
  const filtered = restaurants.filter((r) => r.priceRange === priceRange)
  const pool = filtered.length > 0 ? filtered : restaurants

  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
