export type TaskStatus = 'pending' | 'completed' | 'skipped';
export type WebinarStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type TaskPhase = 'before' | 'day' | 'after';

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
}

export interface TaskTemplate {
  id: string;
  title: string;
  purpose: string;
  daysFromEvent: number;
  phase: TaskPhase;
  steps: string[];
  checklist: Array<{ label: string; required: boolean }>;
  commonMistakes: string[];
  completionCriteria: string;
  relatedTemplateIds: string[];
}

export interface Task {
  id: string;
  webinarId: string;
  templateId: string;
  title: string;
  purpose: string;
  phase: TaskPhase;
  steps: string[];
  checklist: ChecklistItem[];
  commonMistakes: string[];
  completionCriteria: string;
  relatedTemplateIds: string[];
  dueDate: string;
  status: TaskStatus;
  memo: string;
  completedAt?: string;
}

export interface Webinar {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  target: string;
  speaker: string;
  theme: string;
  zoomUrl: string;
  meetingId: string;
  passcode: string;
  formUrl: string;
  eventPageUrl: string;
  archiveUrl: string;
  memo: string;
  status: WebinarStatus;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: 'email' | 'x' | 'line' | 'slack';
  subject?: string;
  body: string;
  variables: string[];
}

export interface HistoryEntry {
  id: string;
  type: 'webinar_created' | 'webinar_deleted' | 'task_completed' | 'template_copied' | 'memo_saved';
  webinarId?: string;
  webinarTitle?: string;
  taskId?: string;
  taskTitle?: string;
  templateId?: string;
  label: string;
  createdAt: string;
}
