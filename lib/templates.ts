import { Webinar } from './types';

function formatDate(webinar: Webinar): string {
  const d = new Date(webinar.date);
  return `${d.getMonth() + 1}月${d.getDate()}日（${webinar.dayOfWeek}）`;
}

export function generateThanksEmail(webinar: Webinar): string {
  const mainProblemLines = webinar.mainProblem
    ? `\n\n${webinar.mainProblem}\n\n……そんなお悩みはありませんか？`
    : '';

  return `こんにちは！

【無料・ヨンデミー保護者説明会】にお申込みいただきありがとうございます。
お申込みが完了いたしました🤝

📅 お申し込み内容の確認
・日時：${formatDate(webinar)} ${webinar.startTime}~${webinar.endTime}
・場所：オンライン（Zoom）

お時間となりましたら下記URLよりご入室ください！
${webinar.zoomUrl || '【Zoom URLを入力してください】'}
ミーティング ID: ${webinar.zoomMeetingId || '【ミーティングIDを入力してください】'}
パスコード: ${webinar.zoomPasscode || '【パスコードを入力してください】'}
${mainProblemLines}

ヨンデミーは、毎日の読書習慣を通じて、
お子さんが読むことを楽しみながら読書習慣をつけるサービスです。
その積み重ねが、結果として学びの土台になります。

📚「読む力」の土台づくりを始める
${webinar.yondemyLpUrl || 'https://lp.yondemy.com/'}


当日、お会いできるのを楽しみにしております。

ーーーーーーーーーーーーー
株式会社 Yondemy
ーーーーーーーーーーーーー`;
}

export function generate3DayEmail(webinar: Webinar): string {
  const takeawaysList = webinar.takeaways.length > 0
    ? webinar.takeaways.map(t => `・${t}`).join('\n')
    : '・当日の内容をご確認ください';

  return `こんにちは！

${formatDate(webinar)} ${webinar.startTime}～ 開催の
【ヨンデミー保護者説明会：${webinar.title}】
まで、あと3日となりました！

ぜひお見逃しなく📅

━━━━━━━━━━━━━━━━━
📌 当日わかること
━━━━━━━━━━━━━━━━━
${takeawaysList}

━━━━━━━━━━━━━━━━━
📅 開催情報
━━━━━━━━━━━━━━━━━
・日時：${formatDate(webinar)} ${webinar.startTime}~${webinar.endTime}
・場所：オンライン（Zoom）
・参加URL：${webinar.zoomUrl || '【Zoom URLを入力してください】'}
　ミーティング ID: ${webinar.zoomMeetingId || '【ミーティングIDを入力してください】'}
　パスコード: ${webinar.zoomPasscode || '【パスコードを入力してください】'}

当日は少し早めにアクセスいただけるとスムーズです。
ご参加をお待ちしております！

ーーーーーーーーーーーーー
株式会社 Yondemy
ーーーーーーーーーーーーー`;
}

export function generate1DayEmail(webinar: Webinar): string {
  return `こんにちは！

明日 ${formatDate(webinar)} ${webinar.startTime}～ に
【ヨンデミー保護者説明会：${webinar.title}】
を開催します！

いよいよ明日です😊 ぜひご参加ください！

━━━━━━━━━━━━━━━━━
📅 参加方法
━━━━━━━━━━━━━━━━━
・日時：${formatDate(webinar)} ${webinar.startTime}~${webinar.endTime}
・場所：オンライン（Zoom）
・参加URL：${webinar.zoomUrl || '【Zoom URLを入力してください】'}
　ミーティング ID: ${webinar.zoomMeetingId || '【ミーティングIDを入力してください】'}
　パスコード: ${webinar.zoomPasscode || '【パスコードを入力してください】'}

お時間の5分前を目安に入室いただけると幸いです。

ーーーーーーーーーーーーー
株式会社 Yondemy
ーーーーーーーーーーーーー`;
}

export function generateAfterEmail(webinar: Webinar): string {
  const archiveLinks = webinar.relatedArchives.length > 0
    ? '\n📚 関連する過去回のアーカイブ\n' + webinar.relatedArchives.map(a => `・${a.title}\n  ${a.url}`).join('\n')
    : '';

  return `こんにちは！

本日は【ヨンデミー保護者説明会：${webinar.title}】に
ご参加いただき、誠にありがとうございました！

少しでもお役に立てていれば幸いです😊

ーーーーーーーーーーーーー

📚 ヨンデミーについてもっと詳しく知りたい方へ

▼ ヨンデミー公式サイト
${webinar.yondemyLpUrl || 'https://lp.yondemy.com/'}

今日学んだことを、ぜひお子さんとの読書習慣づくりに
活かしていただければ嬉しいです。
${archiveLinks}

またお会いできることを楽しみにしております！

ーーーーーーーーーーーーー
株式会社 Yondemy
ーーーーーーーーーーーーー`;
}

export function generateArchiveEmail(webinar: Webinar): string {
  return `こんにちは！

先日開催した【ヨンデミー保護者説明会：${webinar.title}】に
お申し込みいただき、ありがとうございました。

当日ご都合がつかなかった方へ、
アーカイブ動画をご用意しました！

▼ アーカイブ動画はこちら
${webinar.youtubeUrl || '【YouTube URLを入力してください】'}

ぜひお時間のあるときにご覧ください📺

━━━━━━━━━━━━━━━━━
📚 ヨンデミーについて詳しく知りたい方は
━━━━━━━━━━━━━━━━━
▼ ヨンデミー公式サイト
${webinar.yondemyLpUrl || 'https://lp.yondemy.com/'}

ご不明な点があればお気軽にお問い合わせください。

ーーーーーーーーーーーーー
株式会社 Yondemy
ーーーーーーーーーーーーー`;
}

