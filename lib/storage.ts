'use client';
import { Webinar, Settings } from './types';

const WEBINARS_KEY = 'wfm_webinars';
const SETTINGS_KEY = 'wfm_settings';

export function getWebinars(): Webinar[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(WEBINARS_KEY) || '[]');
  } catch { return []; }
}

export function getWebinar(id: string): Webinar | null {
  return getWebinars().find(w => w.id === id) ?? null;
}

export function saveWebinar(webinar: Webinar): void {
  const all = getWebinars();
  const idx = all.findIndex(w => w.id === webinar.id);
  const updated = { ...webinar, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = updated; else all.push(updated);
  localStorage.setItem(WEBINARS_KEY, JSON.stringify(all));
}

export function deleteWebinar(id: string): void {
  localStorage.setItem(WEBINARS_KEY, JSON.stringify(getWebinars().filter(w => w.id !== id)));
}

export function getSettings(): Settings {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
  catch { return {}; }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
