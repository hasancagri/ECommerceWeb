import { ArrowRight, Info } from 'lucide-react'
import { Crumb, Toggle } from '../components/ui'
import data from '../mocks/follows.json'

const kindTones: Record<string, string> = {
  orange: 'bg-orange-100 text-orange-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
}

export default function Follows() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Takiplerim' }]} />
      <div className="px-8 py-8">
        <span className="flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> {data.statusBanner}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Takiplerim</h1>
        <p className="mt-2 max-w-xl text-slate-500">{data.intro}</p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="font-bold">{data.news.title}</p>
            <span className="text-sm text-slate-400">{data.news.window}</span>
          </div>
          <div className="mt-4 space-y-3">
            {data.news.items.map((n) => (
              <div key={n.text} className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-3.5">
                <span className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${kindTones[n.tone]}`}>{n.kind}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{n.text}</p>
                  <p className="text-sm text-slate-400">{n.sub}</p>
                </div>
                <button className="flex items-center gap-1.5 text-sm font-medium text-primary">Detaya git <ArrowRight size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex w-fit rounded-xl bg-slate-100 p-1 text-sm">
          {data.filters.map((f, i) => (
            <button key={f} className={i === 0 ? 'rounded-lg bg-white px-4 py-1.5 font-semibold shadow-sm' : 'px-4 py-1.5 text-slate-500'}>{f}</button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.cards.map((c) => (
            <div key={c.name} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-primary">{c.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold">
                    {c.name}
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{c.kind}</span>
                  </p>
                  <p className="text-sm text-slate-400">{c.sub}</p>
                </div>
              </div>
              <p className={`mt-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm ${c.active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${c.active ? 'bg-emerald-500' : 'bg-slate-400'}`} /> {c.activity}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Toggle on={c.notify} /> {c.notify ? 'Bildirim açık' : 'Bildirim kapalı'}
                </span>
                <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Takibi bırak</button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 flex items-center gap-2 text-xs text-slate-400"><Info size={13} /> {data.note}</p>
      </div>
    </div>
  )
}
