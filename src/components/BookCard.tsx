import { Link } from 'react-router'
import { BookOpen } from 'lucide-react'
import { slugify } from '../api/catalog'

// search_books/get_book/recommend_books tool dönüşündeki kitap — casing defansif
// (MCP/STJ serileştirmesi camel|Pascal). ChatWorkspace + PersonalShelf ortak kullanır.
export interface ToolBook {
  id?: string
  title?: string
  authors?: string
  publisher?: string
  isbn?: string
  price?: number | null
  isSalable?: boolean
  coverUrl?: string | null
  pageCount?: number | null
  discountRate?: number | null   // kesir (0–0.90]; indirimli = price*(1-rate). null/0 = indirim yok.
}

// İlk null-olmayan anahtarı seçer (camel|Pascal toleransı). Kart dışında da (ChatWorkspace rows/sayfalama) kullanılır.
export function pick<T>(o: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const k of keys) if (o[k] != null) return o[k] as T
  return undefined
}

export function normalizeBook(raw: unknown): ToolBook {
  const o = (raw ?? {}) as Record<string, unknown>
  return {
    id: pick<string>(o, 'id', 'Id'),
    title: pick<string>(o, 'title', 'Title'),
    authors: pick<string>(o, 'authors', 'Authors'),
    publisher: pick<string>(o, 'publisher', 'Publisher'),
    isbn: pick<string>(o, 'isbn', 'Isbn'),
    price: pick<number>(o, 'price', 'Price') ?? null,
    isSalable: pick<boolean>(o, 'isSalable', 'IsSalable'),
    coverUrl: pick<string>(o, 'coverUrl', 'CoverUrl') ?? null,
    pageCount: pick<number>(o, 'pageCount', 'PageCount') ?? null,
    discountRate: pick<number>(o, 'discountRate', 'DiscountRate') ?? null,
  }
}

// Bir tool sonucundan ({ items|Items: [...] }) kitap listesi çıkarır (search_books/recommend_books).
export function normalizeBooks(result: unknown): ToolBook[] {
  const r = (result ?? {}) as Record<string, unknown>
  const arr = pick<unknown[]>(r, 'items', 'Items') ?? []
  return Array.isArray(arr) ? arr.map(normalizeBook) : []
}

// ISBN'i kapak URL'inin son segmentinden çöz (.../r2.dev/<isbn>) — search_books Id(GUID) döner, isbn yok.
function isbnFromCover(coverUrl?: string | null): string | undefined {
  if (!coverUrl) return undefined
  const seg = coverUrl.split('?')[0].split('/').pop()
  return seg && /^\d{10,13}$/.test(seg) ? seg : undefined
}

export function BookCard({ book }: { book: ToolBook }) {
  const isbn = book.isbn ?? isbnFromCover(book.coverUrl)
  const title = book.title ?? 'Kitap'
  const href = isbn ? `/kitap/${slugify(title)}-${isbn}` : undefined
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      {book.coverUrl
        ? <img src={book.coverUrl} alt="" loading="lazy" className="h-20 w-14 shrink-0 rounded object-cover" />
        : <span className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-blue-50 text-primary"><BookOpen size={18} /></span>}
      <div className="min-w-0">
        {href
          ? <Link to={href} className="font-semibold text-slate-800 hover:text-primary hover:underline">{title}</Link>
          : <span className="font-semibold text-slate-800">{title}</span>}
        {book.authors && <p className="text-xs text-slate-500">{book.authors}</p>}
        {book.publisher && <p className="text-xs text-slate-400">{book.publisher}</p>}
        {typeof book.pageCount === 'number' && book.pageCount > 0 &&
          <p className="text-xs text-slate-400">{book.pageCount} sayfa</p>}
        <p className="mt-1 text-sm">
          {typeof book.price === 'number' && book.price > 0
            ? (book.discountRate && book.discountRate > 0
                ? <>
                    <span className="font-semibold text-slate-800">
                      {(book.price * (1 - book.discountRate)).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                    </span>
                    <span className="ml-2 text-xs text-slate-400 line-through">{book.price.toLocaleString('tr-TR')} ₺</span>
                    <span className="ml-2 rounded bg-rose-50 px-1.5 py-0.5 text-xs font-medium text-rose-600">%{Math.round(book.discountRate * 100)}</span>
                  </>
                : <span className="font-medium text-slate-700">{book.price.toLocaleString('tr-TR')} ₺</span>)
            : <span className="text-slate-400">Fiyat yok</span>}
          {book.isSalable === false && <span className="ml-2 text-xs text-amber-600">satışa uygun değil</span>}
        </p>
      </div>
    </div>
  )
}
