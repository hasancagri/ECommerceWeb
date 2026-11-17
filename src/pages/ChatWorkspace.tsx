import { useEffect, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { Sparkles, Check, Paperclip, ArrowUp, MessageSquare, Loader2, AlertCircle, BookOpen } from 'lucide-react'
import { Crumb } from '../components/ui'
import { sendMessage, getConversation, ChatApiError, type ReplyItem, type HistoryTurn } from '../api/chat'
import { useAuthSession } from '../auth/useAuthSession'

// 014: ScoutAgent (Kâşif) sohbeti — mesaj-güdümlü (POST /api/chat/v1/messages). Arama artık agent'ın
// MCP tool'undan geçer (search_books/get_book…); ?q= URL YOK — ilk mesaj router state'iyle gelir.
// Cevap {text, items}; items tool adına göre karta render edilir (tek sohbet akışı).
interface Msg {
  role: 'user' | 'assistant'
  text: string
  items?: ReplyItem[]
  error?: boolean
}

// search_books/get_book tool dönüşündeki kitap — casing defansif (MCP/STJ serileştirmesi camel|Pascal).
interface ToolBook {
  id?: string
  title?: string
  authors?: string
  price?: number | null
  isSalable?: boolean
  coverUrl?: string | null
}

function pick<T>(o: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const k of keys) if (o[k] != null) return o[k] as T
  return undefined
}

function normalizeBook(raw: unknown): ToolBook {
  const o = (raw ?? {}) as Record<string, unknown>
  return {
    id: pick<string>(o, 'id', 'Id'),
    title: pick<string>(o, 'title', 'Title'),
    authors: pick<string>(o, 'authors', 'Authors'),
    price: pick<number>(o, 'price', 'Price') ?? null,
    isSalable: pick<boolean>(o, 'isSalable', 'IsSalable'),
    coverUrl: pick<string>(o, 'coverUrl', 'CoverUrl') ?? null,
  }
}

function booksFromItem(item: ReplyItem): ToolBook[] {
  const r = (item.result ?? {}) as Record<string, unknown>
  if (item.tool === 'get_book') return [normalizeBook(r)]
  // search_books: { items|Items: [...] }
  const arr = pick<unknown[]>(r, 'items', 'Items') ?? []
  return Array.isArray(arr) ? arr.map(normalizeBook) : []
}

function BookCard({ book }: { book: ToolBook }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
      {book.coverUrl
        ? <img src={book.coverUrl} alt="" className="h-20 w-14 shrink-0 rounded object-cover" />
        : <span className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400"><BookOpen size={16} /></span>}
      <div className="min-w-0">
        <p className="font-semibold text-slate-800">{book.title ?? 'Kitap'}</p>
        {book.authors && <p className="text-xs text-slate-500">{book.authors}</p>}
        <p className="mt-1 text-sm">
          {typeof book.price === 'number' && book.price > 0
            ? <span className="font-medium text-slate-700">{book.price.toLocaleString('tr-TR')} ₺</span>
            : <span className="text-slate-400">Fiyat yok</span>}
          {book.isSalable === false && <span className="ml-2 text-xs text-amber-600">satışa uygun değil</span>}
        </p>
      </div>
    </div>
  )
}

// Tool adına göre kart render dağıtıcısı. US1: search_books/get_book → kitap kartları.
// Bilinmeyen/henüz-UI'sız tool → sessiz (metin cevap yeterli). US2'de sepet/sipariş/… eklenir.
function ToolItem({ item }: { item: ReplyItem }) {
  if (item.tool === 'search_books' || item.tool === 'get_book') {
    const books = booksFromItem(item)
    if (books.length === 0) return null
    return (
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {books.map((b, i) => <BookCard key={b.id ?? i} book={b} />)}
      </div>
    )
  }
  return null
}

export default function ChatWorkspace() {
  const location = useLocation()
  const [params] = useSearchParams()
  const { accessToken, isAuthenticated } = useAuthSession()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const conversationId = useRef<string | undefined>(undefined)
  const bootstrapped = useRef(false)
  const messagesRef = useRef<Msg[]>([])
  messagesRef.current = messages

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: trimmed }])
    setLoading(true)
    try {
      // Anon devamlılık: önceki turların metnini (son N) history'de yolla (login'de sunucu otoriter).
      const history: HistoryTurn[] = messagesRef.current
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text }))
      const res = await sendMessage(
        { conversationId: conversationId.current, message: trimmed, history },
        isAuthenticated ? accessToken : undefined,
      )
      conversationId.current = res.conversationId
      setMessages((m) => [...m, { role: 'assistant', text: res.reply.text, items: res.reply.items }])
    } catch (err) {
      const msg = err instanceof ChatApiError && err.status === 503
        ? 'Kâşif şu an hizmet veremiyor, biraz sonra tekrar dene.'
        : 'Bir şeyler ters gitti, tekrar dener misin?'
      setMessages((m) => [...m, { role: 'assistant', text: msg, error: true }])
    } finally {
      setLoading(false)
    }
  }

  // Açılış (tek sefer): router state.message varsa otomatik gönder (DiscoverWelcome / geçmişten tekrar-ara).
  // ?c=<id> varsa ve login ise kayıtlı sohbeti yükle (resume — bu kaynak-kimliği, arama sorgusu değil).
  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true

    const resumeId = params.get('c')
    const initial = (location.state as { message?: string } | null)?.message

    if (resumeId && isAuthenticated && accessToken) {
      conversationId.current = resumeId
      void getConversation(resumeId, accessToken)
        .then((c) => setMessages(c.messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user', text: m.text,
        }))))
        .catch(() => { /* yüklenemezse boş sohbet */ })
      return
    }
    if (initial) void send(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Sohbet' }]} />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-8 py-6">
        <span className="flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          <Sparkles size={14} /> Kâşif — kitap, sepet, sipariş… ne sorarsan
        </span>

        <div className="mt-8 flex-1 space-y-6">
          {messages.length === 0 && !loading && (
            <p className="text-slate-400">Bir şey sor — örn. “Sabahattin Ali'nin kitaplarını listeler misin”.</p>
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
                    {m.items?.map((it, k) => <ToolItem key={k} item={it} />)}
                  </div>
                </div>
              </div>
            ),
          )}

          {loading && (
            <div className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white"><Sparkles size={15} /></span>
              <div className="mt-2 flex items-center gap-2 text-slate-400"><Loader2 size={15} className="animate-spin" /> Kâşif düşünüyor…</div>
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); void send(input) }} className="sticky bottom-0 bg-surface pb-5 pt-4">
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-4 pr-2 shadow-lg shadow-slate-200/50">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:opacity-60"
              placeholder="İstediğini sorabilirsin — kitap, yazar, konu, sepetin…"
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
