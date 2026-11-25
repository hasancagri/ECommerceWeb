import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import {
  MessageSquare, Book, NotebookPen, Layers, Quote, BarChart3,
  Sparkles, Bell, Heart, Truck, MapPin, Settings, ShoppingCart, Lock, LogOut,
  Menu, X, ChevronDown,
} from 'lucide-react'
import { Logo } from '../components/ui'
import ConversationSidebar from '../components/ConversationSidebar'
import VoiceAsk from '../components/VoiceAsk'
import { useAuthSession } from '../auth/useAuthSession'

const assistantNav = [
  { to: '/sohbet', label: 'Aktif Sohbet & Tavsiyeler', icon: MessageSquare },
]

// KİŞİSEL ALAN klasörü — okur kimliği (kullanıcının ürettiği/biriktirdiği). Collapse edilebilir grup.
const personalNav = [
  { to: '/kitapligim', label: 'Kişisel Kitaplığım', icon: Book, locked: true },
  { to: '/okuma-gunlugum', label: 'Okuma Günlüğüm', icon: NotebookPen, locked: true },
  { to: '/raflarim', label: 'Raflarım', icon: Layers, locked: true },
  { to: '/alintilarim', label: 'Alıntılarım', icon: Quote, locked: true },
  { to: '/okuma-profilim', label: 'Okuma Profilim', icon: BarChart3, locked: true },
]

// HESABIM — işlemsel/hesap (kimlik değil). Haftalık Seçki küratörlü keşif, burada.
const accountNav = [
  { to: '/haftalik-secki', label: 'Haftalık Seçki', icon: Sparkles, locked: true },
  { to: '/fiyat-alarmlari', label: 'Fiyat Alarmları', icon: Bell, locked: true },
  { to: '/takiplerim', label: 'Takiplerim', icon: Heart, locked: true },
  { to: '/siparislerim', label: 'Siparişlerim', icon: Truck, locked: true },
  { to: '/adreslerim', label: 'Adreslerim', icon: MapPin, locked: true },
  { to: '/hesap', label: 'Hesap & Ayarlar', icon: Settings, locked: true },
]

function NavItem({ to, label, icon: Icon, badge, guest, locked, onNavigate }: {
  to: string; label: string; icon: typeof Book; badge?: number; guest: boolean; locked?: boolean
  onNavigate?: () => void
}) {
  const disabled = guest && locked
  return (
    <NavLink
      to={disabled ? '/giris' : to}
      onClick={onNavigate}
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [personalOpen, setPersonalOpen] = useState(true)   // KİŞİSEL ALAN klasörü — varsayılan açık
  const location = useLocation()

  // Rota değişince mobil drawer'ı kapat (nav tıklaması sayfayı değiştirince içerik görünsün).
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const closeDrawer = () => setDrawerOpen(false)

  // Sidebar içeriği — masaüstü statik aside + mobil drawer AYNI içeriği paylaşır (tek kaynak).
  const sidebarContent = (
    <>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400">DOĞAL DİL ASİSTANI</p>
        {assistantNav.map((it) => <NavItem key={it.to} {...it} guest={guest} onNavigate={closeDrawer} />)}

        {/* Kalıcı sohbet listesi — her rotada görünür (T011). */}
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400">SOHBETLER</p>
          <ConversationSidebar />
        </div>

        <button
          type="button"
          onClick={() => setPersonalOpen((o) => !o)}
          className="mt-6 flex w-full items-center justify-between px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 hover:text-slate-600"
          aria-expanded={personalOpen}
        >
          <span>{guest ? 'KİŞİSEL ALAN · ÜYELERE ÖZEL' : 'KİŞİSEL ALAN'}</span>
          <ChevronDown size={14} className={`transition-transform ${personalOpen ? '' : '-rotate-90'}`} />
        </button>
        {personalOpen && personalNav.map((it) => <NavItem key={it.to} {...it} guest={guest} onNavigate={closeDrawer} />)}

        <p className="px-3 pb-2 pt-6 text-[11px] font-semibold tracking-wider text-slate-400">HESABIM</p>
        {accountNav.map((it) => <NavItem key={it.to} {...it} guest={guest} onNavigate={closeDrawer} />)}
      </nav>

      {guest ? (
        <div className="m-3 rounded-2xl bg-blue-50 p-4">
          <p className="text-sm font-semibold text-slate-800">Misafir olarak keşfediyorsun</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">Üye ol; fiyat alarmları, argüman analizi ve sohbet geçmişi senin olsun.</p>
          <div className="mt-3 flex gap-2">
            <Link to="/giris" onClick={closeDrawer} className="flex-1 rounded-xl bg-primary px-3 py-2 text-center text-xs font-semibold text-white">Kayıt ol</Link>
            <Link to="/giris" onClick={closeDrawer} className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700">Giriş</Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">{initials || '•'}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> AI Asistan Bağlı
            </p>
          </div>
          <Link to="/hesap" onClick={closeDrawer} className="text-slate-400 hover:text-slate-600"><Settings size={17} /></Link>
        </div>
      )}
    </>
  )

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menüyü aç"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <Logo />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 020-voice: sesle soru — her müşteri sayfasından (giriş/admin layout'ta mount edilmez). */}
          <VoiceAsk />
          <Link to="/sepet" className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50">
            <ShoppingCart size={18} />
          </Link>
          <span className="hidden h-6 w-px bg-slate-200 sm:block" />
          {guest ? (
            <>
              <Link to="/giris" className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-block">Giriş yap</Link>
              <Link to="/giris" className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark sm:px-4">Kayıt ol</Link>
            </>
          ) : (
            <>
              <span className="hidden text-sm font-medium text-slate-700 sm:inline">{displayName}</span>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:px-4"
              >
                <LogOut size={15} /> <span className="hidden sm:inline">Çıkış</span>
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex">
        {/* Masaüstü: statik sidebar (lg ve üstü). */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[270px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          {sidebarContent}
        </aside>

        {/* Mobil/tablet: off-canvas drawer + backdrop (lg altı). */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40" onClick={closeDrawer} aria-hidden />
            <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-[300px] flex-col border-r border-slate-200 bg-white shadow-xl">
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
                <Logo />
                <button type="button" onClick={closeDrawer} aria-label="Menüyü kapat" className="rounded-xl p-2 text-slate-500 hover:bg-slate-50">
                  <X size={18} />
                </button>
              </div>
              {sidebarContent}
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
