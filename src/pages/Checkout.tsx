import { Link } from 'react-router'
import { Check, CreditCard, Lock, MapPin, Plus, Star } from 'lucide-react'
import { Toggle } from '../components/ui'
import data from '../mocks/checkout.json'

export default function Checkout() {
  return (
    <div>
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-8 py-4 text-sm">
        <Link to="/sepet" className="text-slate-400 hover:text-slate-600">Sepet</Link>
        <span className="text-slate-300">/</span>
        <span className="font-medium text-slate-800">Ödeme</span>
      </div>

      <div className="px-8 py-6">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-2 font-medium text-slate-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={13} /></span> Sepet
          </span>
          <span className="h-px w-10 bg-slate-200" />
          <span className="flex items-center gap-2 font-semibold text-primary">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">2</span> Teslimat & Ödeme
          </span>
          <span className="h-px w-10 bg-slate-200" />
          <span className="flex items-center gap-2 text-slate-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs">3</span> Onay
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="flex items-center gap-2 font-bold"><MapPin size={16} className="text-primary" /> Teslimat adresi</p>
              <div className="mt-4 space-y-3">
                {data.addresses.map((a) => (
                  <label key={a.name} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 ${a.isDefault ? 'border-primary bg-blue-50/40' : 'border-slate-200'}`}>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${a.isDefault ? 'border-primary' : 'border-slate-300'}`}>
                      {a.isDefault && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </span>
                    <div>
                      <p className="flex items-center gap-2 text-sm font-bold">
                        {a.name}
                        {a.isDefault && <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-primary">Varsayılan</span>}
                      </p>
                      <p className="text-sm text-slate-500">{a.line}</p>
                    </div>
                  </label>
                ))}
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-3.5 text-sm font-medium text-primary hover:bg-slate-50">
                  <Plus size={15} /> Yeni adres ekle
                </button>
              </div>
              <label className="mt-4 flex items-center gap-2.5 text-sm text-slate-600">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-white"><Check size={12} /></span>
                Fatura adresim teslimat adresimle aynı
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="flex items-center gap-2 font-bold"><CreditCard size={16} className="text-primary" /> Ödeme yöntemi</p>
              <div className="mt-4 space-y-3">
                {data.cards.map((c) => (
                  <label key={c.label} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 ${c.saved ? 'border-primary bg-blue-50/40' : 'border-slate-200'}`}>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${c.saved ? 'border-primary' : 'border-slate-300'}`}>
                      {c.saved && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </span>
                    <span className="flex-1 text-sm font-semibold">{c.label}</span>
                    {c.brand && <span className="text-sm font-bold italic text-blue-800">{c.brand}</span>}
                  </label>
                ))}
              </div>
              <p className="mt-5 text-sm font-medium text-slate-600">Taksit seçenekleri</p>
              <div className="mt-2 flex w-fit rounded-xl bg-slate-100 p-1 text-sm">
                {data.installments.map((t, i) => (
                  <button key={t} className={i === 0 ? 'rounded-lg bg-white px-4 py-1.5 font-semibold shadow-sm' : 'px-4 py-1.5 text-slate-500'}>{t}</button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
              <span className="h-5 w-5 rounded-md border-2 border-slate-300" />
              <span><b className="text-primary">Ön bilgilendirme formu</b> ve <b className="text-primary">mesafeli satış sözleşmesini</b> okudum, onaylıyorum.</span>
            </label>
          </div>

          <div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="font-bold">Sipariş özeti</p>
              <dl className="mt-4 space-y-2 text-sm">
                {data.lines.map((l) => (
                  <div key={l.title} className="flex justify-between">
                    <dt className="text-slate-600">{l.title} <span className="text-slate-400">{l.qty}</span></dt>
                    <dd className="font-semibold">{l.price}</dd>
                  </div>
                ))}
              </dl>
              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Ara toplam</dt><dd className="font-semibold">{data.summary.subtotal}</dd></div>
                <div className="flex justify-between text-emerald-600"><dt>İndirim</dt><dd className="font-semibold">{data.summary.discount}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Kargo</dt><dd className="font-semibold text-emerald-600">{data.summary.shipping}</dd></div>
              </dl>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 p-3.5">
                <span className="flex items-center gap-2.5 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500"><Star size={15} /></span>
                  <span><b>Puanla öde</b><br /><span className="text-xs text-slate-500">{data.pointsPay}</span></span>
                </span>
                <Toggle on={false} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold">Ödenecek tutar</span>
                <span className="text-2xl font-bold">{data.summary.total}</span>
              </div>
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800">✦ {data.pointsEarn}</p>
              <Link to="/siparislerim" className="pointer-events-none mt-4 flex items-center justify-center rounded-xl bg-slate-200 py-3 text-sm font-semibold text-slate-400">
                Ödemeyi tamamla · {data.summary.total}
              </Link>
              <p className="mt-2 text-center text-xs text-slate-400">Devam etmek için sözleşmeyi onayla.</p>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-400">
              <Lock size={13} className="mt-0.5 shrink-0" /> {data.securityNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
