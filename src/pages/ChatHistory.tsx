import { Link } from 'react-router'
import { MessageSquare, Plus, ArrowRight } from 'lucide-react'
import { Crumb } from '../components/ui'
import data from '../mocks/chat-history.json'

export default function ChatHistory() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Sohbet Geçmişi' }]} />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Neler sordun?</h1>
            <p className="mt-1 text-slate-500">Önceki keşif sorularına dön, kaldığın yerden sürdür.</p>
          </div>
          <Link to="/sohbet" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
            <Plus size={16} /> Yeni sohbet
          </Link>
        </div>

        <div className="mt-8 space-y-3">
          {data.items.map((it, i) => (
            <Link key={i} to="/sohbet" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:shadow-md">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                <MessageSquare size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800">{it.text}</p>
                <p className="mt-0.5 text-sm text-slate-400">{it.when}</p>
              </div>
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">Sürdür <ArrowRight size={14} /></span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
