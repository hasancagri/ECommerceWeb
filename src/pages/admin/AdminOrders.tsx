import { Info } from 'lucide-react'
import StatRow from './StatRow'
import admin from '../../mocks/admin.json'

const d = admin.orders
const statusTones: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700', green: 'bg-emerald-50 text-emerald-700', orange: 'bg-orange-50 text-orange-700',
}

export default function AdminOrders() {
  return (
    <div className="px-8 py-6">
      <div className="border-b border-slate-200 pb-4 text-sm">
        <span className="text-slate-400">Yönetim / </span><span className="font-medium text-slate-700">Siparişler & İade</span>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Siparişler & iade</h1>
      <p className="mt-2 max-w-2xl text-slate-500">
        Fiziksel kitap siparişlerinin durumu ve iade talepleri. Kâşif iade sebebini özetler ve bir öneri sunar; <b className="text-slate-800">kararı sen verirsin.</b>
      </p>

      <div className="mt-6"><StatRow stats={d.stats} /></div>

      <div className="mt-6 flex w-fit rounded-xl bg-white p-1 text-sm shadow-sm">
        {d.tabs.map((t, i) => (
          <button key={t} className={i === 0 ? 'rounded-lg bg-blue-50 px-4 py-1.5 font-semibold text-primary' : 'px-4 py-1.5 text-slate-500'}>{t}</button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="font-bold">Son siparişler</p>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-semibold tracking-wider text-slate-400">
              <th className="pb-2.5">SİPARİŞ</th>
              <th className="pb-2.5">MÜŞTERİ & KİTAP</th>
              <th className="pb-2.5 text-right">TUTAR</th>
              <th className="pb-2.5 pl-8">DURUM</th>
              <th className="pb-2.5 text-right">AKSİYON</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r) => (
              <tr key={r.no} className="border-b border-slate-50 last:border-0">
                <td className="py-3.5 font-semibold text-primary">{r.no}</td>
                <td className="py-3.5">
                  <p className="font-semibold text-slate-800">{r.customer}</p>
                  <p className="text-xs text-slate-400">{r.books}</p>
                </td>
                <td className="py-3.5 text-right font-bold">{r.amount}</td>
                <td className="py-3.5 pl-8">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusTones[r.tone]}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" /> {r.status}
                  </span>
                </td>
                <td className="py-3.5 text-right">
                  <button className="rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Detay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-slate-400"><Info size={13} /> {d.note}</p>
    </div>
  )
}
