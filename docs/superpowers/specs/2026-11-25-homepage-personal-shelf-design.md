# Ana Sayfa "Sana Özel" Rafı — Kısa Tasarım

Tarih: 2026-11-25 · Repo: ECommerceWeb (frontend-only; backend `/feed` hazır)

## Niyet / neden
Login kullanıcı ana sayfayı (`/` → `DiscoverWelcome`) açınca, aramadan önce zevkine
göre 12 kitap görür — YouTube ana sayfası mantığı. Kuzey yıldızı: platform kullanıcıyı
tanısın. Backend motoru (028) hazır; eksik olan tek şey React yüzeyi.

## Kapsam (yaklaşım A + örnek kartların üstü)
- **Anonim:** sayfa aynen kalır (hero + örnek kartlar + arama kutusu). Feed çağrısı YOK.
- **Login:** hero'nun altına, "Bir örnekle başla" kartlarının **üstüne** "Sana Özel" rafı
  (12 kart gridi).

## Davranış
- Mount'ta, login ise `GET /api/chat/v1/feed` (bearer). Anonim → hiç çağrılmaz.
- Yükleniyor → iskelet. Boş/hata → raf hiç çizilmez (sayfa bozulmaz, sessiz).
- Backend metnini raf başlığı altına koy (cold: "aradıkça özelleşecek" / sıcak:
  "zevkine göre seçtim").
- Kart tıklanınca kitap detayı (`/kitap/:slug`) — arama kartıyla aynı yol.
- **Deterministik** (bu dilim): düz F5 aynı 12'yi getirir; değişim yalnız kullanıcının
  taste'i değişince (yeni arama). Refresh-varyasyonu bilinçli ertelendi → sonraki dilim.

## Yaklaşımlar
Tek mantıklı yol: var olan `/feed` ucunu var olan karta bağla. Alternatifler elendi —
anonim küratörlü raf (B) backend değişikliği ister, bu dilimde istenmedi; yeni kart UI
icat etmek gereksiz (arama kartı aynı şekli taşıyor).

## Kararlar (minor — benim çağrım)
1. `BookCard` + `normalizeBook` + `ToolBook` tipini `ChatWorkspace.tsx`'ten ayrı
   `components/BookCard.tsx`'e taşı; iki sayfa import etsin (kopya değil — casing
   normalize + isbn-from-cover mantığı az-değil).
2. `src/api/chat.ts`'e `getFeed(token)` ekle (mevcut `request<T>` + `ChatReply` deseni).
3. Grid: arama sonuçlarıyla aynı stil; `useAuthSession` ile login + token.

## Non-goal
- Arama sonucuna zevk karıştırma (re-rank) — ayrı dilim.
- Anonim küratörlü raf (B).
- Satın/yorum/tık sinyalleri, K-Means, kişiselleştirme-duraklat — ayrı dilimler.

## Builder'a kalan
Raf başlık/boşluk tasarımı, iskelet görünümü, grid responsive kolonları.
