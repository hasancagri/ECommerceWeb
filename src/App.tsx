import { Route, Routes } from 'react-router'
import PublicLayout from './layouts/PublicLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'
import DiscoverWelcome from './pages/DiscoverWelcome'
import ChatWorkspace from './pages/ChatWorkspace'
import BookDetail from './pages/BookDetail'
import PriceAlarms from './pages/PriceAlarms'
import Follows from './pages/Follows'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Library from './pages/Library'
import ReadingProfile from './pages/ReadingProfile'
import Quotes from './pages/Quotes'
import Journal from './pages/Journal'
import Shelves from './pages/Shelves'
import WeeklyPicks from './pages/WeeklyPicks'
import Addresses from './pages/Addresses'
import AccountSettings from './pages/AccountSettings'
import LoginRedirect from './pages/LoginRedirect'
import AuthCallback from './pages/AuthCallback'
import RequireAuth from './auth/RequireAuth'
import ForgotPassword from './pages/ForgotPassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminQueries from './pages/admin/AdminQueries'
import AdminCurator from './pages/admin/AdminCurator'
import AdminDataQuality from './pages/admin/AdminDataQuality'
import AdminModeration from './pages/admin/AdminModeration'
import AdminOrders from './pages/admin/AdminOrders'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<DiscoverWelcome />} />
        <Route path="/sohbet" element={<ChatWorkspace />} />
        <Route path="/kitap/:slug" element={<BookDetail />} />
        <Route path="/sepet" element={<Cart />} />
        {/* Üyelere özel alanlar — girişsiz erişim login akışına yönlenir, dönüşte hedefe gelir. */}
        <Route element={<RequireAuth />}>
          <Route path="/fiyat-alarmlari" element={<PriceAlarms />} />
          <Route path="/takiplerim" element={<Follows />} />
          <Route path="/odeme" element={<Checkout />} />
          <Route path="/siparislerim" element={<OrderConfirmation />} />
          <Route path="/kitapligim" element={<Library />} />
          <Route path="/okuma-profilim" element={<ReadingProfile />} />
          <Route path="/alintilarim" element={<Quotes />} />
          <Route path="/okuma-gunlugum" element={<Journal />} />
          <Route path="/raflarim" element={<Shelves />} />
          <Route path="/haftalik-secki" element={<WeeklyPicks />} />
          <Route path="/adreslerim" element={<Addresses />} />
          <Route path="/hesap" element={<AccountSettings />} />
        </Route>
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/giris" element={<LoginRedirect />} />
        <Route path="/sifremi-unuttum" element={<ForgotPassword />} />
      </Route>
      <Route path="/callback" element={<AuthCallback />} />
      <Route element={<AdminLayout />}>
        <Route path="/yonetim" element={<AdminDashboard />} />
        <Route path="/yonetim/sorgular" element={<AdminQueries />} />
        <Route path="/yonetim/kurator" element={<AdminCurator />} />
        <Route path="/yonetim/veri-kalitesi" element={<AdminDataQuality />} />
        <Route path="/yonetim/moderasyon" element={<AdminModeration />} />
        <Route path="/yonetim/siparisler" element={<AdminOrders />} />
      </Route>
    </Routes>
  )
}
