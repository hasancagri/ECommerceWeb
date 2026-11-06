import { useAuth } from 'react-oidc-context'
import { RETURN_URL_KEY } from './authConfig'

// Sayfaların tek auth kapısı — provider/kütüphane detayı buradan dışarı sızmaz.
export function useAuthSession() {
  const auth = useAuth()

  const displayName =
    (auth.user?.profile.name as string | undefined) ??
    (auth.user?.profile.email as string | undefined) ??
    ''

  function login(returnUrl?: string) {
    if (returnUrl) sessionStorage.setItem(RETURN_URL_KEY, returnUrl)
    void auth.signinRedirect()
  }

  function logout() {
    void auth.signoutRedirect()
  }

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    displayName,
    accessToken: auth.user?.access_token,
    login,
    logout,
  }
}
