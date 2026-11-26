import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft, BookOpen, Loader2, AlertCircle, ShoppingCart, Lock,
  Heart, Bell, MessageCircle, Users, BookMarked, PauseCircle, CheckCircle2, Sparkles, Package,
} from 'lucide-react'
import { Crumb, Stars, Pill } from '../components/ui'
import { useAuthSession } from '../auth/useAuthSession'
import { getProductByIsbn, type BookDetailDto } from '../api/catalog'
import { recordView } from '../api/library'
import { getBookReviews, type BookReviews } from '../api/reviews'

// ── MOCK veri (görsel-önce; blok blok gerçek backend'e bağlanacak) ──────────────
// Okuma durumu sayıları — ileride okuma-durumu modeli (bitiren/okuyan/yarım bırakan).
const MOCK_READING = { reading: 1240, finished: 23305, abandoned: 1876 }
// Fiyat geçmişi son 6 ay — ileride fiyat-değişim kaydı (fiyat-sabit kararı gevşerse).
const MOCK_PRICE_HISTORY = [
  { m: 'Haz', v: 165 }, { m: 'Tem', v: 158 }, { m: 'Ağu', v: 172 },
  { m: 'Eyl', v: 149 }, { m: 'Eki', v: 155 }, { m: 'Kas', v: 141.38 },
]
// Okurların ortak görüşü — ileride ML duygu analizi (yorumlardan).
const MOCK_SENTIMENT = {
  summary: 'Okurlar en çok düşünsel derinliği ve çeviriyi övüyor; az sayıda okur baskı ve kağıt kalitesinden yakınıyor. Baskın his: tedirgin edici ama sürükleyici.',
  pills: ['Düşündürücü', 'Sürükleyici', 'Tedirgin edici', 'Çarpıcı'],
  dimensions: [
    { label: 'Düşünsel derinlik', pct: 96 }, { label: 'Çeviri', pct: 94 },
    { label: 'Akıcılık / tempo', pct: 88 }, { label: 'Baskı & kağıt', pct: 79 },
  ],
  reviewCount: 8388,
}
const MOCK_LIKES = 3420
const REVIEWS_PREVIEW = 3   // önce bu kadar göster, sonra "tümünü göster"

