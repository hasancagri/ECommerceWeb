import { AlertCircle, Info, Sparkles, Star } from 'lucide-react'
import { BookThumb } from '../../components/ui'
import StatRow from './StatRow'
import admin from '../../mocks/admin.json'

const d = admin.quality
const fieldTones: Record<string, string> = { blue: 'bg-blue-600', orange: 'bg-orange-500', teal: 'bg-teal-600' }

export default function AdminDataQuality() {
  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-sm">
        <span><span className="text-slate-400">Yönetim / </span><span className="font-medium text-slate-700">Veri Kalitesi</span></span>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark">
          <Sparkles size={15} /> AI ile toplu doldur
        </button>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Veri kalitesi & boşluk doldurma</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Katalogda eksik künye alanları keşfi ve önerileri zayıflatır. Kâşif eksikleri bulur, doldurma önerir; sen onaylarsın. <b className="text-slate-800">Onaysız hiçbir alan yazılmaz.</b>
      </p>

      <div className="mt-6"><StatRow stats={d.stats} /></div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <p className="font-bold">{d.queueTitle}</p>
          <div className="mt-4 space-y-5">
            {d.queue.map((q) => (
              <div key={q.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-4">
                  <BookThumb size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{q.title}</p>
                    <p className="text-sm text-slate-400">{q.byline}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm text-slate-400">Doluluk</span>
                    <div className="h-2 w-28 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${q.fill >= 60 ? 'bg-blue-600' : 'bg-orange-500'}`} style={{ width: `${q.fill}%` }} />
                    </div>
                    <span className={`text-sm font-bold ${q.fill >= 60 ? 'text-primary' : 'text-orange-600'}`}>%{q.fill}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {q.missing.map((m) => (
                    <span key={m} className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                      <AlertCircle size={11} /> {m}
                    </span>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Star size={13} className="text-primary" /> Kâşif'in önerisi</p>
                  <dl className="mt-2.5 space-y-2 text-sm">
                    {q.suggestions.map(([field, value, conf]) => (
                      <div key={field} className="flex items-center justify-between">
                        <dt className="text-slate-500">{field}</dt>
                        <dd><b>{value}</b> <span className="text-slate-400">· {conf}</span></dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-2.5 text-xs text-slate-400">{q.source}</p>
                </div>
                <div className="mt-4 flex gap-3">
                  <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">Öneriyi onayla</button>
                  <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Elle düzelt</button>
                  <button className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">Atla</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold">{d.fieldFill.title}</p>
            <p className="mt-0.5 text-sm text-slate-400">{d.fieldFill.sub}</p>
            <div className="mt-5 space-y-4">
              {d.fieldFill.fields.map((f) => (
                <div key={f.name}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{f.name}</span>
                    <span className="font-bold">%{f.pct}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full ${fieldTones[f.tone]}`} style={{ width: `${f.pct}%` }} />
                  </div>
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
