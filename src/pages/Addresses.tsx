import { Plus, Trash2 } from 'lucide-react'
import { Crumb } from '../components/ui'
import data from '../mocks/addresses.json'

export default function Addresses() {
  return (
    <div>
      <Crumb items={[{ label: 'Ayarlar', to: '/hesap' }, { label: 'Adreslerim' }]} />
      <div className="mx-auto max-w-4xl px-8 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Adreslerim</h1>
            <p className="mt-1 text-slate-500">{data.intro}</p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
            <Plus size={15} /> Yeni adres ekle
          </button>
        </div>

        <div className="mt-7 space-y-4">
          {data.items.map((a) => (
            <div key={a.name} className={`flex items-center gap-4 rounded-2xl border-2 bg-white p-5 ${a.isDefault ? 'border-primary' : 'border-slate-200'}`}>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-bold">
                  {a.name}
                  {a.isDefault && <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-primary">Varsayılan</span>}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">{a.person}</p>
                <p className="text-sm text-slate-500">{a.line}</p>
                <p className="text-sm text-slate-400">{a.phone}</p>
              </div>
              <div className="flex gap-2">
                {!a.isDefault && (
                  <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-primary hover:bg-blue-50">Varsayılan yap</button>
                )}
                <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Düzenle</button>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-slate-400 hover:bg-slate-50"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
