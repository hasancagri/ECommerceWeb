import { Link } from 'react-router'
import { Share, Sparkles, Trash2 } from 'lucide-react'
import { Crumb } from '../components/ui'
import data from '../mocks/quotes.json'

export default function Quotes() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Alıntılarım' }]} />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Alıntılarım <span className="ml-1 text-base font-normal text-slate-400">{data.total}</span></h1>

        <div className="mt-7 space-y-4">
          {data.items.map((q) => (
            <div key={q.text} className="rounded-2xl border border-slate-200 border-l-4 border-l-teal-400 bg-white p-6">
              <p className="text-lg italic leading-relaxed text-slate-800">{q.text}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm">
                  <Link to="/kitap/1984" className="font-semibold text-primary">{q.book}</Link>
                  <span className="text-slate-400"> · {q.author} · {q.date}</span>
                </p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <Share size={13} /> Açıkla
                  </button>
                  <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <Sparkles size={13} /> Benzerini bul
                  </button>
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-slate-400 hover:bg-slate-50"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
