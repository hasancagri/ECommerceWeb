// Son Gezdiğim Kitaplar: Library BC istemcisi (gateway /api/library/**). Auth-zorunlu (bearer) —
// gezme geçmişi kişisel; sunucu kimliği token'dan çözer, kullanıcı yalnız kendi verisi. BASE:
// catalog.ts/personalization.ts ile aynı — boşsa vite proxy (:5173 → gateway), env varsa onu kullanır.
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const ROOT = '/api/library/v1/viewed'

export interface RecentlyViewedItem {
  productId: string
  title: string
  author: string
  coverUrl: string | null
  isbn: string
  viewedAt: string
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

// Kitap detayı açılınca gezme kaydı (ateşle-unut; detay sayfası künye-snapshot taşır — BC-arası çağrı yok).
export function recordView(
  token: string,
  book: { productId: string; title: string; author: string; coverUrl: string | null; isbn: string },
): Promise<void> {
  return fetch(`${BASE}${ROOT}`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(book),
  }).then((r) => {
    if (!r.ok) throw new Error(`Kayıt başarısız (${r.status})`)
  })
}

// En yeni 20 gezilen (en yeni önce). Sunucu { data: [...] } sarmalı döner (RecentlyViewedResponse).
export function getRecentlyViewed(token: string): Promise<RecentlyViewedItem[]> {
  return fetch(`${BASE}${ROOT}`, { headers: authHeaders(token) })
    .then((r) => {
      if (!r.ok) throw new Error(`İstek başarısız (${r.status})`)
      return r.json() as Promise<{ data: RecentlyViewedItem[] }>
    })
    .then((x) => x.data ?? [])
}
