import { Webinar, AppHistory } from '../types';

const WEBINARS_KEY = 'webinar-nav-webinars';
const HISTORY_KEY = 'webinar-nav-history';

export function getWebinars(): Webinar[] {
  try {
    return JSON.parse(localStorage.getItem(WEBINARS_KEY) || '[]');
  } catch { return []; }
}

export function getWebinar(id: string): Webinar | null {
  return getWebinars().find(w => w.id === id) ?? null;
}

export function saveWebinar(webinar: Webinar): void {
  const webinars = getWebinars();
  const idx = webinars.findIndex(w => w.id === webinar.id);
  if (idx >= 0) webinars[idx] = webinar;
  else webinars.unshift(webinar);
  localStorage.setItem(WEBINARS_KEY, JSON.stringify(webinars));
}

export function deleteWebinar(id: string): void {
  const webinars = getWebinars().filter(w => w.id !== id);
  localStorage.setItem(WEBINARS_KEY, JSON.stringify(webinars));
}

export function getHistory(): AppHistory[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

export function addHistory(entry: Omit<AppHistory, 'id' | 'createdAt'>): void {
  const history = getHistory();
  history.unshift({ ...entry, id: `h-${Date.now()}`, createdAt: new Date().toISOString() });
  if (history.length > 200) history.splice(200);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
