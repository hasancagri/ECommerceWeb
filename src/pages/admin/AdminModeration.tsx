import { Check, Flag, Info } from 'lucide-react'
import { Stars } from '../../components/ui'
import StatRow from './StatRow'
import admin from '../../mocks/admin.json'

const d = admin.moderation

export default function AdminModeration() {
  return (
    <div className="px-8 py-6">
      <div className="border-b border-slate-200 pb-4 text-sm">
        <span className="text-slate-400">Yönetim / </span><span className="font-medium text-slate-700">Yorum & Alıntı Moderasyonu</span>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Yorum & alıntı moderasyonu</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Okur yorumları ve alıntılar yayına çıkmadan önce buraya düşer. Kâşif otomatik risk işaretler (spam, spoiler, hakaret, telif); <b className="text-slate-800">son kararı sen verirsin.</b>
      </p>

      <div className="mt-6"><StatRow stats={d.stats} /></div>

      <div className="mt-6 flex w-fit rounded-xl bg-white p-1 text-sm shadow-sm">
        {d.tabs.map((t, i) => (
          <button key={t} className={i === 0 ? 'rounded-lg bg-blue-50 px-4 py-1.5 font-semibold text-primary' : 'px-4 py-1.5 text-slate-500'}>{t}</button>
        ))}
      </div>

      <div className="mt-5 max-w-5xl space-y-4">
        {d.queue.map((q, i) => (
          <div key={i} className={`rounded-2xl border bg-white p-5 ${q.flag ? 'border-orange-200' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2.5 text-sm">
                <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${q.kind === 'YORUM' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>{q.kind}</span>
                <span className="font-semibold">{q.user}</span>
                <span className="text-slate-400">· {q.book} · {q.when}</span>
              </p>
              {q.flag ? (
                <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"><Flag size={11} /> {q.flag}</span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"><Check size={11} /> {q.flagOk}</span>
              )}
            </div>
            <p className={`mt-3 border-l-4 py-1 pl-4 text-sm leading-relaxed ${q.flag ? 'border-orange-300 bg-orange-50/50 text-slate-700' : 'border-slate-200 text-slate-700'} ${q.kind === 'ALINTI' ? 'italic' : ''}`}>
              {q.text}
            </p>
            {q.stars !== null && (
              <p className="mt-2 flex items-center gap-2"><Stars value={q.stars} size={13} /> <span className="text-xs text-slate-400">{q.stars}/5</span></p>
            )}
            <div className="mt-4 flex gap-3">
              <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">Onayla & yayınla</button>
              <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Düzenleyerek onayla</button>
              <button className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">Reddet</button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-slate-400"><Info size={13} /> {d.note}</p>
    </div>
  )
}
