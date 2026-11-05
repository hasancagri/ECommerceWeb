import { Link } from 'react-router'
import { ArrowLeft, KeyRound } from 'lucide-react'

export default function ForgotPassword() {
  return (
    <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/70">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
        <KeyRound size={22} />
      </span>
      <p className="mt-6 text-[11px] font-semibold tracking-wider text-slate-400">ADIM 1 / 3</p>
      <h1 className="mt-1.5 text-2xl font-bold">Şifreni mi unuttun?</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">E-posta adresini gir; şifreni yeniden belirlemen için bir bağlantı gönderelim.</p>

      <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="text-sm font-medium text-slate-700">E-posta</label>
          <input className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary" placeholder="ornek@eposta.com" />
        </div>
        <button className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark">Sıfırlama bağlantısı gönder</button>
      </form>

      <Link to="/giris" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-primary">
        <ArrowLeft size={14} /> Giriş'e dön
      </Link>
    </div>
  )
}
