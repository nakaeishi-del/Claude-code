import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text || typeof text !== 'string' || text.trim().length < 5) {
    return NextResponse.json({ error: 'テキストが短すぎます' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ enhanced: text, note: 'API key not configured' })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `あなたは日記の文章整形アシスタントです。
音声認識で書かれた日記テキストを、自然で読みやすい日本語に整えてください。

ルール:
- 誤字や句読点を修正する
- 話し言葉の雰囲気を残しつつ、少し自然に整える
- 意味や内容は絶対に変えない
- 長さはほぼ同じにする
- 絵文字は追加しない
- 整形後のテキストだけ返す（説明文や前置きは不要）

テキスト:
${text.trim()}`,
        },
      ],
    })

    const enhanced = message.content[0].type === 'text' ? message.content[0].text : text
    return NextResponse.json({ enhanced })
  } catch (error) {
    console.error('Anthropic API error:', error)
    return NextResponse.json({ enhanced: text, error: 'AI整形に失敗しました' })
  }
}
