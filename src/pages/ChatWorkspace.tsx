import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Sparkles, Check, Paperclip, ArrowUp, MessageSquare, Loader2, AlertCircle, Type, Layers } from 'lucide-react'
import { Crumb } from '../components/ui'
import { searchProducts, CatalogApiError, type ProductSummary, type SearchMode } from '../api/catalog'
import { useAuthSession } from '../auth/useAuthSession'

// 011 canlı test: ilk-sayfa arama (DiscoverWelcome input/kart → /sohbet?q=) gerçek Catalog hibrit
// arama endpoint'ine vurur (ScoutAgent sohbet omurgası master'da YOK — doğrudan REST). Üç mod
// yan yana denenir: kelime (BM25) · anlam (kNN, OpenAI anahtarı gerekir) · hibrit (RRF).
interface Msg {
  role: 'user' | 'assistant'
  text: string
  books?: ProductSummary[]
  error?: boolean
}

const MODES: { id: SearchMode; label: string; icon: typeof Type }[] = [
  { id: 'keyword', label: 'Kelime', icon: Type },
  { id: 'semantic', label: 'Anlam', icon: Sparkles },
  { id: 'hybrid', label: 'Hibrit', icon: Layers },
]

function BookCard({ book }: { book: ProductSummary }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
      {book.imageUrl
        ? <img src={book.imageUrl} alt="" className="h-20 w-14 shrink-0 rounded object-cover" />
        : <span className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400"><MessageSquare size={16} /></span>}
      <div className="min-w-0">
        <Link to={`/kitap/${book.isbn}`} className="font-semibold text-slate-800 hover:text-primary">{book.name}</Link>
        <p className="text-xs text-slate-400">ISBN {book.isbn}</p>
        <p className="mt-1 text-sm">
          {typeof book.price === 'number' && book.price > 0
            ? <span className="font-medium text-slate-700">{book.price.toLocaleString('tr-TR')} ₺</span>
            : <span className="text-slate-400">Fiyat yok</span>}
          {book.discountRate ? <span className="ml-2 text-xs text-emerald-600">%{Math.round(book.discountRate * 100)}</span> : null}
        </p>
        {book.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {book.tags.slice(0, 4).map((t) => (
              <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatWorkspace() {
  const [params] = useSearchParams()
  const { accessToken, isAuthenticated } = useAuthSession()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<SearchMode>('keyword')
  const [loading, setLoading] = useState(false)
  const bootstrapped = useRef(false)
  const modeRef = useRef(mode)
  modeRef.current = mode

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const activeMode = modeRef.current
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: trimmed }])
    setLoading(true)
    try {
      const books = await searchProducts(trimmed, activeMode, 20, isAuthenticated ? accessToken : undefined)
      const label = MODES.find((x) => x.id === activeMode)?.label ?? activeMode
      const text = books.length === 0
        ? `“${trimmed}” için ${label} aramasında sonuç bulamadım.`
        : `“${trimmed}” için ${label} aramasında ${books.length} kitap buldum:`
      setMessages((m) => [...m, { role: 'assistant', text, books }])
    } catch (err) {
      const msg = err instanceof CatalogApiError && err.status === 503
        ? 'Katalog servisi şu an hizmet veremiyor, biraz sonra tekrar dene.'
        : 'Arama başarısız oldu, tekrar dener misin?'
      setMessages((m) => [...m, { role: 'assistant', text: msg, error: true }])
    } finally {
      setLoading(false)
    }
  }

  // Açılış: ?q= varsa soruyu otomatik ara (tek sefer).
  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    const q = params.get('q')
    if (q) void send(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Sohbet' }]} />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-8 py-6">
        <span className="flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          <Sparkles size={14} /> Kâşif — kitap keşfi (011 hibrit arama)
        </span>

        <div className="mt-8 flex-1 space-y-6">
          {messages.length === 0 && !loading && (
            <p className="text-slate-400">Bir soru yaz ya da aşağıdan başla — örn. “Orwell distopya”.</p>
          )}

          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600"><MessageSquare size={15} /></span>
                <div>
                  <p className="text-sm font-semibold">Siz sordunuz</p>
                  <p className="mt-1.5 max-w-3xl leading-relaxed text-slate-800">{m.text}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${m.error ? 'bg-amber-100 text-amber-600' : 'bg-primary text-white'}`}>
                  {m.error ? <AlertCircle size={15} /> : <Sparkles size={15} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    Kâşif
                    {!m.error && <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"><Check size={11} /> yanıt</span>}
                  </p>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-5 leading-relaxed text-slate-700">
                    {m.text}
                    {m.books && m.books.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {m.books.map((b) => <BookCard key={b.isbn} book={b} />)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ),
          )}

          {loading && (
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white"><Sparkles size={15} /></span>
              <div className="mt-2 flex items-center gap-2 text-slate-400"><Loader2 size={15} className="animate-spin" /> Kâşif arıyor…</div>
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); void send(input) }} className="sticky bottom-0 bg-surface pb-5 pt-4">
          <div className="mb-2 flex gap-2">
            {MODES.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setMode(x.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  mode === x.id ? 'bg-primary text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <x.icon size={12} /> {x.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-4 pr-2 shadow-lg shadow-slate-200/50">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:opacity-60"
              placeholder="İstediğini sorabilirsin — kitap, yazar, konu ya da ruh hali…"
            />
            <button type="button" className="p-2 text-slate-400"><Paperclip size={17} /></button>
            <button type="submit" disabled={loading} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"><ArrowUp size={18} /></button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">Keşif ve sohbet üyeliksiz çalışır. Kâşif hiçbir ekranda satın alma yaptırmaz.</p>
        </form>
      </div>
    </div>
  )
}
