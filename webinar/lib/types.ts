export type WebinarPhase = "setup" | "threeDaysBefore" | "oneDayBefore" | "dayOf" | "after";
export type TaskPriority = "high" | "medium" | "low";
export type FieldType = "text" | "url" | "textarea";

export type RequiredField = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
};

export type WebinarTask = {
  id: string;
  title: string;
  purpose: string;
  dueDate: string;
  phase: WebinarPhase;
  priority: TaskPriority;
  estimatedMinutes: number;
  externalToolName?: string;
  externalUrl?: string;
  instructions: string[];
  requiredFields: RequiredField[];
  completionCriteria: string[];
  warnings: string[];
  completed: boolean;
  completedAt?: string;
  fieldValues?: Record<string, string>;
};

export type RelatedContent = {
  title: string;
  url: string;
  description?: string;
};

export type Webinar = {
  id: string;
  title: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  targetAudience: string;
  theme: string;
  speaker?: string;
  mainProblem: string;
  empathyText: string;
  takeaways: string[];
  zoomUrl?: string;
  zoomMeetingId?: string;
  zoomPasscode?: string;
  zoomAdminUrl?: string;
  formUrl?: string;
  formEditUrl?: string;
  responseSheetUrl?: string;
  surveyUrl?: string;
  lpUrl?: string;
  lpEditUrl?: string;
  eventListUrl?: string;
  youtubeUrl?: string;
  youtubeStudioUrl?: string;
  thumbnailUrl?: string;
  figmaUrl?: string;
  mailToolUrl?: string;
  lineRequestUrl?: string;
  slackUrl?: string;
  yondemyLpUrl?: string;
  hamaruUrl?: string;
  relatedArchives: RelatedContent[];
  relatedNotes: RelatedContent[];
  tasks: WebinarTask[];
  createdAt: string;
  updatedAt: string;
};

export type Settings = {
  zoomAdminUrl?: string;
  googleFormUrl?: string;
  figmaTemplateUrl?: string;
  youtubeStudioUrl?: string;
  mailToolUrl?: string;
  eventListUrl?: string;
  yondemyLpUrl?: string;
  hamaruUrl?: string;
  faqUrl?: string;
  signature?: string;
};
