import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { getFeed, type ReplyItem } from '../api/chat'
import { useAuthSession } from '../auth/useAuthSession'
import { BookCard, normalizeBooks, type ToolBook } from './BookCard'

// 029: ana sayfa "Sana Özel" rafı. Login ise GET /api/chat/v1/feed (bearer) → recommend_books kartları.
// Anonim/yükleniyor → render YOK. Boş/hata → render YOK (sayfa bozulmaz, sessiz). Deterministik feed
// (028): aynı taste → aynı kartlar; değişim yalnız kullanıcının araması değişince.
type State =
  | { status: 'loading' }
  | { status: 'ready'; text: string; books: ToolBook[] }
  | { status: 'empty' }

export function PersonalShelf() {
  const { isAuthenticated, isLoading, accessToken } = useAuthSession()
  const [state, setState] = useState<State>({ status: 'empty' })

  useEffect(() => {
    // Anonim ya da token henüz hazır değil → raf yok (logout anında sıfırlanır).
    if (!isAuthenticated || !accessToken) {
      setState({ status: 'empty' })
      return
    }
    let cancelled = false
    setState({ status: 'loading' })
    getFeed(accessToken)
      .then((reply) => {
        if (cancelled) return
        const item = reply.items.find((i: ReplyItem) => i.tool === 'recommend_books')
        const books = item ? normalizeBooks(item.result) : []
        setState(books.length === 0 ? { status: 'empty' } : { status: 'ready', text: reply.text, books })
      })
      .catch(() => { if (!cancelled) setState({ status: 'empty' }) })
    return () => { cancelled = true }
  }, [isAuthenticated, accessToken])

  // Anonim veya oturum yükleniyor → hiç gösterme.
  if (!isAuthenticated || isLoading) return null
  if (state.status === 'empty') return null

  return (
    <section className="mt-10 w-full">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-primary" />
        <h2 className="text-lg font-semibold tracking-tight">Sana Özel</h2>
      </div>
      {state.status === 'loading' ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[104px] animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate-500">{state.text}</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.books.map((b, i) => <BookCard key={b.id ?? i} book={b} />)}
          </div>
        </>
      )}
    </section>
  )
}
