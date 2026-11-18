// 018: first-party kitap yorumları okuma. Gateway /api/reviews/** (anonim). productId = katalog
// detayından gelen book.id (Reviews BC ProductId ile çalışır, ISBN bilmez).
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export interface ReviewItem {
  rating: number
  text: string | null
  createdAt: string
  author: string // maskeli
}

export interface BookReviews {
  items: ReviewItem[]
  total: number
  average: number
  count: number
  page: number
}

export async function getBookReviews(productId: string, page = 1, pageSize = 10): Promise<BookReviews> {
  const r = await fetch(`${BASE}/api/reviews/v1/products/${productId}?page=${page}&pageSize=${pageSize}`)
  if (!r.ok) throw new Error(`Yorumlar alınamadı (${r.status})`)
  return (await r.json()) as BookReviews
}
