import { Check, Info, Plus, Sparkles } from 'lucide-react'
import admin from '../../mocks/admin.json'

const d = admin.curator
const kindTones: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700', orange: 'bg-orange-100 text-orange-700', green: 'bg-emerald-100 text-emerald-700',
}
const liveDots: Record<string, string> = { green: 'bg-emerald-500', amber: 'bg-amber-500' }

export default function AdminCurator() {
  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-sm">
        <span><span className="text-slate-400">Yönetim / </span><span className="font-medium text-slate-700">Küratör Paneli</span></span>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark">
          <Plus size={15} /> Elle seçki oluştur
        </button>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Küratör paneli</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        İlke: <b className="text-slate-800">AI önerir, insan onaylar.</b> Kâşif vitrin bloklarını ve haftalık seçkileri gerekçesiyle hazırlar; yayına almadan önce sen onaylarsın.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <p className="flex items-center gap-2 font-bold">
            {d.pendingTitle} <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-primary">{d.pending.length + 2}</span>
          </p>
          <div className="mt-4 space-y-5">
            {d.pending.map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide ${kindTones[p.tone]}`}>{p.kind}</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <Check size={11} /> {p.confidence}
                  </span>
                </div>
                <p className="mt-3 text-lg font-bold">{p.title}</p>
                <p className="text-sm text-slate-400">{p.sub}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.books.map((b) => (
                    <span key={b} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">{b}</span>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Sparkles size={13} className="text-primary" /> Kâşif'in gerekçesi</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{p.reason}</p>
                  <p className="mt-2 text-xs text-slate-400">{p.source}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">Onayla & yayınla</button>
                  <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Düzenle</button>
                  <button className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">Reddet</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold">{d.live.title}</p>
            <p className="mt-0.5 text-sm text-slate-400">{d.live.sub}</p>
            <div className="mt-4 space-y-3">
              {d.live.items.map((it) => (
                <div key={it.name} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${liveDots[it.tone]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{it.name}</p>
                    <p className="text-xs text-slate-400">{it.sub}</p>
                  </div>
                  <button className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700">Düzenle</button>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs text-slate-400"><Info size={13} className="mt-0.5 shrink-0" /> {d.note}</p>
        </div>
      </div>
    </div>
  )
}
