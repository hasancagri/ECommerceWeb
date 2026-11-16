// 013: Arama geçmişi API istemcisi (Personalization BC, gateway /api/personalization/**). Tümü
// auth-zorunlu (bearer) — geçmiş kişisel; sunucu kimliği token'dan çözer, kullanıcı yalnız kendi verisi.
// BASE: catalog.ts ile aynı — boşsa vite proxy (:5173 → gateway), env varsa onu kullanır.
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const ROOT = '/api/personalization/v1/search-history'

export type SearchHistoryMode = 'keyword' | 'semantic' | 'hybrid'

export interface SearchHistoryItem {
  query: string
  mode: SearchHistoryMode
  lastSearchedAt: string
  count: number
}

export interface SearchHistoryPage {
  data: SearchHistoryItem[]
  page: number
  pageSize: number
  totalCount: number
}

export class PersonalizationApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

export function getSearchHistory(token: string, page = 1, pageSize = 20): Promise<SearchHistoryPage> {
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return fetch(`${BASE}${ROOT}?${qs}`, { headers: authHeaders(token) }).then((r) => {
    if (!r.ok) throw new PersonalizationApiError(r.status, `İstek başarısız (${r.status})`)
    return r.json() as Promise<SearchHistoryPage>
  })
}

export function deleteSearchHistoryItem(token: string, query: string): Promise<void> {
  const qs = new URLSearchParams({ query })
  return fetch(`${BASE}${ROOT}/item?${qs}`, { method: 'DELETE', headers: authHeaders(token) }).then((r) => {
    if (!r.ok) throw new PersonalizationApiError(r.status, `Silme başarısız (${r.status})`)
  })
}

export function clearSearchHistory(token: string): Promise<void> {
  return fetch(`${BASE}${ROOT}`, { method: 'DELETE', headers: authHeaders(token) }).then((r) => {
    if (!r.ok) throw new PersonalizationApiError(r.status, `Temizleme başarısız (${r.status})`)
  })
}
