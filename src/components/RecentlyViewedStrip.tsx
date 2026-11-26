import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Clock } from 'lucide-react'
import { useAuthSession } from '../auth/useAuthSession'
import { getRecentlyViewed, type RecentlyViewedItem } from '../api/library'
import { slugify } from '../api/catalog'

// Son Gezdiğim Kitaplar: ana sayfa alt şeridi (Kitapyurdu gibi). Login-kapılı — anonim/yükleniyor/boş/
// hata → render YOK (sessiz, sayfa bozulmaz; PersonalShelf deseni). En yeni 20, yatay kapaklı kartlar.
export function RecentlyViewedStrip() {
  const { isAuthenticated, isLoading, accessToken } = useAuthSession()
  const [items, setItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setItems([])
      return
    }
    let cancelled = false
    getRecentlyViewed(accessToken)
      .then((r) => { if (!cancelled) setItems(r) })
      .catch(() => { if (!cancelled) setItems([]) })
    return () => { cancelled = true }
  }, [isAuthenticated, accessToken])

  if (!isAuthenticated || isLoading || items.length === 0) return null

  return (
    <section className="mt-12 w-full">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-primary" />
        <h2 className="text-lg font-semibold tracking-tight">Son Gezdiğim Kitaplar</h2>
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {items.map((b) => (
          <Link
            key={b.productId}
            to={`/kitap/${slugify(b.title)}-${b.isbn}`}
            className="flex w-28 shrink-0 flex-col gap-2"
          >
            <div className="aspect-[2/3] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {b.coverUrl && <img src={b.coverUrl} alt={b.title} className="h-full w-full object-cover" />}
            </div>
            <span className="line-clamp-2 text-xs font-medium text-slate-700">{b.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
