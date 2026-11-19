import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Mic, Square, Trash2, Loader2, X } from 'lucide-react'
import { transcribe, TranscribeApiError } from '../api/transcribe'
import { useAuthSession } from '../auth/useAuthSession'

// 020-voice: sesle Kâşif'e soru. PublicLayout header'ında tek global bileşen → her müşteri sayfası (FR-001).
// Ses kaydeder (MediaRecorder) → /api/chat/v1/transcribe → metin composer'a (OTOMATİK GÖNDERME YOK, FR-004).
// Sessiz başarısızlık YOK (FR-007/008): her hata nazik satır, yazma hep açık. Mic her yolda serbest bırakılır.

const MAX_MS = 60_000 // ≈60sn cap (FR-009) — sunucu boyutla da korur.

// Tarayıcıya göre codec seç (Safari webm/opus desteklemez → mp4). Boş → tarayıcı varsayılanı.
function pickMime(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  return candidates.find((c) => MediaRecorder.isTypeSupported(c)) ?? ''
}

function extFor(mime: string): string {
  if (mime.includes('mp4')) return 'm4a'
  if (mime.includes('webm')) return 'webm'
  return 'audio'
}

type Phase = 'idle' | 'recording' | 'transcribing' | 'error'

export default function VoiceAsk() {
  const navigate = useNavigate()
  const location = useLocation()
  const { accessToken, isAuthenticated } = useAuthSession()

  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const cancelledRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Mic + timer'ları serbest bırak (iptal/bitir/unmount hepsinde — asılı mic yok, gizlilik).
  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (maxTimeoutRef.current) { clearTimeout(maxTimeoutRef.current); maxTimeoutRef.current = null }
  }, [])

  // Unmount / sayfa değişiminde kaydı durdur + mic serbest.
  useEffect(() => () => {
    cancelledRef.current = true
    try { recorderRef.current?.stop() } catch { /* ignore */ }
    releaseStream()
  }, [releaseStream])

  // Çevrilen metni composer'a taşı — GÖNDERME YOK (FR-004). /sohbet'teyse event (mevcut sohbeti koru);
  // başka sayfadaysa navigate + router-state draft. ChatWorkspace iki yolu da composer input'a yazar.
  const deliver = useCallback((text: string) => {
    if (location.pathname === '/sohbet') {
      window.dispatchEvent(new CustomEvent('scout:voice-draft', { detail: { text } }))
    } else {
      navigate('/sohbet', { state: { draft: text } })
    }
  }, [location.pathname, navigate])

  async function onResult(blob: Blob, mime: string) {
    if (blob.size === 0) { setPhase('idle'); return }
    setPhase('transcribing')
    try {
      const { text } = await transcribe(blob, `ask.${extFor(mime)}`, isAuthenticated ? accessToken : undefined)
      const trimmed = text.trim()
      if (!trimmed) {
        setError('Bir şey duyamadım, tekrar dener misin?')
        setPhase('error')
        return
      }
      setPhase('idle')
      setError(null)
      deliver(trimmed)
    } catch (err) {
      const status = err instanceof TranscribeApiError ? err.status : 0
      setError(
        status === 429 ? 'Çok fazla istek oldu, biraz sonra tekrar dene.'
          : status === 400 ? 'Kaydı çeviremedim, tekrar dener misin?'
            : 'Şu an çeviremedim, yazarak dene.',
      )
      setPhase('error')
    }
  }

  async function start() {
    setError(null)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      // İzin reddi / mikrofon yok → nazik düşüş (FR-007); yazma yolu zaten açık.
      setError('Mikrofon erişimi kapalı. Ayarlardan izin verebilir ya da yazarak sorabilirsin.')
      setPhase('error')
      return
    }

    streamRef.current = stream
    cancelledRef.current = false
    chunksRef.current = []
    const mime = pickMime()
    const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
    recorderRef.current = recorder

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
    recorder.onstop = () => {
      const type = recorder.mimeType || mime || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type })
      releaseStream()
      // İptal → POST yok, composer değişmez (FR — Senaryo 4).
      if (cancelledRef.current) { setPhase('idle'); return }
      void onResult(blob, type)
    }

    recorder.start()
    setPhase('recording')
    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    // Maks süreye ulaşınca otomatik bitir + çevir (o ana kadarki sesi kaybetme, FR-009).
    maxTimeoutRef.current = setTimeout(() => finish(), MAX_MS)
  }

  function finish() {
    if (recorderRef.current?.state === 'recording') {
      cancelledRef.current = false
      recorderRef.current.stop()
    }
  }

  function cancel() {
    cancelledRef.current = true
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    else { releaseStream(); setPhase('idle') }
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(1, '0')}:${String(seconds % 60).padStart(2, '0')}`

  if (phase === 'recording') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" aria-hidden />
        <span className="text-sm font-medium tabular-nums text-rose-700">{mmss}</span>
        <button type="button" onClick={cancel} aria-label="Kaydı iptal et"
          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-100">
          <Trash2 size={16} />
        </button>
        <button type="button" onClick={finish} aria-label="Kaydı bitir"
          className="rounded-lg bg-rose-600 p-1.5 text-white hover:bg-rose-700">
          <Square size={16} fill="currentColor" />
        </button>
      </div>
    )
  }

  if (phase === 'transcribing') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" /> <span className="hidden sm:inline">Çeviriyor…</span>
      </div>
    )
  }

  return (
    <div className="relative flex items-center">
      <button type="button" onClick={start} aria-label="Sesle soru sor"
        className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50">
        <Mic size={18} />
      </button>
      {phase === 'error' && error && (
        <div className="absolute right-0 top-full z-40 mt-2 flex w-64 items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 shadow-lg">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => { setError(null); setPhase('idle') }}
            aria-label="Kapat" className="text-amber-500 hover:text-amber-700">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
