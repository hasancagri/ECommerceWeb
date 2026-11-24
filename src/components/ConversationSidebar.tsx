// 014/016: Kalıcı sohbet listesi paneli (Claude-tarzı). PublicLayout sol sidebar'ına gömülür → her
// rotada görünür. Login → sunucu Conversation'ları (listConversations); anon → sessionStorage (listAnon).
// Her satır /sohbet?c=<id> linki; aktif satır ?c= URL param'ından okunur. "..." menüsü: yeniden adlandır
// + sil (login sunucu çağrısı, anon sessionStorage). Aktif sohbet silinince /sohbet'e döner (yeni sohbet).
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { MessageSquare, Plus, MoreHorizontal, Pencil, Trash2, Check, X, ChevronDown, ChevronRight } from 'lucide-react'
import { listConversations, renameConversation, deleteConversation } from '../api/chat'
import { listAnon, renameAnon, deleteAnon } from '../lib/anonChats'
import { useAuthSession } from '../auth/useAuthSession'

interface Row { id: string; title: string; updatedAt: string }

export default function ConversationSidebar() {
  const { accessToken, isAuthenticated } = useAuthSession()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const activeId = params.get('c') ?? undefined

  const [rows, setRows] = useState<Row[]>([])
  const [menuId, setMenuId] = useState<string | undefined>(undefined)
  // Menü fixed konumlanır (sidebar + nav iç içe overflow-y-auto dropdown'u kırpar) — "..." butonunun
  // ekran koordinatından hesaplanır, body'ye göre sabitlenir.
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | undefined>(undefined)
  const [editId, setEditId] = useState<string | undefined>(undefined)
  const [editTitle, setEditTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const editRef = useRef<HTMLInputElement>(null)
  // Sabit "Geçmiş sohbetler" folder'ı — tüm yazışmalar içinde; collapse durumu localStorage'da kalıcı.
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('scout:history-collapsed') === '1')
  const toggleCollapsed = () => setCollapsed((c) => {
    const next = !c
    localStorage.setItem('scout:history-collapsed', next ? '1' : '0')
    return next
  })

  const refresh = useCallback(async () => {
    if (isAuthenticated && accessToken) {
      try { const r = await listConversations(accessToken); setRows(r.conversations) }
      catch { setRows([]) }
    } else {
      setRows(listAnon().map((c) => ({ id: c.id, title: c.title, updatedAt: c.updatedAt })))
    }
  }, [isAuthenticated, accessToken])

  // İlk yükleme + kimlik değişimi; ayrıca ChatWorkspace yeni sohbet/yeni tur sinyalinde tazele.
  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => {
    const onChange = () => { void refresh() }
    window.addEventListener('scout:convos-changed', onChange)
    return () => window.removeEventListener('scout:convos-changed', onChange)
  }, [refresh])
  // ?c= değişimi yeni bir sohbet oluşmuş olabileceğini gösterir (login'de sunucu kaydetti) → tazele.
  useEffect(() => { void refresh() }, [activeId, refresh])

  useEffect(() => { if (editId) editRef.current?.focus() }, [editId])

  function startRename(row: Row) {
    setMenuId(undefined)
    setEditId(row.id)
    setEditTitle(row.title)
  }

  async function commitRename(id: string) {
    const title = editTitle.trim()
    if (!title || busy) { setEditId(undefined); return }
    setBusy(true)
    try {
      if (isAuthenticated && accessToken) {
        await renameConversation(id, title, accessToken)
        // Sunucu sırayı korur (rename bump etmez) — sunucudan tazele, sırayı değiştirme.
        await refresh()
      } else {
        renameAnon(id, title)
        setRows((rs) => rs.map((r) => (r.id === id ? { ...r, title } : r)))
      }
    } catch {
      /* sessiz — kullanıcı tekrar dener */
    } finally {
      setBusy(false)
      setEditId(undefined)
    }
  }

  async function remove(row: Row) {
    setMenuId(undefined)
    if (busy) return
    if (!window.confirm(`“${row.title}” sohbeti silinsin mi?`)) return
    setBusy(true)
    try {
      if (isAuthenticated && accessToken) await deleteConversation(row.id, accessToken)
      else deleteAnon(row.id)
      setRows((rs) => rs.filter((r) => r.id !== row.id))
      // Açık olan sohbet silindiyse → yeni sohbet durumuna dön (T020: ölü id'ye mesaj gönderilmesin).
      if (row.id === activeId) navigate('/sohbet')
    } catch {
      /* sessiz */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col">
      <Link to="/sohbet"
        className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
        <Plus size={15} /> Yeni sohbet
      </Link>

      {/* Sabit folder başlığı — tık ile tüm geçmiş aç/kapa (collapse). */}
      <button onClick={toggleCollapsed}
        className="mb-1 flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:bg-slate-50">
        {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        Geçmiş sohbetler
        {rows.length > 0 && (
          <span className="ml-auto rounded-full bg-slate-100 px-1.5 text-[10px] font-medium text-slate-500">{rows.length}</span>
        )}
      </button>

      {!collapsed && (
      <div className="max-h-72 space-y-0.5 overflow-y-auto">
        {rows.length === 0 ? (
          <p className="px-3 py-2 text-xs text-slate-400">
            {isAuthenticated ? 'Henüz sohbetin yok.' : 'Misafir sohbetlerin bu oturumda tutulur.'}
          </p>
        ) : (
          rows.map((row) => {
            const active = row.id === activeId
            if (editId === row.id) {
              return (
                <div key={row.id} className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1">
                  <input
                    ref={editRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void commitRename(row.id)
                      else if (e.key === 'Escape') setEditId(undefined)
                    }}
                    maxLength={120}
                    className="min-w-0 flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-primary"
                  />
                  <button onClick={() => void commitRename(row.id)} aria-label="Kaydet"
                    className="shrink-0 rounded p-1 text-emerald-600 hover:bg-emerald-50"><Check size={14} /></button>
                  <button onClick={() => setEditId(undefined)} aria-label="İptal"
                    className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100"><X size={14} /></button>
                </div>
              )
            }
            return (
              <div key={row.id} className="group relative flex items-center">
                <Link to={`/sohbet?c=${row.id}`}
                  className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                    active ? 'bg-blue-50 font-medium text-primary' : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                  <MessageSquare size={14} className="shrink-0 text-slate-400" />
                  <span className="truncate">{row.title}</span>
                </Link>
                <button
                  onClick={(e) => {
                    if (menuId === row.id) { setMenuId(undefined); return }
                    const r = e.currentTarget.getBoundingClientRect()
                    setMenuPos({ top: r.bottom + 4, left: Math.max(8, r.right - 160) })
                    setMenuId(row.id)
                  }}
                  aria-label="Sohbet menüsü"
                  className={`absolute right-1.5 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 ${
                    menuId === row.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                  <MoreHorizontal size={15} />
                </button>
              </div>
            )
          })
        )}
      </div>
      )}

      {/* Fixed menü — overflow clip'ten bağımsız (sidebar/nav iç içe scroll kutularını aşar). */}
      {menuId && menuPos && (() => {
        const row = rows.find((r) => r.id === menuId)
        if (!row) return null
        return (
          <>
            <button className="fixed inset-0 z-40 cursor-default" aria-hidden tabIndex={-1}
              onClick={() => setMenuId(undefined)} />
            <div style={{ top: menuPos.top, left: menuPos.left }}
              className="fixed z-50 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <button onClick={() => startRename(row)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                <Pencil size={14} className="text-slate-400" /> Yeniden adlandır
              </button>
              <button onClick={() => void remove(row)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                <Trash2 size={14} /> Sil
              </button>
            </div>
          </>
        )
      })()}
    </div>
  )
}
