import { Webinar, HistoryEntry } from '../types';

const WEBINARS_KEY = 'compass-webinars';
const HISTORY_KEY = 'compass-history';

export function getWebinars(): Webinar[] {
  try {
    return JSON.parse(localStorage.getItem(WEBINARS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function getWebinar(id: string): Webinar | null {
  return getWebinars().find(w => w.id === id) ?? null;
}

export function saveWebinar(webinar: Webinar): void {
  const list = getWebinars();
  const idx = list.findIndex(w => w.id === webinar.id);
  const updated = { ...webinar, updatedAt: new Date().toISOString() };
  if (idx >= 0) list[idx] = updated;
  else list.unshift(updated);
  localStorage.setItem(WEBINARS_KEY, JSON.stringify(list));
}

export function deleteWebinar(id: string): void {
  localStorage.setItem(WEBINARS_KEY, JSON.stringify(getWebinars().filter(w => w.id !== id)));
}

export function getHistory(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): void {
  const list = getHistory();
  list.unshift({ ...entry, id: `h${Date.now()}`, createdAt: new Date().toISOString() });
  if (list.length > 500) list.splice(500);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}
