import { Link } from 'react-router'
import { ArrowRight, Clock, Info, Lightbulb, Sparkles } from 'lucide-react'
import { BookThumb, Crumb } from '../components/ui'
import data from '../mocks/weekly-picks.json'

export default function WeeklyPicks() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Haftalık Seçki' }]} />
      <div className="mx-auto max-w-4xl px-8 py-8">
        <div className="rounded-3xl bg-primary p-8 text-white">
          <span className="flex w-fit items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium">
            <Sparkles size={12} /> {data.chip}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">{data.title}</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-blue-100">{data.intro}</p>
        </div>

        <div className="mt-5 space-y-4">
          {data.picks.map((p) => (
            <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex gap-4">
                <BookThumb size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold">{p.title}</p>
                  <p className="text-sm text-slate-500">{p.byline}</p>
                  <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                    <Lightbulb size={13} className="mr-1.5 inline text-primary" />
                    <b className="text-primary">Neden sana?</b> {p.why}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400"><Clock size={12} /> {p.source}</span>
                    <div className="flex gap-2.5">
                      <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Bu hafta geç</button>
                      <Link to="/kitap/1984" className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
                        Detaya git <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
          <Info size={13} className="mt-0.5 shrink-0" /> {data.note}
        </p>
      </div>
    </div>
  )
}
