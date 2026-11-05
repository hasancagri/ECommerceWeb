import { Link } from 'react-router'
import { AlertTriangle, ArrowRight, Info, LineChart, ShieldCheck, Star, Database } from 'lucide-react'
import StatRow from './StatRow'
import admin from '../../mocks/admin.json'

const d = admin.dashboard
const sectionIcons = [LineChart, Star, Database, ShieldCheck]
const dotTones: Record<string, string> = { green: 'bg-emerald-500', blue: 'bg-blue-500', orange: 'bg-orange-500', purple: 'bg-purple-500' }

export default function AdminDashboard() {
  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-sm">
        <span className="font-medium text-slate-700">Yönetim panosu</span>
        <span className="text-slate-400">{d.date}</span>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">{d.greeting}</h1>
      <p className="mt-2 max-w-2xl text-slate-500">{d.intro}</p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><AlertTriangle size={18} /></span>
        <div className="flex-1">
          <p className="font-bold text-slate-800">{d.alert.title}</p>
          <p className="text-sm text-slate-600">{d.alert.sub}</p>
        </div>
        <Link to="/yonetim/moderasyon" className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">{d.alert.action}</Link>
      </div>

      <div className="mt-6"><StatRow stats={d.stats} /></div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <p className="font-bold">Bölümler</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {d.sections.map((s, i) => {
              const Icon = sectionIcons[i]
              return (
                <Link key={s.name} to={s.to} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary"><Icon size={18} /></span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{s.chip}</span>
                  </div>
                  <p className="mt-4 font-bold">{s.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
                  <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary">Aç <ArrowRight size={13} /></span>
                </Link>
              )
            })}
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold">Son hareketler</p>
            <div className="mt-4 space-y-4">
              {d.recent.map((r, i) => (
                <div key={i} className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotTones[r.tone]}`} />
                  <div>
                    <p className="text-sm leading-snug text-slate-700">{r.text}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{r.when}</p>
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
