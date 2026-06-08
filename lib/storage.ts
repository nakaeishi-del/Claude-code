'use client'

import { openDB, DBSchema } from 'idb'
import { DiaryEntry } from './types'

interface IkkiDB extends DBSchema {
  entries: {
    key: string
    value: DiaryEntry
    indexes: { 'by-date': string; 'by-createdAt': number }
  }
}

const DB_NAME = 'ikki-diary-db'
const DB_VERSION = 1

async function getDB() {
  return openDB<IkkiDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('entries', { keyPath: 'id' })
      store.createIndex('by-date', 'date')
      store.createIndex('by-createdAt', 'createdAt')
    },
  })
}

export async function saveEntry(entry: DiaryEntry): Promise<void> {
  const db = await getDB()
  await db.put('entries', entry)
}

export async function getEntry(id: string): Promise<DiaryEntry | undefined> {
  const db = await getDB()
  return db.get('entries', id)
}

export async function getEntriesByDate(date: string): Promise<DiaryEntry[]> {
  const db = await getDB()
  return db.getAllFromIndex('entries', 'by-date', date)
}

export async function getAllEntries(): Promise<DiaryEntry[]> {
  const db = await getDB()
  const all = await db.getAll('entries')
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('entries', id)
}

export async function updateEntry(entry: DiaryEntry): Promise<void> {
  const db = await getDB()
  await db.put('entries', { ...entry, updatedAt: Date.now() })
}

export async function getEntryDates(): Promise<string[]> {
  const all = await getAllEntries()
  const dates = new Set(all.map((e) => e.date))
  return Array.from(dates)
}
