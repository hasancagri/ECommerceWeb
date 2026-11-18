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

// 015: tek kitap detayı (GetBook.Response — camelCase). Detay sayfası ISBN'le çeker.
export interface BookDetailDto {
  id: string
  isbn: string
  title: string
  authors: string
  translators: string[]
  publisher: string | null
  category: string | null
  categoryChain: string[]        // üst→alt
  relatedCategories: string[]
  tags: string[]                 // etiket + bağlı ekoller
  price: number | null           // liste fiyatı
  discountRate: number | null    // etkin indirim oranı (0-1), varsa
  stockCount: number
  isSalable: boolean
  pageCount: number | null
  publishedOn: string | null     // ISO date
  language: string | null
  binding: string | null         // cilt tipi
  rating: number | null          // 0-5 snapshot
  ratingCount: number            // değerlendirme sayısı snapshot
  purchaseCount: number          // "X adet satın alındı" snapshot
  coverUrl: string | null
  description: string
}

// 404 → null (kitap yok). Diğer hata → fırlatır.
export async function getProductByIsbn(isbn: string): Promise<BookDetailDto | null> {
  const r = await fetch(`${BASE}/api/catalog/products/${encodeURIComponent(isbn)}`)
  if (r.status === 404) return null
  if (!r.ok) throw new CatalogApiError(r.status, `İstek başarısız (${r.status})`)
  return (await r.json()) as BookDetailDto
}

// SEO slug: Türkçe fold + kebab. URL /kitap/{slug}-{isbn}; detay sondaki ISBN'den çözülür (slug kozmetik).
export function slugify(title: string): string {
  const map: Record<string, string> = { ı: 'i', İ: 'i', ş: 's', Ş: 's', ğ: 'g', Ğ: 'g', ç: 'c', Ç: 'c', ö: 'o', Ö: 'o', ü: 'u', Ü: 'u' }
  return title
    .replace(/[ıİşŞğĞçÇöÖüÜ]/g, (ch) => map[ch] ?? ch)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'kitap'
}
