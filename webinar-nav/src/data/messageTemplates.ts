import { MessageTemplate } from '../types';

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'reminder-3days-email',
    title: '3日前リマインドメール',
    category: 'email',
    subject: '【3日後開催】{{title}} のご案内',
    body: `{{title}} にお申し込みいただきありがとうございます。

開催まであと3日となりました。改めてご案内いたします。

━━━━━━━━━━━━━━━━━━━━━━
■ 開催概要
━━━━━━━━━━━━━━━━━━━━━━
タイトル：{{title}}
日時：{{date}} {{time}}
参加方法：Zoom（オンライン）

━━━━━━━━━━━━━━━━━━━━━━
■ Zoom参加情報
━━━━━━━━━━━━━━━━━━━━━━
参加URL：{{zoom_url}}
ミーティングID：{{meeting_id}}
パスコード：{{passcode}}

※ 開始5分前には入室いただけます。
※ URLをクリックすると自動的にZoomが起動します。

━━━━━━━━━━━━━━━━━━━━━━

当日のご参加をお待ちしております！

ご不明な点がございましたら、お気軽にご返信ください。

ヨンデミー事務局`,
    variables: ['{{title}}', '{{date}}', '{{time}}', '{{zoom_url}}', '{{meeting_id}}', '{{passcode}}'],
  },
  {
    id: 'reminder-1day-email',
    title: '1日前リマインドメール',
    category: 'email',
    subject: '【明日開催】{{title}} のご案内',
    body: `明日、{{title}} を開催いたします！

お申し込みいただいたみなさまへ、改めてご案内いたします。

━━━━━━━━━━━━━━━━━━━━━━
■ 開催概要
━━━━━━━━━━━━━━━━━━━━━━
タイトル：{{title}}
日時：{{date}} {{time}}

━━━━━━━━━━━━━━━━━━━━━━
■ Zoom参加情報
━━━━━━━━━━━━━━━━━━━━━━
参加URL：{{zoom_url}}
ミーティングID：{{meeting_id}}
パスコード：{{passcode}}

━━━━━━━━━━━━━━━━━━━━━━

■ 当日のご準備について
・Zoomアプリを事前にインストールしておくとスムーズです
・開始5分前から入室できます
・音声が聞こえない場合は、一度退出して再入室をお試しください

明日のご参加、楽しみにしております！

ヨンデミー事務局`,
    variables: ['{{title}}', '{{date}}', '{{time}}', '{{zoom_url}}', '{{meeting_id}}', '{{passcode}}'],
  },
  {
    id: 'after-email',
    title: '終了後メール（御礼）',
    category: 'email',
    subject: '【御礼】{{title}} ご参加ありがとうございました',
    body: `本日は {{title}} にご参加いただき、誠にありがとうございました。

おかげさまで無事に終了することができました。

アーカイブ動画は準備ができ次第、あらためてご案内いたします。
もうしばらくお待ちください。

また次回のウェビナーでもお会いできることを楽しみにしております。

引き続き、ヨンデミーをよろしくお願いいたします。

ヨンデミー事務局`,
    variables: ['{{title}}'],
  },
  {
    id: 'archive-email',
    title: 'アーカイブ配信メール',
    category: 'email',
    subject: '【アーカイブ公開】{{title}} の録画をお届けします',
    body: `先日開催いたしました {{title}} のアーカイブをお届けします。

当日ご参加いただいた方も、ご都合がつかなかった方も、ぜひご覧ください。

━━━━━━━━━━━━━━━━━━━━━━
■ アーカイブ動画
━━━━━━━━━━━━━━━━━━━━━━
{{archive_url}}

━━━━━━━━━━━━━━━━━━━━━━

ご質問やご感想がございましたら、お気軽にご返信ください。

またのご参加をお待ちしております！

ヨンデミー事務局`,
    variables: ['{{title}}', '{{archive_url}}'],
  },
  {
    id: 'x-post',
    title: 'X（Twitter）告知',
    category: 'x',
    body: `📚 【ウェビナー開催】{{title}}

{{date}} {{time}} にオンラインで開催します！

✅ 申込みはこちら
{{form_url}}

#ヨンデミー #読書 #子育て`,
    variables: ['{{title}}', '{{date}}', '{{time}}', '{{form_url}}'],
  },
  {
    id: 'line-request',
    title: 'LINE配信依頼文',
    category: 'line',
    body: `お世話になっております。

ウェビナーのLINE配信をお願いできますでしょうか。

■ 配信内容（案）
タイトル：{{title}}
日時：{{date}} {{time}}
申込ページ：{{event_page_url}}

■ 配信希望日
開催3日前までにお願いできますと幸いです。

ご確認のほど、よろしくお願いいたします。`,
    variables: ['{{title}}', '{{date}}', '{{time}}', '{{event_page_url}}'],
  },
  {
    id: 'slack-request',
    title: 'Slack依頼文',
    category: 'slack',
    body: `お疲れさまです！

ウェビナーの準備が整いましたのでご共有です 🎉

【{{title}}】
📅 {{date}} {{time}}
📝 申込：{{form_url}}
🔗 イベントページ：{{event_page_url}}

告知・拡散にご協力いただけると嬉しいです！
よろしくお願いします 🙏`,
    variables: ['{{title}}', '{{date}}', '{{time}}', '{{form_url}}', '{{event_page_url}}'],
  },
];
