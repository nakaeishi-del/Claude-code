import { MessageTemplate } from '../types';

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'reminder-3days-email',
    title: '3日前リマインドメール',
    category: 'email',
    subject: '【リマインド】{{title}}（{{date_ja}}開催）',
    body: `{{target}} の皆さま

いつもヨンデミーをご利用いただきありがとうございます。

先日お申し込みいただいた、下記ウェビナーの開催が3日後に迫ってまいりました。
改めてご案内いたします。

━━━━━━━━━━━━━━━━
【{{title}}】
━━━━━━━━━━━━━━━━
日時：{{date_ja}}（{{start_time}}〜{{end_time}}）
参加方法：Zoom（オンライン）
Zoom URL：{{zoom_url}}
ミーティングID：{{meeting_id}}
パスコード：{{passcode}}
━━━━━━━━━━━━━━━━

当日は開始5分前にZoomにご入室ください。

ご不明な点がございましたら、お気軽にご返信ください。
皆さまのご参加をお待ちしております！

ヨンデミー`,
    variables: ['target', 'title', 'date_ja', 'start_time', 'end_time', 'zoom_url', 'meeting_id', 'passcode'],
  },
  {
    id: 'reminder-1day-email',
    title: '1日前リマインドメール',
    category: 'email',
    subject: '【明日開催】{{title}}のご案内',
    body: `{{target}} の皆さま

いつもヨンデミーをご利用いただきありがとうございます。

明日のウェビナー開催についてご案内いたします。

━━━━━━━━━━━━━━━━
【{{title}}】
━━━━━━━━━━━━━━━━
日時：{{date_ja}}（{{start_time}}〜{{end_time}}）
Zoom URL：{{zoom_url}}
ミーティングID：{{meeting_id}}
パスコード：{{passcode}}
━━━━━━━━━━━━━━━━

明日のご参加をお待ちしております！
Zoomのリンクはこちらに保存しておいていただけると安心です。

ヨンデミー`,
    variables: ['target', 'title', 'date_ja', 'start_time', 'end_time', 'zoom_url', 'meeting_id', 'passcode'],
  },
  {
    id: 'after-email',
    title: '終了後お礼メール',
    category: 'email',
    subject: '【ご参加ありがとうございました】{{title}}',
    body: `{{target}} の皆さま

本日のウェビナー「{{title}}」にご参加いただき、誠にありがとうございました。

お子さまの読書習慣について、少しでもヒントをお持ち帰りいただけていれば幸いです。

アーカイブ動画は準備ができ次第、改めてご連絡いたします。
引き続き、ヨンデミーをよろしくお願いいたします！

ヨンデミー`,
    variables: ['target', 'title'],
  },
  {
    id: 'archive-email',
    title: 'アーカイブ案内メール',
    category: 'email',
    subject: '【アーカイブ公開】{{title}}の録画をお届けします',
    body: `{{target}} の皆さま

先日開催した「{{title}}」のアーカイブ動画が完成いたしました。

▼ アーカイブはこちら
{{archive_url}}

当日ご参加いただいた方も、ご都合がつかなかった方も、
ぜひお時間のある際にご覧ください。

今後もウェビナーを開催予定です。引き続きよろしくお願いいたします！

ヨンデミー`,
    variables: ['target', 'title', 'archive_url'],
  },
  {
    id: 'x-post',
    title: 'X（Twitter）告知文',
    category: 'x',
    body: `📚 ウェビナー開催のお知らせ

「{{title}}」
🗓 {{date_ja}} {{start_time}}〜{{end_time}}
📌 対象：{{target}}

▼ お申し込みはこちら
{{form_url}}

#ヨンデミー #読書 #オンラインセミナー`,
    variables: ['title', 'date_ja', 'start_time', 'end_time', 'target', 'form_url'],
  },
  {
    id: 'line-request',
    title: 'LINE配信依頼文',
    category: 'line',
    body: `【LINE配信依頼】

以下のウェビナー告知を配信いただけますでしょうか。

■ タイトル：{{title}}
■ 日時：{{date_ja}} {{start_time}}〜{{end_time}}
■ 対象：{{target}}
■ 申込URL：{{form_url}}
■ 配信希望日時：開催3日前まで（ご調整ください）

▼ 配信文面（案）
━━━━━━━━━━━━
📚 ウェビナー開催！
「{{title}}」

{{date_ja}} {{start_time}}〜
お申し込みはこちら👇
{{form_url}}
━━━━━━━━━━━━

よろしくお願いいたします！`,
    variables: ['title', 'date_ja', 'start_time', 'end_time', 'target', 'form_url'],
  },
  {
    id: 'slack-share',
    title: 'Slack共有文',
    category: 'slack',
    body: `📣 ウェビナーのお知らせ

「*{{title}}*」を開催します！

- 日時：{{date_ja}} {{start_time}}〜{{end_time}}
- 対象：{{target}}
- 申込：{{form_url}}

参加希望の方はフォームからどうぞ！`,
    variables: ['title', 'date_ja', 'start_time', 'end_time', 'target', 'form_url'],
  },
];
