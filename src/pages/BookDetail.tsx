import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, BookOpen, Loader2, AlertCircle } from 'lucide-react'
import { getProductByIsbn, type BookDetailDto } from '../api/catalog'

// 015: gerçek kitap detayı. URL /kitap/{slug}-{isbn} — slug kozmetik (SEO/okunur), ISBN anahtar.
// Sondaki ISBN'i ayıkla (10-13 hane), onunla künyeyi çek. (AI-kürasyon süsleri ileride.)
function isbnFromSlug(slug: string | undefined): string | undefined {
  if (!slug) return undefined
  const m = slug.match(/(\d{10,13})$/)
  return m ? m[1] : undefined
}

export default function BookDetail() {
  const { slug } = useParams()
  const isbn = isbnFromSlug(slug)
  const [book, setBook] = useState<BookDetailDto | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'notfound' | 'error'>('loading')

  useEffect(() => {
    if (!isbn) { setState('notfound'); return }
    setState('loading')
    getProductByIsbn(isbn)
      .then((b) => { if (b) { setBook(b); setState('ok') } else setState('notfound') })
      .catch(() => setState('error'))
  }, [isbn])

  return (
    <div>
      <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-8 py-3 text-sm">
        <Link to="/sohbet" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
          <ArrowLeft size={14} /> Keşfe dön
        </Link>
      </div>

      <div className="mx-auto max-w-4xl px-8 py-10">
        {state === 'loading' && (
          <div className="flex items-center gap-2 text-slate-400"><Loader2 size={16} className="animate-spin" /> Kitap yükleniyor…</div>
        )}

        {(state === 'notfound' || state === 'error') && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">{state === 'notfound' ? 'Kitap bulunamadı' : 'Bir şeyler ters gitti'}</p>
              <p className="mt-1 text-sm">Keşfe dönüp başka bir kitaba göz atabilirsin.</p>
              <Link to="/sohbet" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Keşfe dön</Link>
            </div>
          </div>
        )}

        {state === 'ok' && book && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-[200px_1fr]">
            {/* Kapak */}
            <div>
              {book.coverUrl
                ? <img src={book.coverUrl} alt="" className="w-full rounded-xl border border-slate-200 object-cover shadow-sm" />
                : <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400"><BookOpen size={40} /></div>}
            </div>

            {/* Künye */}
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{book.title}</h1>
              {book.authors && <p className="mt-1 text-lg text-slate-600">{book.authors}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                {book.publisher && <span>{book.publisher}</span>}
                {book.category && <><span className="text-slate-300">·</span><span>{book.category}</span></>}
                {book.pageCount != null && <><span className="text-slate-300">·</span><span>{book.pageCount} sayfa</span></>}
                {book.language && <><span className="text-slate-300">·</span><span>{book.language}</span></>}
              </div>

              <div className="mt-5 flex items-center gap-3">
                {typeof book.price === 'number' && book.price > 0
                  ? <span className="text-2xl font-bold text-slate-900">{book.price.toLocaleString('tr-TR')} ₺</span>
                  : <span className="text-slate-400">Fiyat yok</span>}
                {book.isSalable
                  ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Satışa uygun</span>
                  : <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">Şu an satışa uygun değil</span>}
              </div>

              {book.description && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold text-slate-700">Açıklama</h2>
                  <p className="mt-2 leading-relaxed text-slate-600">{book.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
