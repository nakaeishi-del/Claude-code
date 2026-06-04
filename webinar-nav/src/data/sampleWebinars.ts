import { Webinar } from '../types';
import { generateTasks } from '../utils/taskGenerator';

function getDateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export function createSampleWebinar(): Webinar {
  const webinar: Webinar = {
    id: 'sample-webinar-1',
    title: '読む力が受験を変える！保護者向けウェビナー',
    date: getDateStr(14),
    startTime: '11:00',
    endTime: '12:00',
    target: '中学受験を検討している保護者の方',
    zoomUrl: 'https://zoom.us/j/12345678901',
    meetingId: '123 4567 8901',
    passcode: 'yondemy',
    formUrl: 'https://forms.gle/example',
    eventPageUrl: 'https://yondemy.com/events/example',
    archiveUrl: '',
    memo: 'サンプルのウェビナーです。実際の運用時に削除してください。',
    status: 'upcoming',
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  webinar.tasks = generateTasks(webinar);
  // Mark first 3 tasks as completed for demo
  webinar.tasks[0].status = 'completed';
  webinar.tasks[0].checklist = webinar.tasks[0].checklist.map(c => ({ ...c, checked: true }));
  webinar.tasks[0].completedAt = new Date(Date.now() - 86400000 * 2).toISOString();
  return webinar;
}
