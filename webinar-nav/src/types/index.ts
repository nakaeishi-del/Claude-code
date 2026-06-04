export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type WebinarStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  checked: boolean;
}

export interface Task {
  id: string;
  webinarId: string;
  templateId: string;
  title: string;
  purpose: string;
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

export interface AppHistory {
  id: string;
  type: 'task_completed' | 'template_copied' | 'memo_added' | 'webinar_created';
  webinarId?: string;
  taskId?: string;
  templateId?: string;
  label: string;
  createdAt: string;
}
