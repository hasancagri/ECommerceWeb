import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import ReactMarkdown from 'react-markdown'
import { Sparkles, Check, Paperclip, ArrowUp, MessageSquare, Loader2, AlertCircle } from 'lucide-react'
import { getConversation, ChatApiError, extractIntent, searchTyped, type ReplyItem, type LastSearch, type BookSearchFilters } from '../api/chat'
import { BookCard, normalizeBook, pick, type ToolBook } from '../components/BookCard'
import { exampleChips } from '../config/discoverCards'
import { useAuthSession } from '../auth/useAuthSession'
import { getAnon, saveAnon } from '../lib/anonChats'

// Kaydedilmiş assistant mesajındaki itemsJson (ReplyItem[] JSON string'i) → ReplyItem[]. Bozuk
// JSON'u yut (kart gösterme, metin yeter). T009: reload'da kartlar canlı reply ile AYNI render'dan geçer.
function parseItems(itemsJson?: string): ReplyItem[] | undefined {
  if (!itemsJson) return undefined
  try {
    const arr = JSON.parse(itemsJson)
    return Array.isArray(arr) ? (arr as ReplyItem[]) : undefined
  } catch {
    return undefined
  }
}

// 014: ScoutAgent (Kâşif) sohbeti — mesaj-güdümlü (POST /api/chat/v1/messages). Arama artık agent'ın
// MCP tool'undan geçer (search_books/get_book…); ?q= URL YOK — ilk mesaj router state'iyle gelir.
// Cevap {text, items}; items tool adına göre karta render edilir (tek sohbet akışı).
interface Msg {
  role: 'user' | 'assistant'
  text: string
  items?: ReplyItem[]
  error?: boolean
  understood?: BookSearchFilters   // 022: sistemin sorgudan çıkardığı filtreler ("anladım" chip)
}

// 022: "devamını getir" niyeti — doğruysa /extract atlanır, son typed filtre page+1 ile aranır.
// Anchored: Türkçe-fold + nezaket/fiil-kökü filler SÖK → kalan TAM bir core ifadeye eşit mi (backend
// PaginationIntent deseni). Fiil-kökü prefix "getirebilir misin" gibi ek-çekimli varyantları yakalar;
// anchored olduğundan "daha fazla Dostoyevski" gibi gerçek sorgular pagination sanılmaz.
function isMore(text: string): boolean {
  const fold = (s: string) => s.toLowerCase()
    .replace(/[iİıI]/g, 'i').replace(/[çÇ]/g, 'c').replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g').replace(/[üÜ]/g, 'u').replace(/[öÖ]/g, 'o')
    .replace(/[^a-z ]/g, ' ')
  const core = new Set(['devam', 'devami', 'devamini', 'sonraki', 'sonrakiler', 'daha fazla', 'digerleri', 'baska'])
  const fillerExact = new Set(['misin', 'misiniz', 'mi', 'lutfen', 'rica', 'ederim', 'bana', 'sayfa',
    'sayfayi', 'sonuc', 'sonuclar', 'sonuclari', 'acaba', 'et', 'edebilir', 'ki'])
  const fillerPrefix = ['getir', 'goster', 'ver', 'listele', 'bul']   // fiil kökleri (ek-çekim toleranslı)
  const toks = fold(text).split(/\s+/).filter(Boolean)
    .filter((t) => !fillerExact.has(t) && !fillerPrefix.some((p) => t.startsWith(p)))
  return toks.length > 0 && core.has(toks.join(' '))
}

// 022: çıkarılan tipli niyeti kullanıcıya gösterilecek kısa etiketlere özetler (chip satırı).
function summarizeFilters(f?: BookSearchFilters): string[] {
  if (!f) return []
  const out: string[] = []
  if (f.text?.author) out.push(`Yazar: ${f.text.author}`)
  if (f.text?.query) out.push(`Konu: ${f.text.query}`)
  if (f.publisher?.include) out.push(`Yayınevi: ${f.publisher.include}`)
  if (f.publisher?.exclude) out.push(`Hariç: ${f.publisher.exclude}`)
  if (f.sortHint) out.push(`Sıralama: ${f.sortHint}`)
  if (f.priceHint) out.push(`Fiyat: ${f.priceHint}`)
  if (f.bindingHint) out.push(`Cilt: ${f.bindingHint}`)
  if (f.pageHint) out.push(`Sayfa: ${f.pageHint}`)
  if (f.flags?.onlyDiscounted) out.push('İndirimli')
  if (f.flags?.onlyInStock) out.push('Stokta')
  if (f.flags?.onlySalable) out.push('Satışta')
  return out
}

