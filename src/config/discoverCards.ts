// 007 US3 + 026/027: Kâşif keşif kartları — COMMIT'Lİ yapılandırma (DB değil). Her kartın bir sorusu +
// durumu var. 'active' = bugün cevaplanabilir. 026 semantik arama + 027 similar_books V2 + search_books
// filtreleri (indirim/sayfa/popülerlik) CANLI → eski 'soon' kartların hepsi artık 'active'. Betimleyici
// (tam cümle) kartlar semantik yolu sergiler + kullanıcıya "ne istediğini anlat" desenini öğretir.
export type DiscoverCardStatus = 'active' | 'soon'

export interface DiscoverCard {
  tag: string
  icon: string // DiscoverWelcome.icons anahtarı: sparkles|copy|book|tag|clock|trending
  text: string // chat'e önceden doldurulacak soru
  status: DiscoverCardStatus
}

export const discoverCards: DiscoverCard[] = [
  // Betimleyici (semantik yolu sergiler — cümle-boyu anlatım)
  { tag: 'RUH HALİNE GÖRE', icon: 'sparkles', text: 'Yoğun bir haftanın ardından beni başka bir dünyaya götürecek bir roman.', status: 'active' },
  { tag: 'HİSSE GÖRE', icon: 'sparkles', text: 'İçimi ısıtan, sakin ve umutlu bir hikaye.', status: 'active' },
  { tag: 'ATMOSFER', icon: 'sparkles', text: 'Gece bitiremeyeceğim, tedirgin eden karanlık bir gerilim.', status: 'active' },
  { tag: 'BENZER KİTAP', icon: 'copy', text: 'Simyacı’yı sevdim, buna benzer ne okumalıyım?', status: 'active' },
  // Lexical / filtre (yazar/başlık/konu/indirim/süre/popülerlik)
  { tag: 'YAZARA GÖRE', icon: 'book', text: 'Sabahattin Ali’nin kitaplarını göster.', status: 'active' },
  { tag: 'KİTAP ARA', icon: 'sparkles', text: 'Nutuk katalogda var mı?', status: 'active' },
  { tag: 'KONU & TEMA', icon: 'book', text: 'Stoacı felsefe üzerine kitaplar.', status: 'active' },
  { tag: 'BÜTÇE & İNDİRİM', icon: 'tag', text: 'İş Bankası klasiklerinde indirimde olanları göster.', status: 'active' },
  { tag: 'SÜREYE GÖRE', icon: 'clock', text: 'Bir hafta sonunda bitirebileceğim, 250 sayfadan kısa bir kitap.', status: 'active' },
  { tag: 'POPÜLERLİK', icon: 'trending', text: 'Bu ay en çok okunan kurgu-dışı kitaplar.', status: 'active' },
]

// 026: chat boş-durumunda gösterilecek betimleyici örnek çipler (kullanıcıyı tam-cümle anlatıma özendirir;
// tık → send()). discoverCards'tan AYRI kısa alt-küme — tek kaynak burada, dup yok.
export const exampleChips: string[] = [
  'İçimi ısıtan, sakin bir hikaye okumak istiyorum.',
  'Gece bitiremeyeceğim, gerilimi yüksek bir kitap öner.',
  'Savaşın insanı nasıl değiştirdiğini anlatan bir roman arıyorum.',
  'Stokta, 300 sayfadan kısa karanlık bir roman önerir misin?',
  'Simyacı’ya benzer kitaplar getirir misin?',
  'Sabahattin Ali’nin kitaplarını listeler misin?',
  'Dünya klasiklerinden okunması gereken bir kitap söyler misin?',
]
