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

// 013: Arama geçmişi yönetim sayfası — AccountSettings'ten ayrı sayfaya taşındı (KİŞİSEL ALAN maddesi).
// Tümü auth-zorunlu (Personalization API bearer ile); geçmişi silmek taste'i on-demand sıfırlar.
export default function SearchHistory() {
  const { accessToken } = useAuthSession()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState<SearchHistoryPage | null>(null)
  const [busy, setBusy] = useState(false)

  const loadSearch = useCallback(() => {
    if (!accessToken) return
    getSearchHistory(accessToken, page, 20).then(setSearch).catch(() => setSearch(null))
  }, [accessToken, page])

  useEffect(() => { loadSearch() }, [loadSearch])

  // Öğeye tıkla → sohbete git, o sorgu ile çalıştır (router state → ChatWorkspace otomatik gönderir).
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
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Arama Geçmişim' }]} />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Arama Geçmişim</h1>
            <p className="mt-2 text-sm text-slate-500">
              Daha önce aradıkların — tıkla tekrar ara, istemediğini sil. Geçmişi temizlemek önerilerini sıfırlar.
            </p>
          </div>
          {searchItems.length > 0 && (
            <button onClick={clearAll} disabled={busy}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
              <Trash2 size={15} /> Tümünü temizle
            </button>
          )}
        </div>

        {search === null ? (
          <div className="mt-8 flex items-center gap-2 text-slate-400"><Loader2 size={16} className="animate-spin" /> Yükleniyor…</div>
        ) : searchItems.length === 0 ? (
          <p className="mt-8 text-slate-400">Henüz arama geçmişin yok. Keşfe başla, aramaların burada birikir.</p>
        ) : (
          <>
            <div className="mt-6 space-y-2.5">
              {searchItems.map((it) => (
                <div key={it.query}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:shadow-sm">
                  <button onClick={() => reSearch(it)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                      <Search size={16} />
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
              <div className="mt-6 flex items-center justify-center gap-4 text-sm">
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
