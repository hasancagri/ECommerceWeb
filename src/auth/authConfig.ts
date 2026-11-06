import { WebStorageStateStore } from 'oidc-client-ts'
import type { AuthProviderProps } from 'react-oidc-context'

// Identity.Server (ECommerceAgent, Aspire) — seed'li public PKCE istemcisi `react-web`.
// Scope DAR demet: API scope'ları ihtiyaç doğdukça eklenir (sepet dilimi `basket.*` getirecek).
// Oturum sessionStorage'da: sekme kapanınca token ölür; refresh token'ı localStorage'a
// yaymamak bilinçli tercih (XSS yüzeyini küçültür), F5 kalıcılığına yeter.
export const oidcConfig: AuthProviderProps = {
  authority: 'https://localhost:5001',
  client_id: 'react-web',
  redirect_uri: 'http://localhost:5173/callback',
  post_logout_redirect_uri: 'http://localhost:5173/',
  scope: 'openid profile email roles offline_access',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  // callback URL'inden state/code paramlarını temizle
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname)
  },
}

// Giriş sonrası dönülecek rota (korumalı sayfa yönlendirmesi saklar, callback okur)
export const RETURN_URL_KEY = 'auth:returnUrl'
