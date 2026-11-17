import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { MessageSquare, Plus, ArrowRight, Loader2, Search, Trash2 } from 'lucide-react'
import { Crumb } from '../components/ui'
import { useAuthSession } from '../auth/useAuthSession'
import { listConversations, type ConversationSummary } from '../api/chat'
import {
  getSearchHistory, deleteSearchHistoryItem, clearSearchHistory,
  type SearchHistoryItem, type SearchHistoryPage,
} from '../api/personalization'

const MODE_LABEL: Record<string, string> = { keyword: 'Kelime', semantic: 'Anlam', hybrid: 'Hibrit' }

export default function ChatHistory() {
  const { accessToken } = useAuthSession()
  const navigate = useNavigate()

  // Bölüm 1: Sohbetler (007 chat API)
  const [convos, setConvos] = useState<ConversationSummary[] | null>(null)

  // Bölüm 2: Aramalar (013 personalization API)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState<SearchHistoryPage | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    listConversations(accessToken)
      .then((r) => setConvos(r.conversations))
      .catch(() => setConvos([]))
  }, [accessToken])

  const loadSearch = useCallback(() => {
    if (!accessToken) return
    getSearchHistory(accessToken, page, 20).then(setSearch).catch(() => setSearch(null))
  }, [accessToken, page])

  useEffect(() => { loadSearch() }, [loadSearch])

  // Öğeye tıkla → arama ekranına git, o sorgu+mod ile çalıştır.
  // 014: tekrar-ara URL değil, sohbete mesaj (router state → ChatWorkspace otomatik gönderir).
  function reSearch(item: SearchHistoryItem) {
    navigate('/sohbet', { state: { message: item.query } })
  }

  async function removeItem(item: SearchHistoryItem) {
    if (!accessToken || busy) return
    setBusy(true)
    try { await deleteSearchHistoryItem(accessToken, item.query); loadSearch() }
    finally { setBusy(false) }
  }

  async function clearAll() {
    if (!accessToken || busy) return
    if (!window.confirm('Tüm arama geçmişin kalıcı olarak silinecek. Emin misin?')) return
    setBusy(true)
    try { await clearSearchHistory(accessToken); setPage(1); loadSearch() }
    finally { setBusy(false) }
  }

  const searchItems = search?.data ?? []
  const totalPages = search ? Math.max(1, Math.ceil(search.totalCount / search.pageSize)) : 1

  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Sohbet Geçmişi' }]} />
      <div className="mx-auto max-w-4xl px-8 py-10">
        {/* ── Sohbetlerin ── */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Neler sordun?</h1>
              <p className="mt-1 text-slate-500">Önceki keşif sorularına dön, kaldığın yerden sürdür.</p>
            </div>
            <Link to="/sohbet" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
              <Plus size={16} /> Yeni sohbet
            </Link>
          </div>

          {convos === null ? (
            <div className="mt-10 flex items-center gap-2 text-slate-400"><Loader2 size={16} className="animate-spin" /> Yükleniyor…</div>
          ) : convos.length === 0 ? (
            <p className="mt-10 text-slate-400">Henüz sohbetin yok. “Yeni sohbet” ile başla.</p>
          ) : (
            <div className="mt-8 space-y-3">
              {convos.map((it) => (
                <Link key={it.id} to={`/sohbet?c=${it.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:shadow-md">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                    <MessageSquare size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800">{it.title}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{new Date(it.updatedAt).toLocaleString('tr-TR')}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">Sürdür <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Aramaların ── */}
        <section className="mt-14 border-t border-slate-200 pt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Aramaların</h2>
              <p className="mt-1 text-slate-500">Daha önce aradıkların — tıkla tekrar ara, istemediğini sil.</p>
            </div>
            {searchItems.length > 0 && (
              <button onClick={clearAll} disabled={busy}
                className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                <Trash2 size={16} /> Tümünü temizle
              </button>
            )}
          </div>

          {search === null ? (
            <div className="mt-10 flex items-center gap-2 text-slate-400"><Loader2 size={16} className="animate-spin" /> Yükleniyor…</div>
          ) : searchItems.length === 0 ? (
            <p className="mt-10 text-slate-400">Henüz arama geçmişin yok. Keşfe başla, aramaların burada birikir.</p>
          ) : (
            <>
              <div className="mt-8 space-y-3">
                {searchItems.map((it) => (
                  <div key={it.query}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:shadow-md">
                    <button onClick={() => reSearch(it)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                        <Search size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-800">{it.query}</span>
                        <span className="text-xs text-slate-400">
                          {MODE_LABEL[it.mode] ?? it.mode} · {it.count} arama · {new Date(it.lastSearchedAt).toLocaleString('tr-TR')}
                        </span>
                      </span>
                      <ArrowRight size={16} className="shrink-0 text-slate-300" />
                    </button>
                    <button onClick={() => removeItem(it)} disabled={busy}
                      aria-label="Sil" className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4 text-sm">
                  <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Önceki</button>
                  <span className="text-slate-500">{page} / {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Sonraki</button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
