// 007 US3: ScoutAgent (Kâşif) chat API istemcisi. Tek origin = Gateway (VITE_API_BASE_URL).
// Bearer opsiyonel: varsa kişisel araçlar + kalıcı sohbet; yoksa anonim katalog sohbeti.
const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5060'

export interface ReplyItem {
  tool: string
  // Tool dönüşünden BİREBİR ham sonuç (search_books → {items,total,page}, get_book → kitap, vb.).
  result: unknown
}

export interface ChatReply {
  text: string
  items: ReplyItem[]
}

export interface SendMessageResult {
  conversationId: string
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
  messages: { role: string; text: string; createdAt: string }[]
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
  body: { conversationId?: string; message: string },
  token?: string,
): Promise<SendMessageResult> {
  return request<SendMessageResult>(
    '/api/chat/v1/messages',
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