// Okur yorumları (mock — gerçek veri yoksa gösterilir; ileride Reviews BC REST yüzeyi).
const MOCK_REVIEWS = {
  average: 4.6,
  count: 8388,
  items: [
    { author: 'Deniz K.', rating: 5, createdAt: '2026-09-14', text: 'Yazıldığı dönemden bugüne hiç eskimemiş bir distopya klasiği. Gözetim ve gerçeğin çarpıtılması üzerine okurken insanı ürperten bir kitap.' },
    { author: 'Mert A.', rating: 5, createdAt: '2026-08-02', text: 'Çeviri çok akıcı. Ağır olur diye çekiniyordum ama bir solukta bitirdim; herkese tavsiye ederim.' },
    { author: 'Elif Y.', rating: 4, createdAt: '2026-06-21', text: 'Dil, bellek ve iktidar üzerine düşündüren güçlü bir roman. Sonu beni uzun süre meşgul etti.' },
    { author: 'Caner B.', rating: 5, createdAt: '2026-05-30', text: 'Üniversitede okumuştum, yıllar sonra tekrar okudum; her yaşta farklı bir yerinden vuruyor.' },
    { author: 'Zeynep T.', rating: 3, createdAt: '2026-04-11', text: 'Fikirler çarpıcı ama orta bölümler bana biraz yavaş geldi. Yine de değerli bir okuma.' },
    { author: 'Okan S.', rating: 5, createdAt: '2026-03-08', text: 'Baskı ve kağıt kalitesi gayet iyi. İçerik zaten başyapıt; bu baskıyı gönül rahatlığıyla alabilirsiniz.' },
    { author: 'Hakan D.', rating: 2, createdAt: '2026-02-19', text: 'Benim için fazla karanlık ve umutsuzdu; edebi değerini yadsımam ama keyifli bir okuma olmadı.' },
  ],
}

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
  const { isAuthenticated, accessToken } = useAuthSession()
  const [book, setBook] = useState<BookDetailDto | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'notfound' | 'error'>('loading')
  const [reviews, setReviews] = useState<BookReviews | null>(null)
  const [liked, setLiked] = useState(false)          // mock: kitabı beğen
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [readingStatus, setReadingStatus] = useState<'will' | 'reading' | 'abandoned' | null>(null)  // mock: tek seçili

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

  // 018 Slice 2: kitap yüklenince yorumları çek (productId = book.id). Hata/boş → sessizce boş durum.
  useEffect(() => {
    if (!book) return
    getBookReviews(book.id, 1).then(setReviews).catch(() => setReviews(null))
  }, [book])

  // Son Gezdiğim Kitaplar: login kullanıcı kitabı gezince kaydı düşer (ateşle-unut; anonimse HİÇ çağırma;
  // hata sayfayı bozmaz). Künye-snapshot taşınır (yaklaşım A — Library BC-arası çağrı yapmaz).
  useEffect(() => {
    if (!book || !isAuthenticated || !accessToken) return
    recordView(accessToken, {
      productId: book.id,
      title: book.title,
      author: book.authors,
      coverUrl: book.coverUrl,
      isbn: book.isbn,
    }).catch(() => {})
  }, [book, isAuthenticated, accessToken])

  const discounted = book && book.price != null && book.discountRate
    ? Math.round(book.price * (1 - book.discountRate) * 100) / 100
    : null
  const discountPct = book?.discountRate ? Math.round(book.discountRate * 100) : null

  // Okuma durumu (mock) — bitirme oranı = bitiren / (bitiren + yarım bırakan).
  const { reading, finished, abandoned } = MOCK_READING
  const completionRate = Math.round((finished / (finished + abandoned)) * 100)
  const priceMax = Math.max(...MOCK_PRICE_HISTORY.map((p) => p.v))
  const priceMin = Math.min(...MOCK_PRICE_HISTORY.map((p) => p.v))
  // Gerçek yorum yoksa mock göster (görsel-önce).
  const displayReviews = reviews && reviews.count > 0 ? reviews : MOCK_REVIEWS

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

                  {/* Kitabı beğen (mock) */}
                  <button
                    onClick={() => setLiked((v) => !v)}
                    className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      liked ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Heart size={15} className={liked ? 'fill-rose-500 text-rose-500' : ''} />
                    {liked ? 'Beğendin' : 'Beğen'}
                    <span className="text-slate-400">· {(MOCK_LIKES + (liked ? 1 : 0)).toLocaleString('tr-TR')}</span>
                  </button>

                  {/* Okuma durumu (mock) — tek seçili; tekrar tıkla kaldır */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {([
                      { key: 'will', label: 'Okuyacağım', icon: BookMarked },
                      { key: 'reading', label: 'Okuyorum', icon: BookOpen },
                      { key: 'abandoned', label: 'Yarım bıraktım', icon: PauseCircle },
                    ] as const).map((s) => {
                      const on = readingStatus === s.key
                      const Icon = s.icon
                      return (
                        <button
                          key={s.key}
                          onClick={() => setReadingStatus((cur) => (cur === s.key ? null : s.key))}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                            on ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon size={14} /> {s.label}
                        </button>
                      )
                    })}
                  </div>
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

              {/* Okuma durumu (mock) */}
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Okuma Durumu</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex items-start gap-2.5">
                    <BookMarked size={18} className="mt-0.5 shrink-0 text-sky-500" />
                    <div>
                      <p className="text-lg font-bold text-slate-900">{reading.toLocaleString('tr-TR')}</p>
                      <p className="text-xs text-slate-500">Şu an okuyan</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-lg font-bold text-slate-900">{finished.toLocaleString('tr-TR')}</p>
                      <p className="text-xs text-slate-500">Bitiren</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <PauseCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-lg font-bold text-slate-900">{abandoned.toLocaleString('tr-TR')}</p>
                      <p className="text-xs text-slate-500">Yarım bırakan</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Users size={18} className="mt-0.5 shrink-0 text-indigo-500" />
                    <div>
                      <p className="text-lg font-bold text-slate-900">%{completionRate}</p>
                      <p className="text-xs text-slate-500">Bitirme oranı</p>
                    </div>
                  </div>
                </div>
              </section>

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

              {/* Fiyat geçmişi · son 6 ay (mock) */}
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fiyat Geçmişi · son 6 ay</h2>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">Son 6 ayın en düşüğü</span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3" style={{ height: 130 }}>
                  {MOCK_PRICE_HISTORY.map((p, i) => {
                    const last = i === MOCK_PRICE_HISTORY.length - 1
                    // Görsel aralık: en düşük sütun bile ~24px görünsün (min-max'i 24–96px'e eşle).
                    const h = 24 + Math.round(((p.v - priceMin) / Math.max(1, priceMax - priceMin)) * 72)
                    return (
                      <div key={p.m} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                        <span className={`text-[11px] font-medium ${last ? 'text-emerald-600' : 'text-slate-400'}`}>{p.v.toLocaleString('tr-TR')}</span>
                        <div className={`w-full rounded-t-md ${last ? 'bg-emerald-500' : 'bg-slate-200'}`} style={{ height: `${h}px` }} />
                        <span className="text-[11px] text-slate-400">{p.m}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  En düşük <span className="font-medium text-slate-600">{priceMin.toLocaleString('tr-TR')} TL</span> · En yüksek {priceMax.toLocaleString('tr-TR')} TL
                </p>
              </section>

              {/* Okurların ortak görüşü (mock — ileride ML duygu analizi) */}
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-slate-900">
                    <Sparkles size={15} className="text-primary" /> Okurların ortak görüşü
                  </h2>
                  <span className="text-xs text-slate-400">{MOCK_SENTIMENT.reviewCount.toLocaleString('tr-TR')} yorumdan özet</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{MOCK_SENTIMENT.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {MOCK_SENTIMENT.pills.map((p) => <Pill key={p} tone="blue">{p}</Pill>)}
                </div>
                <div className="mt-4 space-y-2.5">
                  {MOCK_SENTIMENT.dimensions.map((d) => (
                    <div key={d.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{d.label}</span>
                        <span className="font-medium text-slate-500">%{d.pct} olumlu</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full ${d.pct >= 85 ? 'bg-primary' : 'bg-amber-400'}`} style={{ width: `${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">Yalnızca gerçek okur yorumlarından damıtılır; Kâşif kitabı kendi başına yorumlamaz.</p>
              </section>

              {/* Okur yorumları — puan + bir kısmı/tümü + yorum yaz + nested reply */}
              <section className="mt-8 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Okur Yorumları</h2>
                  <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-2 text-sm sm:flex">
                      <Stars value={displayReviews.average} />
                      <span className="font-semibold text-slate-800">{displayReviews.average.toFixed(1)}</span>
                      <span className="text-slate-400">({displayReviews.count.toLocaleString('tr-TR')} yorum)</span>
                    </div>
                    {/* Yorum yaz (mock) */}
                    <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-blue-50">
                      Yorum yaz
                    </button>
                  </div>
                </div>

                {displayReviews.count === 0 ? (
                  <p className="mt-4 text-sm text-slate-400">Henüz yorum yok. İlk yorumu satın alanlar yazabilir.</p>
                ) : (
                  <>
                    <div className="mt-4 space-y-4">
                      {(showAllReviews ? displayReviews.items : displayReviews.items.slice(0, REVIEWS_PREVIEW)).map((r, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800">{r.author}</span>
                            <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                          </div>
                          <div className="mt-1"><Stars value={r.rating} size={13} /></div>
                          {r.text && <p className="mt-2 text-sm leading-relaxed text-slate-600">{r.text}</p>}

                          {/* Yoruma yorum (nested, mock) — ilk yorumda örnek bir yanıt */}
                          {i === 0 && (
                            <div className="mt-3 border-l-2 border-slate-100 pl-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">Ahmet T.</span>
                                <span className="text-xs text-slate-400">15.09.2026</span>
                              </div>
                              <p className="mt-1 text-sm leading-relaxed text-slate-500">Katılıyorum, finali uzun süre aklımdan çıkmadı.</p>
                            </div>
                          )}
                          <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-primary">
                            <MessageCircle size={13} /> Yanıtla
                          </button>
                        </div>
                      ))}
                    </div>
                    {!showAllReviews && displayReviews.items.length > REVIEWS_PREVIEW && (
                      <button
                        onClick={() => setShowAllReviews(true)}
                        className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Tüm yorumları göster ({displayReviews.count.toLocaleString('tr-TR')})
                      </button>
                    )}
                  </>
                )}
              </section>
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

                {/* Fiyat alarmı + stok bildirimi — ayrı butonlar (mock) */}
                <div className="mt-3 space-y-2">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Bell size={15} /> {isAuthenticated ? 'Fiyat alarmı kur' : 'Fiyat alarmı için giriş yap'}
                  </button>
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Package size={15} /> {isAuthenticated ? 'Stok bildirimi al' : 'Stok bildirimi için giriş yap'}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
