import { Link } from 'react-router'
import { ArrowRight, Check, FileText } from 'lucide-react'
import { BookThumb, Crumb } from '../components/ui'
import data from '../mocks/order.json'

export default function OrderConfirmation() {
  return (
    <div>
      <Crumb items={[{ label: 'Siparişlerim' }, { label: data.number }]} />
      <div className="px-8 py-8">
        <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check size={26} /></span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Siparişin alındı, teşekkürler!</h1>
            <p className="mt-1 text-sm text-slate-500">
              Sipariş <b className="text-slate-800">{data.number}</b> · {data.placedAt} · Onay e-postası <b className="text-slate-800">{data.emailMasked}</b> adresine gönderildi.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="font-bold">Sipariş durumu</p>
                <span className="text-xs text-slate-400">aşamaya tıkla · önizleme</span>
              </div>
              <div className="mt-5 space-y-0">
                {data.timeline.map((t, i) => (
                  <div key={t.title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {t.state === 'done' ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={14} /></span>
                      ) : t.state === 'current' ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border-4 border-blue-100 bg-primary" />
                      ) : (
                        <span className="h-7 w-7 rounded-full bg-slate-100" />
                      )}
                      {i < data.timeline.length - 1 && <span className="w-px flex-1 bg-slate-200" />}
                    </div>
                    <div className="pb-7">
                      <p className={`font-semibold ${t.state === 'pending' ? 'text-slate-400' : ''}`}>{t.title}</p>
                      <p className="text-sm text-slate-400">{t.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-bold">Teslimat</p>
              <div className="mt-4 grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400">ADRES</p>
                  <p className="mt-1.5 font-semibold">{data.delivery.address}</p>
                  <p className="text-slate-500">{data.delivery.addressSub}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wider text-slate-400">KARGO</p>
                  <p className="mt-1.5 font-semibold">{data.delivery.cargo}</p>
                  <p className="text-slate-500">{data.delivery.cargoSub}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-bold">Sipariş içeriği</p>
              <div className="mt-4 space-y-3">
                {data.lines.map((l) => (
                  <div key={l.title} className="flex items-center gap-3">
                    <BookThumb size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{l.title}</p>
                      <p className="text-xs text-slate-400">{l.sub}</p>
                    </div>
                    <p className="text-sm font-semibold">{l.price}</p>
                  </div>
                ))}
              </div>
              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Ara toplam</dt><dd className="font-semibold">{data.summary.subtotal}</dd></div>
                <div className="flex justify-between text-emerald-600"><dt>İndirim</dt><dd className="font-semibold">{data.summary.discount}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Kargo</dt><dd className="font-semibold text-emerald-600">{data.summary.shipping}</dd></div>
              </dl>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="font-bold">Ödenen tutar</span>
                <span className="text-xl font-bold">{data.summary.total}</span>
              </div>
              <p className="mt-3 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800">✦ {data.summary.points}</p>
              <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <FileText size={15} /> Faturayı görüntüle
              </button>
            </div>
            <Link to="/sohbet" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark">
              Kâşif ile keşfe devam et <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
