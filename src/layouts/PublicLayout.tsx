import { Link, NavLink, Outlet } from 'react-router'
import {
  MessageSquare, History, Book, NotebookPen, Layers, Quote, BarChart3,
  Sparkles, Bell, Heart, Truck, MapPin, Settings, ShoppingCart, Lock, LogOut,
} from 'lucide-react'
import { Logo } from '../components/ui'
import { useAuthSession } from '../auth/useAuthSession'

const assistantNav = [
  { to: '/sohbet', label: 'Aktif Sohbet & Tavsiyeler', icon: MessageSquare },
  { to: '/sohbet-gecmisi', label: 'Sohbet Geçmişi', icon: History, locked: true },
]

const personalNav = [
  { to: '/kitapligim', label: 'Kişisel Kitaplığım', icon: Book, locked: true },
  { to: '/okuma-gunlugum', label: 'Okuma Günlüğüm', icon: NotebookPen, locked: true },
  { to: '/raflarim', label: 'Raflarım', icon: Layers, locked: true },
  { to: '/alintilarim', label: 'Alıntılarım', icon: Quote, locked: true },
  { to: '/okuma-profilim', label: 'Okuma Profilim', icon: BarChart3, locked: true },
  { to: '/haftalik-secki', label: 'Haftalık Seçki', icon: Sparkles, locked: true },
  { to: '/fiyat-alarmlari', label: 'Fiyat Alarmları', icon: Bell, badge: 2, locked: true },
  { to: '/takiplerim', label: 'Takiplerim', icon: Heart, badge: 4, locked: true },
  { to: '/siparislerim', label: 'Siparişlerim', icon: Truck, locked: true },
  { to: '/adreslerim', label: 'Adreslerim', icon: MapPin, locked: true },
  { to: '/hesap', label: 'Hesap & Ayarlar', icon: Settings, locked: true },
]

function NavItem({ to, label, icon: Icon, badge, guest, locked }: {
  to: string; label: string; icon: typeof Book; badge?: number; guest: boolean; locked?: boolean
}) {
  const disabled = guest && locked
  return (
    <NavLink
      to={disabled ? '/giris' : to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
          isActive && !disabled
            ? 'bg-blue-50 font-semibold text-primary'
            : disabled
              ? 'text-slate-400'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      <Icon size={17} />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && !disabled && (
        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">{badge}</span>
      )}
      {disabled && <Lock size={13} />}
    </NavLink>
  )
}

export default function PublicLayout() {
  const { isAuthenticated, displayName, logout } = useAuthSession()
  const guest = !isAuthenticated
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
        <Logo />
        <div className="flex items-center gap-3">
          <Link to="/sepet" className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50">
            <ShoppingCart size={18} />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">3</span>
          </Link>
          <span className="h-6 w-px bg-slate-200" />
          {guest ? (
            <>
              <Link to="/giris" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Giriş yap</Link>
              <Link to="/giris" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Kayıt ol</Link>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-slate-700">{displayName}</span>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <LogOut size={15} /> Çıkış
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-[270px] shrink-0 flex-col border-r border-slate-200 bg-white">
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400">DOĞAL DİL ASİSTANI</p>
            {assistantNav.map((it) => <NavItem key={it.to} {...it} guest={guest} />)}
            <p className="px-3 pb-2 pt-6 text-[11px] font-semibold tracking-wider text-slate-400">
              {guest ? 'KİŞİSEL ALAN · ÜYELERE ÖZEL' : 'KİŞİSEL ALAN'}
            </p>
            {personalNav.map((it) => <NavItem key={it.to} {...it} guest={guest} />)}
          </nav>

          {guest ? (
            <div className="m-3 rounded-2xl bg-blue-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Misafir olarak keşfediyorsun</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Üye ol; fiyat alarmları, argüman analizi ve sohbet geçmişi senin olsun.</p>
              <div className="mt-3 flex gap-2">
                <Link to="/giris" className="flex-1 rounded-xl bg-primary px-3 py-2 text-center text-xs font-semibold text-white">Kayıt ol</Link>
                <Link to="/giris" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700">Giriş</Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">{initials || '•'}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{displayName}</p>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> AI Asistan Bağlı
                </p>
              </div>
              <Link to="/hesap" className="text-slate-400 hover:text-slate-600"><Settings size={17} /></Link>
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