// Cevaptaki son search_books item'ından sayfalama durumu ("devamını getir" için). filters backend'in
// echo'ladığı kullanılan args; page sonucun o anki sayfası. Yoksa undefined (arama yapılmadı).
function lastSearchFromItems(items?: ReplyItem[]): LastSearch | undefined {
  const item = items?.filter((i) => i.tool === 'search_books' && i.filters).at(-1)
  if (!item?.filters) return undefined
  const r = (item.result ?? {}) as Record<string, unknown>
  return { filters: item.filters, page: pick<number>(r, 'page', 'Page') ?? 1 }
}

function booksFromItem(item: ReplyItem): ToolBook[] {
  const r = (item.result ?? {}) as Record<string, unknown>
  if (item.tool === 'get_book') return [normalizeBook(r)]
  // search_books: { items|Items: [...] }
  const arr = pick<unknown[]>(r, 'items', 'Items') ?? []
  return Array.isArray(arr) ? arr.map(normalizeBook) : []
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
    case 'similar_books':
    case 'semantic_search':
    case 'recommend_books':
    case 'get_book': {
      const books = booksFromItem(item)
      if (books.length === 0) return null
      // Sayfalama altlığı (deterministik — tool verisinden, LLM saymaz). Yalnız search_books'ta.
      const r = (item.result ?? {}) as Record<string, unknown>
      const total = pick<number>(r, 'total', 'Total')
      const page = pick<number>(r, 'page', 'Page') ?? 1
      // pageSize backend'in echo'ladığı filtreden (gerçek değer; backend varsayılanı 10). Yoksa 10.
      const pageSize = typeof item.filters?.pageSize === 'number' ? item.filters.pageSize : 10
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
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { accessToken, isAuthenticated } = useAuthSession()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const conversationId = useRef<string | undefined>(undefined)
  const messagesRef = useRef<Msg[]>([])
  messagesRef.current = messages
  // "devamını getir" için son aramanın filtre+page'i (her arama cevabında tazelenir, taşınır).
  const lastSearchRef = useRef<LastSearch | undefined>(undefined)
  // 022: son çıkarılan tipli filtre — "devamını getir"de page+1 ile /search'e yollanır (oturum-içi).
  const lastFiltersRef = useRef<BookSearchFilters | undefined>(undefined)
  // router-state ilk mesajını tam 1 kez otomatik gönder (StrictMode çift-effect + re-run guard).
  const initialSentRef = useRef<string | null>(null)

  // Aktif sohbet id'si URL'den: ?c=<id>. Kalıcı sidebar (PublicLayout) linklerle bunu değiştirir.
  const activeId = params.get('c') ?? undefined

  const openConvo = useCallback(async (id: string) => {
    conversationId.current = id
    if (isAuthenticated && accessToken) {
      try {
        const c = await getConversation(id, accessToken)
        const mapped = c.messages.map((m) => {
          // Backend rol'ü PascalCase döner ("User"/"Assistant"); casing-defansif karşılaştır.
          const isAssistant = (m.role ?? '').toLowerCase() === 'assistant'
          return {
            role: isAssistant ? 'assistant' : 'user',
            text: m.text,
            // T009: kaydedilmiş assistant kartları (itemsJson) canlı reply ile aynı render'dan geçer.
            items: isAssistant ? parseItems(m.itemsJson) : undefined,
          } as Msg
        })
        setMessages(mapped)
        lastSearchRef.current = lastSearchFromItems(mapped.flatMap((m) => m.items ?? []))
      } catch { setMessages([]); lastSearchRef.current = undefined }
    } else {
      const c = getAnon(id)
      const mapped = c?.messages.map((m) => ({ role: m.role, text: m.text, items: m.items, error: m.error })) ?? []
      setMessages(mapped)
      lastSearchRef.current = lastSearchFromItems(mapped.flatMap((m) => m.items ?? []))
    }
  }, [isAuthenticated, accessToken])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    const prior = messagesRef.current
    const userMsg: Msg = { role: 'user', text: trimmed }
    setMessages([...prior, userMsg])
    setLoading(true)
    try {
      const token = isAuthenticated ? accessToken : undefined
      // 022 iki-faz: "devamını getir" → /extract ATLA, son tipli filtreyi page+1 ile ara. Aksi halde
      // Tur-1 /extract (LLM niyet-oku → tipli slot) → Tur-2 /search (deterministik, LLM yok).
      const paginate = isMore(trimmed) && lastFiltersRef.current
      const understood: BookSearchFilters = paginate
        ? { ...lastFiltersRef.current!, page: (lastFiltersRef.current!.page ?? 1) + 1 }
        : await extractIntent(trimmed, lastFiltersRef.current, token)  // önceki filtre = bağlam (daralt/sıfırla)
      const res = await searchTyped(
        { conversationId: conversationId.current, message: trimmed, filters: understood },
        token,
      )
      conversationId.current = res.conversationId
      lastFiltersRef.current = understood
      lastSearchRef.current = lastSearchFromItems(res.reply.items) ?? lastSearchRef.current
      const asstMsg: Msg = { role: 'assistant', text: res.reply.text, items: res.reply.items, understood }
      const full = [...prior, userMsg, asstMsg]
      setMessages(full)
      // Anon → sessionStorage'a yaz (login'de sunucu zaten kaydetti).
      if (!isAuthenticated)
        saveAnon(res.conversationId, full.map((m) => ({ role: m.role, text: m.text, items: m.items, error: m.error })), res.title)
      // Kalıcı sidebar (PublicLayout) kendi listesini odakta tazeler; burada URL'i bump etmiyoruz
      // (yeni sohbet akışı kesilmesin). Sidebar bir sonraki render/focus'ta yeni sohbeti gösterir.
      window.dispatchEvent(new CustomEvent('scout:convos-changed'))
    } catch (err) {
      const msg = err instanceof ChatApiError && err.status === 503
        ? 'Kâşif şu an hizmet veremiyor, biraz sonra tekrar dene.'
        : 'Bir şeyler ters gitti, tekrar dener misin?'
      setMessages((m) => [...m, { role: 'assistant', text: msg, error: true }])
    } finally {
      setLoading(false)
    }
  }

  // ?c=<id> değiştikçe: id varsa o sohbeti aç (login sunucu / anon sessionStorage); id yoksa yeni
  // sohbet (temiz durum + ref sıfırla → T020: ölü id'ye mesaj göndermeyiz). router state.message →
  // yeni sohbette otomatik gönder (DiscoverWelcome / geçmişten tekrar-ara) — yalnız id yokken.
  useEffect(() => {
    if (activeId) {
      void openConvo(activeId)
      return
    }
    // Yeni sohbet (no ?c=): durumu temizle.
    conversationId.current = undefined
    lastSearchRef.current = undefined
    lastFiltersRef.current = undefined
    setMessages([])
    setInput('')
    const st = location.state as { message?: string; draft?: string } | null
    // Tek-seferlik: StrictMode (dev) effect'i 2 kez çağırır + effect re-run'ında state.message durur →
    // çift otomatik-gönderim. Mesaja anahtarlı ref ile tam 1 kez gönder (distinct yeni mesaj yine gider).
    if (st?.message && initialSentRef.current !== st.message) {
      initialSentRef.current = st.message
      void send(st.message)
    }
    // 020-voice: sesle gelen metin composer'a düşer — OTOMATİK GÖNDERME YOK (FR-004).
    else if (st?.draft) setInput(st.draft)
    // router-state'i TÜKET: history entry'den temizle (replace) → kitap detayından geri dönünce
    // remount olup aynı message'ı TEKRAR göndermesin (initialSentRef unmount'ta sıfırlanıyor; guard
    // yetmiyor çünkü state history'de yaşıyor). State yoksa dokunma (gereksiz replace döngüsü yok).
    if (st?.message || st?.draft) navigate(`${location.pathname}${location.search}`, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, openConvo])

  // 020-voice: /sohbet'teyken sesle soru → mevcut sohbeti koruyarak composer'a yaz (navigate değil, event).
  useEffect(() => {
    const onDraft = (e: Event) => {
      const text = (e as CustomEvent<{ text: string }>).detail?.text
      if (text) setInput(text)
    }
    window.addEventListener('scout:voice-draft', onDraft)
    return () => window.removeEventListener('scout:voice-draft', onDraft)
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Aktif sohbet — kalıcı sohbet listesi artık PublicLayout sol sidebar'ında. */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-8">
        <span className="flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
          <Sparkles size={14} /> Kâşif — kitap, sepet, sipariş… ne sorarsan
        </span>

        <div className="mt-8 flex-1 space-y-6">
          {messages.length === 0 && !loading && (
            <div className="space-y-3">
              {/* 026: betimlemeye özendir — ne kadar anlatırsan semantik o kadar isabetli. Çip tık → send(). */}
              <p className="text-slate-400">Ne okumak istediğini anlat — ruh hali, konu, tarz… ya da yazar/başlık ara.</p>
              <div className="flex flex-wrap gap-2">
                {exampleChips.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => void send(c)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary hover:text-primary"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
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
                    {/* 022: "anladım" — sistemin sorgudan çıkardığı filtreler (gösterim; onay değil). */}
                    {summarizeFilters(m.understood).length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {summarizeFilters(m.understood).map((chip, c) => (
                          <span key={c} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{chip}</span>
                        ))}
                      </div>
                    )}
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
              maxLength={2000}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:opacity-60"
              placeholder="Ne istediğini anlat: ruh hali, konu, tarz… ya da yazar/başlık ara."
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
