# Ana Sayfa "Sana Özel" Rafı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Login kullanıcının ana sayfasına, aramadan önce zevkine göre 12 kitaplık "Sana Özel" rafı ekle.

**Architecture:** Mevcut `/api/chat/v1/feed` ucunu (028, hazır) mevcut kitap kartına bağla. `DiscoverWelcome` login ise feed'i çeker, kartları hero altına/örnek kartların üstüne basar. Anonim → sayfa değişmez. Backend değişmez; iş %100 frontend.

**Tech Stack:** React + TypeScript, react-router, react-oidc-context (`useAuthSession`), Tailwind, lucide-react. Build: `tsc -b && vite build`. Lint: `oxlint`. Test harness YOK → doğrulama = build + lint + canlı tarayıcı (CLAUDE.md: UI canlı-doğrulama).

**Spec:** `docs/superpowers/specs/2026-11-25-homepage-personal-shelf-design.md`

## Global Constraints
- Yeni kart UI icat etme — mevcut `BookCard` (ChatWorkspace) yeniden kullanılır.
- Anonim kullanıcı feed çağrısı tetiklemez (uç 401 döner).
- Feed boş/hata → raf hiç render edilmez; sayfa asla bozulmaz.
- Vektör/taste değeri hiçbir yerde kullanıcıya/log'a gösterilmez (zaten backend'de opak; frontend yalnız kitap kartı alır).
- Kart casing defansif kalsın (MCP/STJ camel|Pascal) — mevcut `normalizeBook` korunur.

## Review Focus
- **Token henüz yüklenmemiş (`isLoading`):** feed, token hazır olmadan çağrılırsa 401/boş gelir → raf kaybolur. Beklenen: `isLoading` bitene kadar çağrı yapılma, iskelet göster. → Task 3.
- **Feed 12'den az döner (cold-start / seyrek katalog):** grid kırılmamalı, gelen kadar kart basılmalı. → Task 3.
- **Kapak URL null:** kart kapaksız placeholder göstermeli (mevcut `BookCard` davranışı korunur). → Task 1.
- **Ağ hatası / ScoutAgent kapalı:** `getFeed` reddeder → yakalanıp raf gizlenir, sayfa (arama kutusu) çalışmaya devam eder. → Task 3.
- **Login→logout geçişi:** logout sonrası raf anında kaybolmalı (anonim moda düşer). → Task 3.

---

### Task 1: `BookCard`'ı paylaşılır bileşene taşı

**Files:**
- Create: `src/components/BookCard.tsx`
- Modify: `src/pages/ChatWorkspace.tsx` (BookCard/normalizeBook/ToolBook tanımlarını sil, import et)

**Interfaces:**
- Produces: `export interface ToolBook { id?: string; isbn?: string | null; name: string; authors?: string; price?: number | null; coverUrl?: string | null; publisher?: string | null }` (mevcut ChatWorkspace tanımıyla BİREBİR — oradan taşınır, alan eklenmez)
- Produces: `export function normalizeBook(o: unknown): ToolBook`
- Produces: `export function normalizeBooks(result: unknown): ToolBook[]` (tool result → kitap listesi; `{items|Items:[...]}` okur)
- Produces: `export function BookCard({ book }: { book: ToolBook }): JSX.Element`

- [ ] **Step 1:** `ChatWorkspace.tsx`'teki `ToolBook`, `normalizeBook`, `isbnFromCover`, kitap-listesi çıkaran yardımcı ve `BookCard` bileşenini `src/components/BookCard.tsx`'e taşı; `export` ekle. Davranışı DEĞİŞTİRME (birebir taşıma). Listeyi normalize eden fonksiyonu `normalizeBooks` adıyla export et.
- [ ] **Step 2:** `ChatWorkspace.tsx`'te taşınan tanımları sil, `import { BookCard, normalizeBook, normalizeBooks, type ToolBook } from '../components/BookCard'` ekle; iç kullanımları bu import'a bağla.
- [ ] **Step 3:** Çalıştır: `npm run build && npm run lint`. Beklenen: 0 tip hatası, 0 lint hatası.
- [ ] **Step 4:** Canlı: `/sohbet`'te bir arama yap → kitap kartları ESKİSİYLE AYNI görünmeli (regresyon yok).
- [ ] **Step 5:** Commit: `refactor(web): BookCard'ı paylaşılır componente taşı`

