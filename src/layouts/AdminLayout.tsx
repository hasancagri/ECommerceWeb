import { Link, NavLink, Outlet } from 'react-router'
import {
  LayoutGrid, LineChart, Star, Database, ShieldCheck, Truck, ArrowLeft,
} from 'lucide-react'
import { Logo } from '../components/ui'

const panelNav = [
  { to: '/yonetim', label: 'Pano', icon: LayoutGrid, end: true },
  { to: '/yonetim/sorgular', label: 'Karşılıksız Sorgular', icon: LineChart },
  { to: '/yonetim/kurator', label: 'Küratör Paneli', icon: Star, badge: 5 },
  { to: '/yonetim/veri-kalitesi', label: 'Veri Kalitesi', icon: Database, badge: 214 },
  { to: '/yonetim/moderasyon', label: 'Moderasyon', icon: ShieldCheck, badge: 8 },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-slate-900 px-5">
        <div className="flex items-center gap-3">
          <Logo dark />
          <span className="rounded-md bg-slate-700/60 px-2 py-1 text-[11px] font-semibold tracking-wider text-slate-200">YÖNETİM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white">
            <ArrowLeft size={15} /> Mağazaya dön
          </Link>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">ÇD</span>
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-white">Çağrı D.</p>
            <p className="text-[11px] text-slate-400">Site sahibi</p>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 flex h-[calc(100vh-3.5rem)] w-[260px] shrink-0 flex-col bg-slate-900">
          <nav className="flex-1 px-3 py-5">
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500">PANEL</p>
            {panelNav.map(({ to, label, icon: Icon, badge, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive ? 'bg-blue-600 font-semibold text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}>
                <Icon size={17} />
                <span className="flex-1">{label}</span>
                {badge !== undefined && (
                  <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs font-semibold text-white">{badge}</span>
                )}
              </NavLink>
            ))}
            <p className="px-3 pb-2 pt-6 text-[11px] font-semibold tracking-wider text-slate-500">OPERASYON</p>
            <NavLink to="/yonetim/siparisler"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive ? 'bg-blue-600 font-semibold text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}>
              <Truck size={17} />
              <span className="flex-1">Siparişler & İade</span>
              <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs font-semibold text-white">3</span>
            </NavLink>
          </nav>
          <p className="flex items-center gap-2 border-t border-slate-800 px-5 py-4 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> AI motorları çalışıyor · MCP bağlı
          </p>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
