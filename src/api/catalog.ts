// 011: Catalog hibrit arama API istemcisi. Tek origin = Gateway (VITE_API_BASE_URL). Anonim —
// keşif login istemez. mode: keyword (BM25) | semantic (kNN) | hybrid (RRF).
// Same-origin: vite dev proxy /api → gateway (vite.config). BASE boş → tarayıcı :5173'e vurur,
// gateway portu (5060, Chrome unsafe) hiç görünmez. Env verilirse onu kullanır (prod/override).
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export type SearchMode = 'keyword' | 'semantic' | 'hybrid'

// Catalog ProductSummary (ASP.NET camelCase JSON). Fiyat liste fiyatı; discountRate ayrı.
export interface ProductSummary {
  isbn: string
  name: string
  imageUrl: string | null
  price: number | null
  discountRate: number | null
  tags: string[]
}

export class CatalogApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`)
  if (!response.ok) throw new CatalogApiError(response.status, `İstek başarısız (${response.status})`)
  return (await response.json()) as T
}

// 012: arama doğrudan Catalog'a gider (/api/catalog/products/search) — app-BFF söküldü. Login'de bearer
// gönderilir → Catalog userId'yi çözüp UserSearched yayınlar (Personalization kaydeder). Anonim (token
// yok) → kaydedilmez, arama çalışır.
export function searchProducts(
  query: string,
  mode: SearchMode = 'keyword',
  limit = 20,
  token?: string,
): Promise<ProductSummary[]> {
  const qs = new URLSearchParams({ q: query, mode, limit: String(limit) })
  return fetch(`${BASE}/api/catalog/products/search?${qs}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then((r) => {
    if (!r.ok) throw new CatalogApiError(r.status, `İstek başarısız (${r.status})`)
    return r.json() as Promise<ProductSummary[]>
  })
}

export function similarProducts(isbn: string, limit = 10): Promise<ProductSummary[]> {
  return getJson<ProductSummary[]>(`/api/catalog/products/${encodeURIComponent(isbn)}/similar?limit=${limit}`)
}
