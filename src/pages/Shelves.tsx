import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { Crumb } from '../components/ui'
import data from '../mocks/shelves.json'

export default function Shelves() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Raflarım' }]} />
      <div className="px-8 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Raflarım <span className="ml-1 text-base font-normal text-slate-400">{data.total}</span></h1>

        <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <button className="flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:bg-white">
            <Plus size={22} />
            <span className="text-sm font-medium">Yeni raf oluştur</span>
          </button>
          {data.shelves.map((s) => (
            <div key={s.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-sm text-slate-400">{s.count}</p>
                </div>
                <button className="text-slate-300 hover:text-slate-500"><Trash2 size={15} /></button>
              </div>
              <div className="mt-3 flex flex-1 flex-wrap content-start gap-2">
                {s.books.map((b) => (
                  <span key={b} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{b}</span>
                ))}
                {s.more > 0 && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-primary">+{s.more}</span>}
              </div>
              <button className="mt-4 flex w-fit items-center gap-1.5 text-sm font-semibold text-primary">Rafı aç <ArrowRight size={13} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
