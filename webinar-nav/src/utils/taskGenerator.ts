import { Task, Webinar } from '../types';
import { TASK_TEMPLATES } from '../data/taskTemplates';

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function generateTasks(webinar: Webinar): Task[] {
  return TASK_TEMPLATES.map((tpl, idx) => ({
    id: `task-${webinar.id}-${tpl.id}-${Date.now()}-${idx}`,
    webinarId: webinar.id,
    templateId: tpl.id,
    title: tpl.title,
    purpose: tpl.purpose,
    steps: [...tpl.steps],
    checklist: tpl.checklist.map(item => ({ ...item, checked: false })),
    commonMistakes: [...tpl.commonMistakes],
    completionCriteria: tpl.completionCriteria,
    relatedTemplateIds: [...tpl.relatedTemplateIds],
    dueDate: addDays(webinar.date, tpl.daysFromEvent),
    status: 'pending' as const,
    memo: '',
    completedAt: undefined,
  }));
}
