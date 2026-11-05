import { Link } from 'react-router'
import { ChevronRight, Globe, LogOut, MapPin, Plus, Truck } from 'lucide-react'
import { Crumb, Toggle } from '../components/ui'
import data from '../mocks/account.json'

export default function AccountSettings() {
  return (
    <div>
      <Crumb items={[{ label: 'Kâşif', to: '/' }, { label: 'Hesap & Ayarlar' }]} />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Hesap & Ayarlar</h1>

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-700">SY</span>
          <div className="flex-1">
            <p className="text-lg font-bold">{data.profile.name}</p>
            <p className="text-sm text-slate-500">{data.profile.email} · {data.profile.member}</p>
          </div>
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Profili düzenle</button>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400">HESAP GÜVENLİĞİ</p>
          <div className="mt-3 divide-y divide-slate-100">
            {data.security.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-sm text-slate-500">{s.sub}</p>
                </div>
                <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-primary hover:bg-blue-50">Değiştir</button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400">BİLDİRİM TERCİHLERİ</p>
          <div className="mt-3 divide-y divide-slate-100">
            {data.notifications.map((n) => (
              <div key={n.label} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-semibold">{n.label}</p>
                  <p className="text-sm text-slate-500">{n.sub}</p>
                </div>
                <Toggle on={n.on} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400">KAYITLI KARTLAR</p>
            <button className="flex items-center gap-1.5 text-sm font-medium text-primary"><Plus size={14} /> Kart ekle</button>
          </div>
          {data.cards.map((c) => (
            <div key={c.masked} className="mt-3 flex items-center gap-4 rounded-xl border border-slate-200 p-4">
              <span className="rounded-md bg-blue-900 px-2.5 py-1 text-xs font-bold italic text-white">{c.brand}</span>
              <div className="flex-1">
                <p className="text-sm font-bold tracking-wider">{c.masked}</p>
                <p className="text-xs text-slate-400">{c.expiry}</p>
              </div>
              {c.isDefault && <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-primary">Varsayılan</span>}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400">HESABIM</p>
          <div className="mt-2 divide-y divide-slate-100">
            <Link to="/adreslerim" className="flex items-center gap-3 py-3.5 text-sm font-medium text-slate-700 hover:text-slate-900">
              <MapPin size={16} className="text-slate-400" /> <span className="flex-1">Adreslerim</span> <ChevronRight size={15} className="text-slate-300" />
            </Link>
            <Link to="/siparislerim" className="flex items-center gap-3 py-3.5 text-sm font-medium text-slate-700 hover:text-slate-900">
              <Truck size={16} className="text-slate-400" /> <span className="flex-1">Siparişlerim</span> <ChevronRight size={15} className="text-slate-300" />
            </Link>
            <div className="flex items-center gap-3 py-3.5 text-sm font-medium text-slate-700">
              <Globe size={16} className="text-slate-400" /> <span className="flex-1">Dil</span> <span className="text-slate-400">{data.language}</span>
            </div>
          </div>
        </div>

        <button className="mt-6 flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
          <LogOut size={15} /> Çıkış yap
        </button>
      </div>
    </div>
  )
}
