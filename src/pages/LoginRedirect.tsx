import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useAuthSession } from '../auth/useAuthSession'

// /giris rotası: mock login ekranı yerine merkezi kimlik sayfasına yönlendirir.
// Mevcut <Link to="/giris"> kabloları böylece değişmeden gerçek akışa bağlanır.
export default function LoginRedirect() {
  const { isAuthenticated, isLoading, login } = useAuthSession()
  const navigate = useNavigate()
  const started = useRef(false)

  useEffect(() => {
    if (isLoading || started.current) return
    if (isAuthenticated) {
      navigate('/', { replace: true })
      return
    }
    started.current = true
    login()
  }, [isLoading, isAuthenticated, navigate, login])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-slate-500">Giriş sayfasına yönlendiriliyorsun…</p>
    </div>
  )
}
