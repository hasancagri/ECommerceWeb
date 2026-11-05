import { Award, Calendar, Lock } from 'lucide-react'
import { Crumb } from '../components/ui'
import data from '../mocks/reading-profile.json'

const genreTones: Record<string, string> = {
  blue: 'bg-blue-600', teal: 'bg-teal-600', purple: 'bg-purple-500', orange: 'bg-orange-500', slate: 'bg-slate-400',
}

export default function ReadingProfile() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Okuma Profilim' }]} />
      <div className="px-8 py-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Okuma profilin</h1>
            <p className="mt-1 text-slate-500">{data.intro}</p>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium"><Calendar size={14} /> {data.year}</span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {data.stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-[11px] font-semibold tracking-wider text-slate-400">{s.label}</p>
              <p className="mt-1.5 text-2xl font-bold">{s.value}</p>
              <p className={`mt-0.5 text-sm ${s.subTone === 'green' ? 'text-emerald-600' : 'text-slate-400'}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="font-bold">Rozetlerin</p>
            <span className="text-sm text-slate-400">{data.badges.summary}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
            {data.badges.unlocked.map((b) => (
              <div key={b.name} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><Award size={16} /></span>
                <p className="mt-2.5 text-sm font-bold">{b.name}</p>
                <p className="text-xs text-slate-500">{b.desc}</p>
              </div>
            ))}
            {data.badges.locked.map((b) => (
              <div key={b.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 opacity-70">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-400"><Lock size={14} /></span>
                <p className="mt-2.5 text-sm font-bold text-slate-500">{b.name}</p>
                <p className="text-xs text-slate-400">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="font-bold">{data.challenge.title}</p>
                <span className="text-sm font-bold text-primary">{data.challenge.progress}</span>
              </div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-primary" style={{ width: `${data.challenge.pct}%` }} />
              </div>
              <p className="mt-2.5 text-sm text-slate-500">{data.challenge.note}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-bold">Tür dağılımı</p>
              <div className="mt-4 space-y-3">
                {data.genres.map((g) => (
                  <div key={g.name}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{g.name}</span>
                      <span className="font-semibold text-slate-500">%{g.pct}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${genreTones[g.tone]}`} style={{ width: `${g.pct * 2}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-bold">{data.monthly.title}</p>
              <div className="mt-6 flex h-36 items-end gap-5 px-2">
                {data.monthly.counts.map((c, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-600">{c}</span>
                    <div className="w-full rounded-md bg-teal-300" style={{ height: `${c * 32}px` }} />
                    <span className="text-xs text-slate-400">{data.monthly.months[i]}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-slate-400">{data.monthly.caption}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-bold">Öne çıkanlar</p>
              <dl className="mt-4 space-y-3 text-sm">
                {data.highlights.map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-100 pb-2.5 last:border-0">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
