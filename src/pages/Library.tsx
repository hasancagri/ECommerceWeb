import { Link } from 'react-router'
import { ArrowRight, MoreVertical } from 'lucide-react'
import { BookThumb, Crumb } from '../components/ui'
import data from '../mocks/library.json'

export default function Library() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Kişisel Kitaplığım' }]} />
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Kişisel Kitaplığım <span className="ml-1 text-base font-normal text-slate-400">{data.total}</span></h1>

        <div className="mt-5 flex w-fit flex-wrap rounded-xl bg-slate-100 p-1 text-sm">
          {data.tabs.map((t, i) => (
            <button key={t.name} className={`flex items-center gap-1.5 px-4 py-1.5 ${i === 0 ? 'rounded-lg bg-white font-semibold shadow-sm' : 'text-slate-500'}`}>
              {t.name}
              <span className={`rounded-full px-1.5 text-xs ${i === 0 ? 'bg-blue-50 text-primary' : 'bg-slate-200 text-slate-500'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.books.map((b) => (
            <div key={b.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex gap-3.5">
                <BookThumb />
                <div className="min-w-0">
                  <p className="font-bold">{b.title}</p>
                  <p className="text-sm text-slate-500">{b.author}</p>
                  <p className="text-xs text-slate-400">{b.publisher}</p>
                </div>
              </div>
              <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">{b.added}</p>
              <div className="mt-2 flex items-center justify-between">
                <Link to="/kitap/1984" className="flex items-center gap-1.5 text-sm font-semibold text-primary">Keşfet <ArrowRight size={13} /></Link>
                <button className="text-slate-300 hover:text-slate-500"><MoreVertical size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
