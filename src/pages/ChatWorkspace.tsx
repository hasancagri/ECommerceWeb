import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
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

// ISBN'i kapak URL'inin son segmentinden çöz (.../r2.dev/<isbn>) — search_books Id(GUID) döner, isbn yok.
function isbnFromCover(coverUrl?: string | null): string | undefined {
  if (!coverUrl) return undefined
  const seg = coverUrl.split('?')[0].split('/').pop()
  return seg && /^\d{10,13}$/.test(seg) ? seg : undefined
}

// Agent cevabı markdown render edilir — ama kapak `![alt](url)` RESİM olarak GÖMÜLMEZ; tıklanabilir
// LİNK'e çevrilir ("Kapak"). Linkler yeni sekmede açılır. (MAF items'ı boş dönebildiğinden metin
// birincil yüzey; kartlar dolduğunda ek olarak altta görünür.)
function AgentText({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0.5">
      <ReactMarkdown
        components={{
          // Kapak resmi gömülmez (agent artık ![] üretmez; eski cevaplar için link'e düşür).
          img: ({ src, alt }) => src
            ? <a href={String(src)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{alt || 'Kapak'}</a>
            : null,
          // İç rota (/kitap/...) → router Link (SPA gezinme); dış URL → yeni sekme.
          a: ({ href, children }) => href && href.startsWith('/')
            ? <Link to={href} className="font-medium text-primary hover:underline">{children}</Link>
            : <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{children}</a>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}

function BookCard({ book }: { book: ToolBook }) {
  const isbn = isbnFromCover(book.coverUrl)
  const title = book.title ?? 'Kitap'
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      {book.coverUrl
        ? <img src={book.coverUrl} alt="" loading="lazy" className="h-20 w-14 shrink-0 rounded object-cover" />
        : <span className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-blue-50 text-primary"><BookOpen size={18} /></span>}
      <div className="min-w-0">
        {isbn
          ? <Link to={`/kitap/${isbn}`} className="font-semibold text-slate-800 hover:text-primary hover:underline">{title}</Link>
          : <span className="font-semibold text-slate-800">{title}</span>}
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

// — US2 kart yardımcıları (casing defansif: MCP/STJ camel|Pascal) —
function rows(item: ReplyItem, ...keys: string[]): Record<string, unknown>[] {
  const r = (item.result ?? {}) as Record<string, unknown>
  const arr = pick<unknown[]>(r, ...keys) ?? []
  return Array.isArray(arr) ? (arr as Record<string, unknown>[]) : []
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="mt-3 space-y-2">{children}</div>
}
function LineCard({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">{children}</div>
}

function BasketCard({ item }: { item: ReplyItem }) {
  const items = rows(item, 'items', 'Items')
  const r = (item.result ?? {}) as Record<string, unknown>
  const totalPrice = pick<number>(r, 'totalPrice', 'TotalPrice')
  if (items.length === 0) return <p className="mt-3 text-sm text-slate-400">Sepetin boş görünüyor.</p>
  return (
    <Shell>
      {items.map((it, i) => (
        <LineCard key={i}>
          <span className="min-w-0 truncate font-medium text-slate-800">{pick<string>(it, 'name', 'Name') ?? 'Ürün'}</span>
          <span className="shrink-0 text-slate-500">{pick<number>(it, 'quantity', 'Quantity')} ad · {Number(pick<number>(it, 'price', 'Price') ?? 0).toLocaleString('tr-TR')} ₺</span>
        </LineCard>
      ))}
      {typeof totalPrice === 'number' && <p className="pt-1 text-right text-sm font-semibold text-slate-700">Toplam: {totalPrice.toLocaleString('tr-TR')} ₺</p>}
    </Shell>
  )
}

function OrdersCard({ item }: { item: ReplyItem }) {
  const orders = rows(item, 'orders', 'Orders')
  if (orders.length === 0) return <p className="mt-3 text-sm text-slate-400">Henüz siparişin yok.</p>
  return (
    <Shell>
      {orders.map((o, i) => (
        <LineCard key={i}>
          <span className="font-medium text-slate-800">#{pick<string>(o, 'orderNo', 'OrderNo')}</span>
          <span className="shrink-0 text-slate-500">{pick<string>(o, 'status', 'Status')} · {Number(pick<number>(o, 'total', 'Total') ?? 0).toLocaleString('tr-TR')} ₺</span>
        </LineCard>
      ))}
    </Shell>
  )
}

function AddressesCard({ item }: { item: ReplyItem }) {
  const addr = rows(item, 'addresses', 'Addresses')
  if (addr.length === 0) return <p className="mt-3 text-sm text-slate-400">Kayıtlı adresin yok.</p>
  return (
    <Shell>
      {addr.map((a, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <p className="text-slate-700">{[pick<string>(a, 'line', 'Line'), pick<string>(a, 'street', 'Street'), pick<string>(a, 'district', 'District'), pick<string>(a, 'province', 'Province')].filter(Boolean).join(', ')}</p>
          {(pick<boolean>(a, 'isDefault', 'IsDefault')) && <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">Varsayılan</span>}
        </div>
      ))}
    </Shell>
  )
}

function LibraryCard({ item }: { item: ReplyItem }) {
  const r = (item.result ?? {}) as Record<string, unknown>
  const total = pick<number>(r, 'total', 'Total') ?? rows(item, 'items', 'Items').length
  return <p className="mt-3 text-sm text-slate-600">Kitaplığında <span className="font-semibold">{total}</span> kayıt var.</p>
}

function ReviewsCard({ item }: { item: ReplyItem }) {
  const r = (item.result ?? {}) as Record<string, unknown>
  const items = rows(item, 'items', 'Items')
  const average = pick<number>(r, 'average', 'Average')
  const count = pick<number>(r, 'count', 'Count') ?? items.length
  return (
    <Shell>
      {typeof average === 'number' && count > 0 && (
        <p className="text-sm text-slate-600">Ortalama <span className="font-semibold">{average.toFixed(1)}</span> / 5 · {count} yorum</p>
      )}
      {items.map((v, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <p className="font-medium text-amber-600">{'★'.repeat(Math.round(Number(pick<number>(v, 'rating', 'Rating') ?? 0)))}</p>
          {pick<string>(v, 'text', 'Text') && <p className="mt-1 text-slate-700">{pick<string>(v, 'text', 'Text')}</p>}
          <p className="mt-1 text-xs text-slate-400">{pick<string>(v, 'author', 'Author')}</p>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-slate-400">Bu kitaba henüz yorum yok.</p>}
    </Shell>
  )
}

function SearchHistoryCard({ item }: { item: ReplyItem }) {
  const items = rows(item, 'data', 'Data')
  if (items.length === 0) return <p className="mt-3 text-sm text-slate-400">Henüz arama geçmişin yok.</p>
  return (
    <Shell>
      {items.map((h, i) => (
        <LineCard key={i}>
          <span className="min-w-0 truncate font-medium text-slate-800">{pick<string>(h, 'query', 'Query')}</span>
          <span className="shrink-0 text-xs text-slate-400">{pick<number>(h, 'count', 'Count')}× arama</span>
        </LineCard>
      ))}
      <p className="pt-1 text-xs text-slate-400">Silmek için arama geçmişi ekranını kullan.</p>
    </Shell>
  )
}

// Tool adına göre kart render dağıtıcısı (tek sohbet akışı). Bilinmeyen tool → sessiz (metin yeter).
function ToolItem({ item }: { item: ReplyItem }) {
  switch (item.tool) {
    case 'search_books':
    case 'get_book': {
      const books = booksFromItem(item)
      if (books.length === 0) return null
      // Sayfalama altlığı (deterministik — tool verisinden, LLM saymaz). Yalnız search_books'ta.
      const r = (item.result ?? {}) as Record<string, unknown>
      const total = pick<number>(r, 'total', 'Total')
      const page = pick<number>(r, 'page', 'Page') ?? 1
      const pageSize = 20
      const from = (page - 1) * pageSize + 1
      const to = (page - 1) * pageSize + books.length
      return (
        <>
          <div className="mt-3 space-y-2">
            {books.map((b, i) => <BookCard key={b.id ?? i} book={b} />)}
          </div>
          {item.tool === 'search_books' && typeof total === 'number' && total > books.length && (
            <p className="mt-2 text-xs text-slate-400">
              {total} sonuç · {from}–{to} gösteriliyor — devamı için “devamını getir” yaz.
            </p>
          )}
        </>
      )
    }
    case 'get_basket': return <BasketCard item={item} />
    case 'get_my_orders': return <OrdersCard item={item} />
    case 'get_my_addresses': return <AddressesCard item={item} />
    case 'get_my_library': return <LibraryCard item={item} />
    case 'get_book_reviews': return <ReviewsCard item={item} />
    case 'get_search_history': return <SearchHistoryCard item={item} />
    default: return null
  }
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
                    <AgentText text={m.text} />
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
