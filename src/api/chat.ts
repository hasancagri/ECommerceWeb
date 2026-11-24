// 007/014: ScoutAgent (Kâşif) chat API istemcisi. Tek origin = Gateway /api/chat/**.
// BASE boşsa vite proxy (:5173 → gateway); env varsa onu kullanır (catalog.ts ile aynı desen).
// Bearer opsiyonel: varsa kişisel araçlar + kalıcı sohbet; yoksa anonim sohbet (istemci-transkript).
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export interface ReplyItem {
  tool: string
  // Tool dönüşünden BİREBİR ham sonuç (search_books → {items,total,page}, get_book → kitap, vb.).
  result: unknown
  // search_books'ta dolu: kullanılan arama filtreleri (publisher/sort/query/page…). "devamını getir"de
  // page+1 ile geri taşınır (sayfalama). Diğer tool'larda yok.
  filters?: Record<string, unknown>
}

// Sohbette taşınan son-arama durumu — "devamını getir" bunu page+1 ile backend'e yollar.
export interface LastSearch {
  filters: Record<string, unknown>
  page: number
}

// 022: iki-faz tipli niyet (React↔backend kontratı, NESTED). /extract üretir, /search tüketir.
// Her grup opsiyonel (null = o konu konuşulmadı). "anladım" chip'i bunu özetler.
export interface BookSearchFilters {
  text?: { query?: string | null; author?: string | null } | null
  publisher?: { include?: string | null; exclude?: string | null } | null
  priceHint?: string | null
  sortHint?: string | null
  bindingHint?: string | null
  pageHint?: string | null
  taxonomy?: { genres?: string[] | null; moods?: string[] | null; themes?: string[] | null; audience?: string[] | null } | null
  flags?: { onlyDiscounted?: boolean; onlyInStock?: boolean; onlySalable?: boolean } | null
  page: number
  pageSize: number
}

// 014: anon istemci-transkript turu (devamlılık/sayfalama bağlamı). Login'de sunucu kaydı otoriter.
export interface HistoryTurn {
  role: 'user' | 'assistant'
  text: string
}

export interface ChatReply {
  text: string
  items: ReplyItem[]
}

export interface SendMessageResult {
  conversationId: string
  title?: string | null   // 014: ilk turda üretilen akıllı başlık (anon sessionStorage'a yazar)
  reply: ChatReply
}

export interface ConversationSummary {
  id: string
  title: string
  updatedAt: string
}

export interface ConversationDetail {
  id: string
  title: string
  // itemsJson: assistant mesajlarında opsiyonel — kaydedilmiş ReplyItem[]'in JSON string'i
  // (canlı reply.items ile aynı şekil). JSON.parse ile kart render'a geri döner (T009).
  messages: { role: string; text: string; createdAt: string; itemsJson?: string }[]
}

export class ChatApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init: RequestInit, token?: string): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${BASE}${path}`, { ...init, headers })
  if (!response.ok) {
    throw new ChatApiError(response.status, `İstek başarısız (${response.status})`)
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

export function sendMessage(
  body: { conversationId?: string; message: string; history?: HistoryTurn[]; lastSearch?: LastSearch },
  token?: string,
): Promise<SendMessageResult> {
  return request<SendMessageResult>(
    '/api/chat/v1/messages',
    { method: 'POST', body: JSON.stringify(body) },
    token,
  )
}

// 022 Tur-1: ham sorgu → tipli niyet (LLM structured output, sunucuda). Durumsuz.
export function extractIntent(query: string, token?: string): Promise<BookSearchFilters> {
  return request<BookSearchFilters>(
    '/api/chat/v1/extract',
    { method: 'POST', body: JSON.stringify({ query }) },
    token,
  )
}

// 022 Tur-2: tipli niyet → kartlar (deterministik, LLM yok). message = kullanıcının ham sorgusu
// (Conversation'a insan-metni; login kaydı korunur). Cevap şekli sendMessage ile AYNI.
export function searchTyped(
  body: { conversationId?: string; message: string; filters: BookSearchFilters },
  token?: string,
): Promise<SendMessageResult> {
  return request<SendMessageResult>(
    '/api/chat/v1/search',
    { method: 'POST', body: JSON.stringify(body) },
    token,
  )
}

export function listConversations(token: string): Promise<{ conversations: ConversationSummary[] }> {
  return request<{ conversations: ConversationSummary[] }>(
    '/api/chat/v1/conversations',
    { method: 'GET' },
    token,
  )
}

export function getConversation(id: string, token: string): Promise<ConversationDetail> {
  return request<ConversationDetail>(
    `/api/chat/v1/conversations/${id}`,
    { method: 'GET' },
    token,
  )
}

export function renameConversation(id: string, title: string, token: string): Promise<void> {
  return request<void>(
    `/api/chat/v1/conversations/${id}`,
    { method: 'PATCH', body: JSON.stringify({ title }) },
    token,
  )
}

export function deleteConversation(id: string, token: string): Promise<void> {
  return request<void>(
    `/api/chat/v1/conversations/${id}`,
    { method: 'DELETE' },
    token,
  )
}
