// 020-voice: ses → metin çevirme API istemcisi. Tek origin = Gateway /api/chat/** (chat.ts deseni).
// multipart/form-data: file alanı. Bearer opsiyonel (anonim serbest, FR-012). Content-Type SET ETME —
// tarayıcı multipart boundary'yi kendi koyar. Hata status'u fırlatılır (bileşen nazik mesaja çevirir).
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export class TranscribeApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export interface TranscribeResult {
  text: string
}

export async function transcribe(audio: Blob, filename: string, token?: string): Promise<TranscribeResult> {
  const form = new FormData()
  form.append('file', audio, filename)

  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${BASE}/api/chat/v1/transcribe`, {
    method: 'POST',
    headers,
    body: form,
  })

  if (!response.ok) {
    throw new TranscribeApiError(response.status, `Çevirme başarısız (${response.status})`)
  }
  return (await response.json()) as TranscribeResult
}