export function generateXPost(webinar: Webinar): string {
  const dateStr = formatDate(webinar);
  const takeaway = webinar.takeaways[0] || webinar.theme || '';

  return `📚【無料ウェビナー開催】
${webinar.title}

${dateStr} ${webinar.startTime}～
オンライン（Zoom）開催です！

${webinar.empathyText ? webinar.empathyText.substring(0, 80) + (webinar.empathyText.length > 80 ? '...' : '') : ''}

${takeaway ? `✅ ${takeaway}` : ''}

無料・申込制 👇
${webinar.lpUrl || webinar.formUrl || '【イベントページURLを入力してください】'}

#ヨンデミー #読書習慣 #保護者向け`;
}

export function generateLineTitle(webinar: Webinar): string {
  const title = `📚${webinar.title}`;
  // LINE card title max 20 chars
  if (title.length <= 20) return title;
  return title.substring(0, 19) + '…';
}

export function generateLineBody(webinar: Webinar): string {
  const dateStr = `${new Date(webinar.date).getMonth() + 1}/${new Date(webinar.date).getDate()}(${webinar.dayOfWeek})${webinar.startTime}～`;
  const body = `${dateStr} 無料開催！申込はこちら`;
  if (countLineChars(body) <= 60) return body;
  // truncate
  const base = `${dateStr} `;
  const remaining = 60 - countLineChars(base) - 1;
  return base + '無料開催！申込はこちら'.substring(0, Math.max(0, remaining)) + '…';
}

export function countLineChars(text: string): number {
  return text.replace(/\n/g, '').length;
}

export function generateLineRequest(webinar: Webinar): string {
  const dateStr = formatDate(webinar);
  return `LINEカード配信のご依頼です。よろしくお願いいたします。

■ 配信日時
${dateStr}（ウェビナー開催の7日前ごろ）

■ カードタイトル（20文字以内）
${generateLineTitle(webinar)}

■ カード本文（60文字以内・改行を除く）
${generateLineBody(webinar)}

■ リンク先URL
${webinar.lpUrl || webinar.formUrl || '【イベントページURLを入力してください】'}

■ 対象
ヨンデミー保護者LINE読者

どうぞよろしくお願いいたします。`;
}

export function generateEventPage(webinar: Webinar): string {
  const dateStr = formatDate(webinar);
  const takeawaysList = webinar.takeaways.length > 0
    ? webinar.takeaways.map(t => `・${t}`).join('\n')
    : '・詳細は当日公開します';

  const archiveSection = webinar.relatedArchives.length > 0
    ? '\n\n---\n\n## 📼 関連する過去回のアーカイブ\n\n' +
      webinar.relatedArchives.map(a => `**${a.title}**\n${a.url}`).join('\n\n')
    : '';

  return `# ${webinar.title}

## 開催情報

- **日時**：${dateStr} ${webinar.startTime}〜${webinar.endTime}
- **形式**：オンライン（Zoom）
- **参加費**：無料
- **対象**：${webinar.targetAudience || 'ヨンデミーに興味のある保護者の方'}

---

## こんな方におすすめ

${webinar.mainProblem ? `${webinar.mainProblem}\n\n` : ''}${webinar.empathyText || 'お子さんの読書習慣にお悩みの保護者の方へ。'}

---

## 当日わかること

${takeawaysList}

---

## 登壇者

${webinar.speaker ? `**${webinar.speaker}**（株式会社Yondemy）` : '株式会社Yondemy スタッフ'}

---

## 申し込み

▼ 無料申込フォームはこちら
${webinar.formUrl || '【申込フォームURLを入力してください】'}${archiveSection}`;
}

export function generateYoutubeDescription(webinar: Webinar): string {
  const dateStr = formatDate(webinar);
  const takeawaysList = webinar.takeaways.length > 0
    ? webinar.takeaways.map(t => `✅ ${t}`).join('\n')
    : '✅ 当日の内容をご確認ください';

  const archiveLinks = webinar.relatedArchives.length > 0
    ? '\n\n▼ 関連動画\n' + webinar.relatedArchives.map(a => `・${a.title}\n  ${a.url}`).join('\n')
    : '';

  return `【${webinar.title}】

${dateStr} 開催のヨンデミー保護者説明会のアーカイブです。

━━━━━━━━━━━━━━━━━
📌 この動画でわかること
━━━━━━━━━━━━━━━━━
${takeawaysList}

━━━━━━━━━━━━━━━━━
🔗 関連リンク
━━━━━━━━━━━━━━━━━
▼ ヨンデミー公式サイト
${webinar.yondemyLpUrl || 'https://lp.yondemy.com/'}

▼ 申込・詳細ページ
${webinar.lpUrl || webinar.formUrl || '【イベントページURLを入力してください】'}
${archiveLinks}

━━━━━━━━━━━━━━━━━
📚 ヨンデミーとは？
━━━━━━━━━━━━━━━━━
AIが一人ひとりの子どもに合わせた本を選書し、
毎日の読書習慣をサポートするサービスです。

#ヨンデミー #保護者説明会 #読書習慣 #子育て`;
}
