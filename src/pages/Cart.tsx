import { Link } from 'react-router'
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Trash2, Truck } from 'lucide-react'
import { BookThumb, Crumb } from '../components/ui'
import data from '../mocks/cart.json'

export default function Cart() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Sepet' }]} />
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold tracking-tight">Sepetin <span className="ml-1 text-base font-normal text-slate-400">3 kitap</span></h1>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <div>
            <div className="space-y-4">
              {data.items.map((it) => (
                <div key={it.title} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                  <BookThumb />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{it.title}</p>
                    <p className="text-sm text-slate-500">{it.byline}</p>
                    <p className="mt-1.5 flex w-fit items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <Check size={11} /> {data.stockNote}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    Adet
                    <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500"><Minus size={13} /></button>
                    <span className="w-5 text-center font-semibold text-slate-800">{it.qty}</span>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500"><Plus size={13} /></button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{it.price}</p>
                    <p className="text-sm"><span className="text-slate-400 line-through">{it.oldPrice}</span> <span className="font-semibold text-orange-600">{it.discount}</span></p>
                    <p className="text-xs text-slate-400">{it.unit}</p>
                  </div>
                  <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    <Trash2 size={14} /> Çıkar
                  </button>
                </div>
              ))}
            </div>
            <Link to="/sohbet" className="mt-5 flex w-fit items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              <ArrowLeft size={15} /> Keşfe dön, başka kitap ekle
            </Link>
          </div>

          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-bold">Sipariş özeti</p>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Ara toplam (3 kitap)</dt><dd className="font-semibold">{data.summary.subtotal}</dd></div>
                <div className="flex justify-between text-emerald-600"><dt>İndirim</dt><dd className="font-semibold">{data.summary.discount}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Kargo</dt><dd className="font-semibold text-emerald-600">{data.summary.shipping}</dd></div>
              </dl>
              <div className="mt-4 flex gap-2">
                <input className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400" placeholder="İndirim kodu" />
                <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Uygula</button>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="font-bold">Toplam</span>
                <span className="text-2xl font-bold">{data.summary.total}</span>
              </div>
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800">
                ✦ {data.summary.points}
              </p>
              <Link to="/odeme" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark">
                Ödemeye geç <ArrowRight size={15} />
              </Link>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
              <Truck size={14} className="mt-0.5 shrink-0" /> {data.shippingNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
