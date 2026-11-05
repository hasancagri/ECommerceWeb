import { Link, Outlet } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '../components/ui'

export default function AuthLayout() {
  return (
    <div className="min-h-screen">
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5">
        <Logo />
        <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft size={15} /> Keşfetmeye göz at
        </Link>
      </header>
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  )
}
