// 014: Anon sohbet kalıcılığı — sessionStorage. F5'e (yenileme) dayanır, sekme kapanınca OTOMATİK
// silinir (localStorage DEĞİL — kalıntı/gizlilik derdi yok; anon doğası gereği geçici). Login'de
// sunucu Conversation otoriter; bu yalnız anonim misafir içindir.
import type { ReplyItem } from '../api/chat'

export interface StoredMsg {
  role: 'user' | 'assistant'
  text: string
  items?: ReplyItem[]
  error?: boolean
}

export interface AnonConvo {
  id: string
  title: string
  updatedAt: string
  messages: StoredMsg[]
}

const KEY = 'scout.anon.convos'
const MAX = 50

function read(): AnonConvo[] {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AnonConvo[]) : []
  } catch {
    return []
  }
}

function write(list: AnonConvo[]): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch {
    /* kota aşımı → sessizce geç */
  }
}

// En yeni üstte.
export function listAnon(): AnonConvo[] {
  return read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getAnon(id: string): AnonConvo | undefined {
  return read().find((c) => c.id === id)
}

// Aktif sohbeti kaydet/güncelle (başlık ilk kullanıcı mesajından türetilir).
export function saveAnon(id: string, messages: StoredMsg[]): void {
  const list = read()
  const firstUser = messages.find((m) => m.role === 'user')?.text ?? 'Sohbet'
  const title = firstUser.length > 60 ? firstUser.slice(0, 60).trimEnd() + '…' : firstUser
  const updatedAt = new Date().toISOString()
  const idx = list.findIndex((c) => c.id === id)
  if (idx >= 0) {
    list[idx] = { ...list[idx], messages, updatedAt, title: list[idx].title || title }
  } else {
    list.unshift({ id, title, updatedAt, messages })
  }
  write(list)
}

export function deleteAnon(id: string): void {
  write(read().filter((c) => c.id !== id))
}
