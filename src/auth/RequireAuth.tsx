import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useAuthSession } from './useAuthSession'

// Korumalı rota kapısı: girişsizse login akışını tetikler, hedef rotayı saklar —
// callback dönüşünde kullanıcı gitmek istediği sayfaya düşer.
export default function RequireAuth() {
  const { isAuthenticated, isLoading, login } = useAuthSession()
  const { pathname, search } = useLocation()
  const started = useRef(false)

  useEffect(() => {
    if (isLoading || isAuthenticated || started.current) return
    started.current = true
    login(pathname + search)
  }, [isLoading, isAuthenticated, login, pathname, search])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-slate-500">Giriş sayfasına yönlendiriliyorsun…</p>
      </div>
    )
  }

  return <Outlet />
}
