import { Info } from 'lucide-react'
import StatRow from './StatRow'
import admin from '../../mocks/admin.json'

const d = admin.queries
const kindDots: Record<string, string> = { blue: 'bg-blue-500', orange: 'bg-orange-500', purple: 'bg-purple-500' }

export default function AdminQueries() {
  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-sm">
        <span><span className="text-slate-400">Yönetim / </span><span className="font-medium text-slate-700">Karşılıksız Sorgu Analitiği</span></span>
        <div className="flex rounded-xl bg-white p-1 shadow-sm">
          {d.ranges.map((r, i) => (
            <button key={r} className={i === 1 ? 'rounded-lg bg-blue-50 px-3.5 py-1 font-semibold text-primary' : 'px-3.5 py-1 text-slate-500'}>{r}</button>
          ))}
        </div>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Karşılıksız sorgular</h1>
      <p className="mt-2 max-w-2xl text-slate-500">{d.intro}</p>

      <div className="mt-6"><StatRow stats={d.stats} /></div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="font-bold">En sık karşılıksız sorgular</p>
            <span className="text-xs text-slate-400">Tekrar sayısına göre</span>
          </div>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
                <th className="pb-2.5">SORGU</th>
                <th className="pb-2.5 text-right">TEKRAR</th>
                <th className="pb-2.5 text-right">TREND</th>
                <th className="pb-2.5 text-right">AKSİYON</th>
              </tr>
            </thead>
            <tbody>
              {d.rows.map((r) => (
                <tr key={r.query} className="border-b border-slate-50 last:border-0">
                  <td className="py-3.5">
                    <p className="font-semibold text-slate-800">{r.query}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <span className={`h-1.5 w-1.5 rounded-full ${kindDots[r.tone]}`} /> {r.kind}
                    </p>
                  </td>
                  <td className="py-3.5 text-right font-bold">{r.count}</td>
                  <td className={`py-3.5 text-right text-sm font-medium ${r.trend.startsWith('▲') ? 'text-emerald-600' : 'text-slate-400'}`}>{r.trend}</td>
                  <td className="py-3.5 text-right">
                    <button className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">{r.action}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold">Talep kümeleri</p>
            <p className="mt-0.5 text-sm text-slate-400">AI, boş sorguları temaya göre grupladı.</p>
            <div className="mt-4 space-y-4">
              {d.clusters.map((c) => (
                <div key={c.name} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{c.name}</p>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-primary">{c.count}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{c.desc}</p>
                  <button className="mt-3 w-full rounded-xl bg-blue-50 py-2 text-sm font-semibold text-primary hover:bg-blue-100">Katalog önerisi oluştur</button>
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
