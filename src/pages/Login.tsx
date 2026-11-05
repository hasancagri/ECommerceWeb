import { Link } from 'react-router'
import { Check, Lock } from 'lucide-react'
import { Logo, Toggle } from '../components/ui'

const perks = [
  { title: 'AI Argüman Çekirdeği', desc: 'Her kitabın lehinde ve aleyhinde yapay zekâ analizi.' },
  { title: 'Fiyat & stok alarmları', desc: 'Hedef fiyata düşünce ya da stoğa girince haber al.' },
  { title: 'Sohbet geçmişin', desc: 'Önceki keşiflerine dön, kaldığın yerden sürdür.' },
  { title: 'Kişisel okuma metrikleri', desc: 'Tempona ve bitirme oranına göre öneriler.' },
]

export default function Login() {
  return (
    <div className="flex w-full max-w-4xl overflow-hidden rounded-3xl shadow-xl shadow-slate-200/70">
      <div className="hidden w-[46%] flex-col bg-primary p-9 text-white md:flex">
        <Logo dark />
        <h1 className="mt-8 text-3xl font-bold leading-tight">Keşfet, sohbet et, takip et.</h1>
        <p className="mt-4 text-sm leading-relaxed text-blue-100">
          Kâşif, binlerce kitabı listeler ve filtreler yerine doğal dille sohbet ederek keşfettiğin bir asistan.
          Üyelik, keşfini kişisel kılan katmanları açar.
        </p>
        <div className="mt-7 flex-1 space-y-4">
          {perks.map((p) => (
            <div key={p.title} className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/20"><Check size={12} /></span>
              <div>
                <p className="text-sm font-bold">{p.title}</p>
                <p className="text-xs text-blue-100">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-blue-200">
          <Lock size={11} className="mt-0.5 shrink-0" /> Keşif ve sohbet herkese açık — üyelik yalnızca takip ve kişisel analizler için.
        </p>
      </div>

      <div className="flex-1 bg-white p-9">
        <div className="flex w-fit rounded-xl bg-slate-100 p-1 text-sm">
          <button className="rounded-lg bg-white px-5 py-1.5 font-semibold shadow-sm">Giriş yap</button>
          <button className="px-5 py-1.5 text-slate-500">Kayıt ol</button>
        </div>
        <h2 className="mt-6 text-2xl font-bold">Tekrar hoş geldin</h2>
        <p className="mt-1 text-sm text-slate-500">Takip ettiğin kitaplara ve sohbet geçmişine eriş.</p>

        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-sm font-medium text-slate-700">E-posta</label>
            <input className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary" placeholder="ornek@eposta.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Şifre</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 pr-4 focus-within:border-primary">
              <input type="password" className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-slate-400" placeholder="Şifreni gir" />
              <button type="button" className="text-sm font-medium text-primary">Göster</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5 text-sm text-slate-600"><Toggle on /> Beni hatırla</span>
            <Link to="/sifremi-unuttum" className="text-sm font-medium text-primary">Şifremi unuttum?</Link>
          </div>
          <button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark">Giriş yap</button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> ya da <span className="h-px flex-1 bg-slate-200" />
        </div>
        <button className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z"/></svg>
          Google ile devam et
        </button>
        <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">
          Sorgulama ve keşif üyeliksiz de kullanılabilir; Kâşif hiçbir ekranda işlem/satın alma yaptırmaz.
        </p>
      </div>
    </div>
  )
}
