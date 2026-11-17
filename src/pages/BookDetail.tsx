import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, BookOpen, Loader2, AlertCircle, ShoppingCart, Lock } from 'lucide-react'
import { Crumb, Stars, Pill } from '../components/ui'
import { useAuthSession } from '../auth/useAuthSession'
import { getProductByIsbn, type BookDetailDto } from '../api/catalog'

// 015/018: gerçek kitap detayı. URL /kitap/{slug}-{isbn} — slug kozmetik, ISBN anahtar.
function isbnFromSlug(slug: string | undefined): string | undefined {
  if (!slug) return undefined
  const m = slug.match(/(\d{10,13})$/)
  return m ? m[1] : undefined
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('tr-TR')
}

// Künye satırı — değer boşsa hiç render edilmez (FR-001: olmayan alan gösterilmez).
function SpecRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  )
}

export default function BookDetail() {
  const { slug } = useParams()
  const isbn = isbnFromSlug(slug)
  const { isAuthenticated } = useAuthSession()
  const [book, setBook] = useState<BookDetailDto | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'notfound' | 'error'>('loading')

  useEffect(() => {
    if (!isbn) { setState('notfound'); return }
    setState('loading')
    getProductByIsbn(isbn)
      .then((b) => {
        if (b) {
          // Defansif: eski backend dizileri döndürmeyebilir → boş diziye düş (çökme yok).
          setBook({
            ...b,
            translators: b.translators ?? [],
            categoryChain: b.categoryChain ?? [],
            relatedCategories: b.relatedCategories ?? [],
            tags: b.tags ?? [],
          })
          setState('ok')
        } else setState('notfound')
      })
      .catch(() => setState('error'))
  }, [isbn])

  const discounted = book && book.price != null && book.discountRate
    ? Math.round(book.price * (1 - book.discountRate) * 100) / 100
    : null
  const discountPct = book?.discountRate ? Math.round(book.discountRate * 100) : null

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-8 py-3 text-sm">
        <Link to="/sohbet" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
          <ArrowLeft size={14} /> Keşfe dön
        </Link>
      </div>

      {state === 'loading' && (
        <div className="mx-auto max-w-5xl px-8 py-10">
          <div className="flex items-center gap-2 text-slate-400"><Loader2 size={16} className="animate-spin" /> Kitap yükleniyor…</div>
        </div>
      )}

      {(state === 'notfound' || state === 'error') && (
        <div className="mx-auto max-w-5xl px-8 py-10">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">{state === 'notfound' ? 'Kitap bulunamadı' : 'Bir şeyler ters gitti'}</p>
              <p className="mt-1 text-sm">Keşfe dönüp başka bir kitaba göz atabilirsin.</p>
              <Link to="/sohbet" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Keşfe dön</Link>
            </div>
          </div>
        </div>
      )}

      {state === 'ok' && book && (
        <>
          {book.categoryChain.length > 0 && (
            <Crumb items={[{ label: 'Kâşif', to: '/' }, ...book.categoryChain.map((c) => ({ label: c })), { label: book.title }]} />
          )}

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-8 py-10 lg:grid-cols-[1fr_300px]">
            {/* ── Ana içerik ── */}
            <div className="min-w-0">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-[180px_1fr]">
                <div>
                  {book.coverUrl
                    ? <img src={book.coverUrl} alt="" className="w-full rounded-xl border border-slate-200 object-cover shadow-sm" />
                    : <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400"><BookOpen size={40} /></div>}
                </div>

                <div className="min-w-0">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{book.title}</h1>
                  {book.authors && <p className="mt-1 text-lg text-slate-600">{book.authors}</p>}
                  {book.translators.length > 0 && (
                    <p className="mt-0.5 text-sm text-slate-500">Çev. {book.translators.join(', ')}</p>
                  )}

                  {book.rating != null && book.ratingCount > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <Stars value={book.rating} />
                      <span className="font-semibold text-slate-800">{book.rating.toFixed(1)}</span>
                      <span className="text-slate-400">({book.ratingCount.toLocaleString('tr-TR')} değerlendirme)</span>
                      {book.pageCount != null && <span className="text-slate-300">· {book.pageCount} sayfa</span>}
                    </div>
                  )}

                  {book.purchaseCount > 0 && (
                    <p className="mt-2 text-sm text-slate-500">
                      Bu üründen <span className="font-semibold text-slate-700">{book.purchaseCount.toLocaleString('tr-TR')}</span> adet satın alındı.
                    </p>
                  )}
                </div>
              </div>

              {/* Künye */}
              <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Künye</h2>
                <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                  <div>
                    <SpecRow label="Yayınevi" value={book.publisher} />
                    <SpecRow label="Yayın Tarihi" value={formatDate(book.publishedOn)} />
                    <SpecRow label="Sayfa Sayısı" value={book.pageCount} />
                    <SpecRow label="Çevirmen" value={book.translators.length > 0 ? book.translators.join(', ') : null} />
                  </div>
                  <div>
                    <SpecRow label="ISBN" value={book.isbn} />
                    <SpecRow label="Dil" value={book.language} />
                    <SpecRow label="Cilt Tipi" value={book.binding} />
                    <SpecRow label="Liste Fiyatı" value={book.price != null ? `${book.price.toLocaleString('tr-TR')} ₺` : null} />
                  </div>
                </div>
              </section>

              {/* İlgili kategoriler */}
              {book.relatedCategories.length > 0 && (
                <section className="mt-6">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">İlgili Kategoriler</h2>
                  <div className="flex flex-wrap gap-2">
                    {book.relatedCategories.map((c) => <Pill key={c} tone="blue">{c}</Pill>)}
                  </div>
                </section>
              )}

              {/* Bağlı ekoller & kavramlar (= etiketler) */}
              {book.tags.length > 0 && (
                <section className="mt-6">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Bağlı Ekoller & Kavramlar</h2>
                  <div className="flex flex-wrap gap-2">
                    {book.tags.map((t) => <Pill key={t} tone="slate">{t}</Pill>)}
                  </div>
                </section>
              )}

              {/* Açıklama */}
              {book.description && (
                <section className="mt-6">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Açıklama</h2>
                  <p className="leading-relaxed text-slate-600">{book.description}</p>
                </section>
              )}
            </div>

            {/* ── Satın alma rayı (sticky) ── */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {book.price != null && book.price > 0 ? (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {(discounted ?? book.price).toLocaleString('tr-TR')} ₺
                    </span>
                    {discounted != null && (
                      <>
                        <span className="text-sm text-slate-400 line-through">{book.price.toLocaleString('tr-TR')} ₺</span>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">%{discountPct} indirim</span>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400">Fiyat yok</span>
                )}

                <div className="mt-3 text-sm">
                  {book.stockCount > 0
                    ? <span className="text-emerald-600">● Stokta {book.stockCount} adet</span>
                    : <span className="text-amber-600">Şu an stokta yok</span>}
                </div>

                {/* Sepete ekle — gerçek bağlama Slice 3. Anon → giriş. */}
                <div className="mt-4">
                  {!book.isSalable ? (
                    <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400">
                      <Lock size={15} /> Şu an satışa uygun değil
                    </button>
                  ) : isAuthenticated ? (
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
                      <ShoppingCart size={15} /> Sepete ekle
                    </button>
                  ) : (
                    <Link to="/giris" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
                      <Lock size={15} /> Sepete eklemek için giriş yap
                    </Link>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
