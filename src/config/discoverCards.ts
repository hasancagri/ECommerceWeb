// 007 US3: Kâşif keşif kartları — COMMIT'Lİ yapılandırma (DB değil). Her kartın bir sorusu + durumu var.
// 'active' = bugün cevaplanabilir (katalog arama/detay — search_books/get_book). 'soon' = motor bekler
// (ruh hali, benzer kitap, indirim, süre, popülerlik — semantik/öneri ayağı gelince açılır).
export type DiscoverCardStatus = 'active' | 'soon'

export interface DiscoverCard {
  tag: string
  icon: string // DiscoverWelcome.icons anahtarı: sparkles|copy|book|tag|clock|trending
  text: string // chat'e önceden doldurulacak soru
  status: DiscoverCardStatus
}

export const discoverCards: DiscoverCard[] = [
  { tag: 'YAZARA GÖRE', icon: 'book', text: 'Sabahattin Ali’nin kitaplarını göster.', status: 'active' },
  { tag: 'KİTAP ARA', icon: 'sparkles', text: 'Nutuk katalogda var mı?', status: 'active' },
  { tag: 'KONU & TEMA', icon: 'book', text: 'Stoacı felsefe üzerine kitaplar.', status: 'active' },
  { tag: 'RUH HALİNE GÖRE', icon: 'sparkles', text: 'Yoğun bir haftanın ardından beni başka bir dünyaya götürecek bir roman.', status: 'soon' },
  { tag: 'BENZER KİTAP', icon: 'copy', text: 'Simyacı’yı sevdim, buna benzer ne okumalıyım?', status: 'soon' },
  { tag: 'BÜTÇE & İNDİRİM', icon: 'tag', text: 'İş Bankası klasiklerinde indirimde olanları göster.', status: 'soon' },
  { tag: 'SÜREYE GÖRE', icon: 'clock', text: 'Bir hafta sonunda bitirebileceğim, 250 sayfadan kısa bir kitap.', status: 'soon' },
  { tag: 'POPÜLERLİK', icon: 'trending', text: 'Bu ay en çok okunan kurgu-dışı kitaplar.', status: 'soon' },
]
