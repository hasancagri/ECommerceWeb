import { Link } from 'react-router'
import {
  ArrowLeft, Sparkles, Star, Quote, CalendarCheck, Check, Lock, Bell, Eye,
  ChevronRight, ArrowUp, ArrowRight, MessageSquare,
} from 'lucide-react'
import { Pill, Stars } from '../components/ui'
import book from '../mocks/book-1984.json'

export default function BookDetail() {
  return (
    <div>
      <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-8 py-3 text-sm">
        <Link to="/sohbet" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
          <ArrowLeft size={14} /> Keşif konsoluna dön
        </Link>
      </div>
      <div className="flex items-center gap-2 px-8 py-4 text-sm text-slate-400">
        <span>AI Kürasyonu</span><span className="text-slate-300">/</span>
        <span>George Orwell — 1984</span><span className="text-slate-300">/</span>
        <span className="font-medium text-slate-700">Fikir Özeti & Argüman Analizi</span>
      </div>

      <div className="grid grid-cols-1 gap-6 px-8 pb-12 xl:grid-cols-[1fr_340px]">
        {/* Sol kolon */}
        <div className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-medium text-emerald-700">
              <Sparkles size={12} /> {book.matchBanner}
            </span>
            <div className="mt-3 flex gap-2">
              {book.tags.map((t) => <Pill key={t} tone="blue">{t}</Pill>)}
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">{book.title}</h1>
            <p className="mt-2 text-slate-500">{book.byline}</p>
            <p className="mt-2 flex items-center gap-2 text-sm">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              <span className="font-bold">{book.rating.toFixed(1)}</span>
              <span className="text-slate-400">({book.ratingCount}) · {book.pages} sayfa</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Quote size={14} /> Felsefi çapa & temel önerme</p>
            <p className="mt-3 italic leading-relaxed text-slate-700">{book.anchor}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400">KÜNYE</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
              {book.kunye.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-400">{k}</dt>
                  <dd className="font-semibold text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <CalendarCheck size={15} className="text-slate-400" />
              Bu üründen <b>201.805</b> adet satın alındı.
            </p>
            <p className="mt-4 text-[11px] font-semibold tracking-wider text-slate-400">İLGİLİ KATEGORİLER</p>
            <div className="mt-2 flex gap-2">
              {book.categories.map((c) => <Pill key={c}>{c}</Pill>)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-wider text-slate-400">SERİ & OKUMA SIRASI</p>
              <span className="text-sm font-medium text-slate-500">{book.series.name}</span>
            </div>
            <div className="mt-4 space-y-4">
              {book.series.items.map((s) => (
                <div key={s.no} className="flex items-start gap-3">
                  {s.done ? (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={14} /></span>
                  ) : (
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${s.current ? 'bg-blue-100 text-primary' : 'bg-slate-100 text-slate-400'}`}>{s.no}</span>
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${s.current ? 'text-primary' : 'text-slate-800'}`}>
                      {s.title}
                      {s.current && <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-primary">şu an buradasın</span>}
                    </p>
                    <p className="text-xs text-slate-400">{s.state}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/sohbet" className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary">Detaya git <ArrowRight size={13} /></Link>
            <p className="mt-3 text-xs text-slate-400">{book.series.note}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {book.metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-semibold tracking-wider text-slate-400">{m.label}</p>
                <p className="mt-1.5 text-sm font-bold leading-snug">{m.value}</p>
                <p className="mt-0.5 text-xs text-slate-400">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400">BAĞLI EKOLLER & KAVRAMLAR</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {book.concepts.map((c) => <Pill key={c}>{c}</Pill>)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-wider text-slate-400">FİYAT GEÇMİŞİ · SON 6 AY</p>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <Sparkles size={11} /> {book.priceHistory.badge}
              </span>
            </div>
            <div className="mt-6 flex h-36 items-end gap-6 px-2">
              {book.priceHistory.values.map((v, i) => {
                const max = Math.max(...book.priceHistory.values)
                const last = i === book.priceHistory.values.length - 1
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-xs text-slate-400">{v.toLocaleString('tr-TR', { minimumFractionDigits: v % 1 ? 2 : 0 })}</span>
                    <div className={`w-9 rounded-md ${last ? 'bg-emerald-500' : 'bg-slate-200'}`} style={{ height: `${(v / max) * 100}px` }} />
                    <span className="text-xs text-slate-400">{book.priceHistory.months[i]}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
              <span className="text-slate-500">En düşük <b className="text-slate-800">{book.priceHistory.low}</b> · En yüksek <b className="text-slate-800">{book.priceHistory.high}</b></span>
              <span className="font-bold">Şu an {book.priceHistory.current}</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{book.priceHistory.source}</p>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary"><Lock size={20} /></span>
            <p className="mt-4 font-bold">{book.argumentCore.title}</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">{book.argumentCore.text}</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link to="/giris" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">Giriş yap</Link>
              <Link to="/giris" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Kayıt ol</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800"><MessageSquare size={15} className="text-primary" /> {book.consensus.title}</p>
              <span className="text-xs text-slate-400">{book.consensus.badge}</span>
            </div>
            <p className="mt-3 leading-relaxed text-slate-700">{book.consensus.text}</p>
            <div className="mt-3 flex gap-2">
              {book.consensus.chips.map((c) => <Pill key={c} tone="blue">{c}</Pill>)}
            </div>
            <div className="mt-5 space-y-3">
              {book.consensus.bars.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{b.label}</span>
                    <span className={`font-semibold ${b.tone === 'orange' ? 'text-orange-600' : 'text-primary'}`}>%{b.value} olumlu</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full ${b.tone === 'orange' ? 'bg-orange-500' : 'bg-primary'}`} style={{ width: `${b.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">{book.consensus.note}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-3 font-bold">
                Okur yorumları
                <span className="flex items-center gap-1.5 text-sm font-normal text-slate-500">
                  <Star size={14} className="fill-amber-400 text-amber-400" /> <b>5.0</b> · 19.494 değerlendirme · 8.388 yorum
                </span>
              </p>
              <button className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700">Yorum yaz</button>
            </div>
            <div className="mt-5 space-y-5">
              {book.reviews.map((r) => (
                <div key={r.initials} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{r.initials}</span>
                  <div>
                    <p className="text-sm font-semibold">{r.name} <span className="ml-1 font-normal text-slate-400">{r.date}</span></p>
                    <Stars value={r.stars} size={12} />
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="#" className="mt-5 flex items-center gap-1 text-sm font-semibold text-primary">{book.reviewTotal} <ArrowRight size={13} /></Link>
          </div>
        </div>

        {/* Sağ kolon */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{book.price}</span>
              <span className="text-sm text-slate-400 line-through">{book.oldPrice}</span>
              <span className="text-sm font-bold text-orange-600">{book.discount}</span>
            </p>
            <p className="mt-3 flex items-center justify-between rounded-xl bg-orange-50 px-4 py-2.5 text-sm">
              <span className="flex items-center gap-2 font-medium text-orange-800"><Star size={14} className="fill-orange-400 text-orange-400" /> Kazanacağın puan</span>
              <b className="text-orange-800">{book.points}</b>
            </p>
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> {book.stock}
            </p>
            <Link to="/giris" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
              <Lock size={14} /> Sepete eklemek için giriş yap
            </Link>
            <p className="mt-2 text-center text-xs text-slate-400">Sepet ve satın alma üyelere özeldir.</p>
            <Link to="/giris" className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Bell size={14} /> Fiyat alarmı & stok bildirimi için giriş yap
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold"><MessageSquare size={14} className="text-primary" /> {book.askPanel.title}</p>
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-primary"><Lock size={10} /> Bağlam kilitli</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{book.askPanel.sub}</p>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
              <span className="flex items-center gap-2 text-xs text-slate-600"><Eye size={13} /> {book.askPanel.spoiler}</span>
              <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-300"><span className="ml-0.5 inline-block h-4 w-4 rounded-full bg-white shadow" /></span>
            </div>
            <div className="mt-3 space-y-2">
              {book.askPanel.questions.map((q) => (
                <button key={q} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
                  {q} <ChevronRight size={14} className="text-slate-300" />
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-full border border-slate-200 py-1.5 pl-4 pr-1.5">
              <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="1984 hakkında bir şey sor…" />
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"><ArrowUp size={15} /></button>
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400"><Lock size={10} className="mt-0.5 shrink-0" /> {book.askPanel.note}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold">{book.similar.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{book.similar.sub}</p>
            <div className="mt-3 space-y-2">
              {book.similar.axes.map((a) => (
                <button key={a} className="flex w-full items-center rounded-xl border border-slate-200 px-3.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">{a}</button>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{book.similar.note}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold">Takip et</p>
            <p className="mt-1 text-xs text-slate-400">Yeni kitap ya da yeni baskı çıkınca Kâşif haber versin.</p>
            <Link to="/giris" className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
              <Lock size={13} /> Yazar, yayınevi ve seri takibi için <span className="font-semibold text-primary">giriş yap</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
