import {useEffect} from 'react'
import {useNavigate} from 'react-router'
import {useAuth} from 'react-oidc-context'
import {RETURN_URL_KEY} from '../auth/authConfig'

// OIDC dönüş sayfası. Doğrudan/yeniden ziyarette (aktif signin yokken) ana sayfaya düşer.
export default function AuthCallback() {
    const auth = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (auth.isLoading) return
        const target = sessionStorage.getItem(RETURN_URL_KEY) ?? '/'
        sessionStorage.removeItem(RETURN_URL_KEY)
        navigate(auth.isAuthenticated ? target : '/', {replace: true})
    }, [auth.isLoading, auth.isAuthenticated, navigate])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-slate-500">Giriş tamamlanıyor…</p>
        </div>
    )
}
