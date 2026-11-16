import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, Trash2, Loader2, ArrowRight } from 'lucide-react'
import { Crumb } from '../components/ui'
import { useAuthSession } from '../auth/useAuthSession'
import {
  getSearchHistory, deleteSearchHistoryItem, clearSearchHistory,
  type SearchHistoryItem, type SearchHistoryPage,
} from '../api/personalization'

const MODE_LABEL: Record<string, string> = { keyword: 'Kelime', semantic: 'Anlam', hybrid: 'Hibrit' }

export default function SearchHistory() {
  const { accessToken } = useAuthSession()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<SearchHistoryPage | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    if (!accessToken) return
    getSearchHistory(accessToken, page, 20).then(setResult).catch(() => setResult(null))
  }, [accessToken, page])

  useEffect(() => { load() }, [load])

  // US2: öğeye tıkla → arama ekranına git, o sorgu+mod ile çalıştır.
  function reSearch(item: SearchHistoryItem) {
    navigate(`/sohbet?q=${encodeURIComponent(item.query)}&mode=${item.mode}`)
  }

  async function removeItem(item: SearchHistoryItem) {
    if (!accessToken || busy) return
    setBusy(true)
    try { await deleteSearchHistoryItem(accessToken, item.query); load() }
    finally { setBusy(false) }
  }

  async function clearAll() {
    if (!accessToken || busy) return
    if (!window.confirm('Tüm arama geçmişin kalıcı olarak silinecek. Emin misin?')) return
    setBusy(true)
    try { await clearSearchHistory(accessToken); setPage(1); load() }
    finally { setBusy(false) }
  }

  const items = result?.data ?? []
  const totalPages = result ? Math.max(1, Math.ceil(result.totalCount / result.pageSize)) : 1

  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Arama Geçmişim' }]} />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Arama Geçmişim</h1>
            <p className="mt-1 text-slate-500">Daha önce aradıkların — tıkla tekrar ara, istemediğini sil.</p>
          </div>
          {items.length > 0 && (
            <button onClick={clearAll} disabled={busy}
              className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
              <Trash2 size={16} /> Tümünü temizle
            </button>
          )}
        </div>

        {result === null ? (
          <div className="mt-10 flex items-center gap-2 text-slate-400"><Loader2 size={16} className="animate-spin" /> Yükleniyor…</div>
        ) : items.length === 0 ? (
          <p className="mt-10 text-slate-400">Henüz arama geçmişin yok. Keşfe başla, aramaların burada birikir.</p>
        ) : (
          <>
            <div className="mt-8 space-y-3">
              {items.map((it) => (
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
      </div>
    </div>
  )
}
