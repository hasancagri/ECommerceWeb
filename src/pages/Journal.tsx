import { Book, Heart, MessageSquare } from 'lucide-react'
import { Crumb } from '../components/ui'
import data from '../mocks/journal.json'

export default function Journal() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Okuma Günlüğü' }]} />
      <div className="mx-auto max-w-3xl px-8 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Okuma günlüğüm</h1>
        <p className="mt-1 text-slate-500">{data.intro}</p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">SY</span>
            <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder={data.composerPlaceholder} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5">
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Book size={14} /> Kitap etiketle
            </button>
            <button className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Paylaş</button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {data.entries.map((e, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">SY</span>
                <div className="flex-1">
                  <p className="text-sm font-bold">Selin Yılmaz</p>
                  <p className="text-xs text-slate-400">{e.when}</p>
                </div>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${e.kind === 'Durum' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{e.kind}</span>
              </div>
              <p className="mt-3 leading-relaxed text-slate-800">{e.text}</p>
              <span className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
                <Book size={13} className="text-indigo-400" /> <b>{e.book}</b> <span className="text-slate-400">· {e.author}</span>
              </span>
              <div className="mt-3 flex items-center gap-5 border-t border-slate-100 pt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Heart size={14} /> {e.likes}</span>
                <span className="flex items-center gap-1.5"><MessageSquare size={14} /> Not ekle</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
