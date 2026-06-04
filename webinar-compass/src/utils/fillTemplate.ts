import { Webinar } from '../types';

function toJaDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`;
}

export function fillTemplate(body: string, webinar: Webinar | null): string {
  if (!webinar) return body;
  const map: Record<string, string> = {
    title: webinar.title,
    date_ja: toJaDate(webinar.date),
    start_time: webinar.startTime,
    end_time: webinar.endTime,
    target: webinar.target,
    speaker: webinar.speaker,
    theme: webinar.theme,
    zoom_url: webinar.zoomUrl,
    meeting_id: webinar.meetingId,
    passcode: webinar.passcode,
    form_url: webinar.formUrl,
    event_page_url: webinar.eventPageUrl,
    archive_url: webinar.archiveUrl || '（準備中）',
  };
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => map[key] ?? `{{${key}}}`);
}
