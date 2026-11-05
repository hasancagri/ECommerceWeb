import { Link } from 'react-router'
import { Sparkles, Check, RefreshCw, Paperclip, Mic, ArrowUp, ChevronDown, MessageSquare } from 'lucide-react'
import { Crumb } from '../components/ui'
import data from '../mocks/chat.json'

/* {Kitap — Yazar} desenini linke çevirir */
function RichText({ text }: { text: string }) {
  const parts = text.split(/\{([^}]+)\}/g)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <Link key={i} to="/kitap/1984" className="font-semibold text-primary hover:underline">{p}</Link>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export default function ChatWorkspace() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Çalışma Alanı' }]} />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-8 py-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <Sparkles size={14} /> {data.statusBanner}
          </span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Zevk profili:</span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700">
              {data.tasteProfile.join(' · ')}
            </span>
          </div>
        </div>

        <div className="mt-8 flex-1 space-y-6">
          {data.messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                  <MessageSquare size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Siz sordunuz <span className="ml-1 font-normal text-slate-400">{m.time}</span>
                  </p>
                  <p className="mt-1.5 max-w-3xl leading-relaxed text-slate-800">{m.text}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                  <Sparkles size={15} />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    Kâşif
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <Check size={11} /> {m.badge}
                    </span>
                  </p>
                  <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-5 leading-relaxed text-slate-700">
                    <RichText text={m.text} />
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        <div className="sticky bottom-0 bg-surface pb-5 pt-4">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1.5 text-slate-500"><Sparkles size={13} /> Sohbeti genişlet:</span>
            {data.expanders.map((e) => (
              <button key={e} className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-slate-700 hover:bg-slate-50">{e}</button>
            ))}
            <button className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-slate-400 hover:text-slate-600"><RefreshCw size={13} /> Yenile</button>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-3 pr-2 shadow-lg shadow-slate-200/50">
            <button className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Dengeli <ChevronDown size={13} />
            </button>
            <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder={data.inputPlaceholder} />
            <button className="p-2 text-slate-400"><Paperclip size={17} /></button>
            <button className="p-2 text-slate-400"><Mic size={17} /></button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"><ArrowUp size={18} /></button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">{data.disclaimer}</p>
        </div>
      </div>
    </div>
  )
}