---

### Task 2: `getFeed(token)` API istemcisi

**Files:**
- Modify: `src/api/chat.ts`

**Interfaces:**
- Consumes: mevcut `request<T>(path, init, token)`, `ChatReply`, `ReplyItem`.
- Produces: `export function getFeed(token: string): Promise<ChatReply>` — `GET /api/chat/v1/feed`, bearer zorunlu; `ChatResponse`'tan `reply`'ı döner (`{ text, items }`).

- [ ] **Step 1:** `chat.ts`'e `getFeed(token)` ekle: `request<{ reply: ChatReply }>('/api/chat/v1/feed', { method: 'GET' }, token)` çağır, `.reply` döndür. (Cevap şekli `sendMessage` ile aynı: `ChatResponse { conversationId, reply }`.)
- [ ] **Step 2:** Çalıştır: `npm run build`. Beklenen: 0 tip hatası.
- [ ] **Step 3:** Commit: `feat(web): chat API'sine getFeed ekle`

---

### Task 3: `DiscoverWelcome`'a "Sana Özel" rafı

**Files:**
- Create: `src/components/PersonalShelf.tsx`
- Modify: `src/pages/DiscoverWelcome.tsx` (hero ile örnek kartlar arasına `<PersonalShelf />`)

**Interfaces:**
- Consumes: `useAuthSession` (`isAuthenticated`, `isLoading`, `accessToken`), `getFeed` (Task 2), `BookCard` + `normalizeBooks` + `ToolBook` (Task 1).
- Produces: `export function PersonalShelf(): JSX.Element | null`

- [ ] **Step 1:** `PersonalShelf.tsx` yaz:
  - `useAuthSession` → anonim veya `isLoading` ise ilk render `null` (ama token hazır olunca fetch).
  - `useEffect`: `isAuthenticated && accessToken` olunca `getFeed(accessToken)` çağır; state = `{ status: 'loading'|'ready'|'empty', text, books }`. Hata → `empty` (yakala, logla DEĞİL).
  - Feed `reply.items`'tan `tool === 'recommend_books'` olanı bul → `normalizeBooks(item.result)` → kitaplar.
  - 0 kitap → `null` döndür (raf çizilmez). Yükleniyor → iskelet (3-4 gri kutu). Hazır → başlık "Sana Özel" + altında `reply.text` + grid (`BookCard`).
  - Logout/anonim geçişinde `isAuthenticated` false → `null`.
- [ ] **Step 2:** `DiscoverWelcome.tsx`'te hero `<p>` (subtitle) ile "Bir örnekle başla" bloğu ARASINA `<PersonalShelf />` yerleştir (örnek kartların üstü).
- [ ] **Step 3:** Çalıştır: `npm run build && npm run lint`. Beklenen: temiz.
- [ ] **Step 4:** Canlı doğrulama (Aspire + web açık):
  - Anonim `/` → raf YOK, sayfa eskisi gibi.
  - Login `/` → "Sana Özel" + 12 kart (veya cold-start metni); kart tıkla → kitap detayı.
  - Logout → raf kaybolur.
- [ ] **Step 5:** Commit: `feat(web): ana sayfaya Sana Özel rafı`

---

## Self-Review
- **Spec coverage:** A-yaklaşımı (anonim değişmez / login raf) = Task 3; kart yeniden kullanım = Task 1; feed çağrısı = Task 2; örnek kartların üstü yerleşim = Task 3 Step 2; deterministik (refresh varyasyonu non-goal) = değişiklik yok. Tüm kapsam maddeleri karşılandı.
- **Review Focus:** `isLoading`/token, <12 kitap, null kapak, ağ hatası, login→logout — hepsi Task 3 (veya 1) adımlarında ele alındı.
- **Type consistency:** `ToolBook`/`normalizeBook`/`normalizeBooks`/`BookCard` Task 1'de tanımlı, Task 3'te aynı adlarla tüketilir. `getFeed`→`ChatReply` Task 2→3 tutarlı.
- **Proportion:** Plan spec'e orantılı; kod gövdesi yok, imza + davranış tarifi (UI, test-first değil → canlı doğrulama adımları).
