import { Bell, Lock } from 'lucide-react'
import { Crumb, Toggle } from '../components/ui'
import data from '../mocks/price-alarms.json'

export default function PriceAlarms() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Fiyat Alarmları' }]} />
      <div className="px-8 py-8">
        <span className="flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> {data.statusBanner}
        </span>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fiyat Alarmları & Takip</h1>
            <p className="mt-2 max-w-xl text-slate-500">{data.intro}</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
            <Bell size={15} /> Yeni alarm kur
          </button>
        </div>

        <div className="mt-5 flex w-fit rounded-xl bg-slate-100 p-1 text-sm">
          <button className="rounded-lg bg-white px-4 py-1.5 font-semibold shadow-sm">Fiyat alarmları</button>
          <button className="px-4 py-1.5 text-slate-500">Stok alarmları</button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-1.5 text-3xl font-bold">{s.value}</p>
              <p className={`mt-1 text-sm ${s.subTone === 'green' ? 'text-emerald-600' : 'text-slate-400'}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="font-bold">Aktif takip listesi</p>
                <div className="flex rounded-xl bg-slate-100 p-1 text-sm">
                  <button className="rounded-lg bg-white px-3.5 py-1 font-semibold shadow-sm">Tümü</button>
                  <button className="px-3.5 py-1 text-slate-500">Yüksek olasılık</button>
                  <button className="px-3.5 py-1 text-slate-500">Baskı bekleyen</button>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                {data.tracked.map((t) => (
                  <div key={t.title} className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{t.title} <span className="font-normal text-slate-400">· {t.author}</span></p>
                      <span className="text-sm font-semibold text-slate-600">%{t.progress}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Hedefe kaldı</p>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${t.progress >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${Math.min(t.progress, 100)}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Güncel: <b className="text-slate-800">{t.current}</b> · Hedef: <b className="text-slate-800">{t.target}</b></p>
                    <div className="mt-4 flex gap-3">
                      <button className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Eşiği düzenle</button>
                      <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">Şimdi al</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-bold">{data.recent.title}</p>
              <p className="mt-0.5 text-sm text-slate-400">{data.recent.sub}</p>
              <div className="mt-4 space-y-3">
                {data.recent.items.map((it) => (
                  <div key={it.title} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">✓</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{it.title}</p>
                      <p className="text-sm text-slate-500">{it.text}</p>
                    </div>
                    <button className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700">{it.action}</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
            <p className="font-bold">{data.automation.title}</p>
            <p className="mt-0.5 text-sm text-slate-400">{data.automation.sub}</p>
            <div className="mt-4 space-y-4">
              {data.automation.rules.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">{r.label}</span>
                  <Toggle on={r.on} />
                </div>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-1.5 text-xs text-slate-400"><Lock size={11} /> {data.automation.note}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
