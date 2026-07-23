# Tatil Asistanı

Türkiye'deki resmi tatilleri ~1 yıl önceden gösteren, köprü günü (uzun hafta
sonu) fırsatlarını hesaplayan ve tatil planlamaya yardımcı olan freemium web
uygulaması.

## Ana özellik

Kullanıcının bulunduğu ülkenin (ilk sürümde: Türkiye) resmi tatillerini
görüntüler, bu tatiller etrafında birkaç izin günüyle uzun tatil yapmayı
sağlayan "köprü günü" fırsatlarını otomatik hesaplar ve kullanıcının bu
tatilleri bütçesine göre planlamasına yardımcı olur.

## Teknoloji

- **React Native (Expo, TypeScript) + react-native-web** — tek kod tabanı,
  hedef platform web (`expo start --web` / `expo export --platform web`)
- **React Navigation** — ekranlar arası gezinme (bottom tabs)
- **Supabase** — kullanıcı hesabı/kimlik doğrulama (Auth, e-posta magic
  link), ileride veri senkronizasyonu
- **Nager.Date API** ([date.nager.at](https://date.nager.at)) — ücretsiz
  resmi tatil verisi kaynağı
- **Ödeme/abonelik** — henüz entegre edilmedi (bkz. Faz 1 TODO); web
  aboneliği için Stripe planlanıyor

## Proje yapısı

```
src/
  screens/         # HomeScreen, BridgeDaysScreen, CostCalculatorScreen,
                    # PaywallScreen, ProfileScreen
  navigation/       # RootNavigator (bottom tabs)
  lib/
    holidays.ts      # Nager.Date API istemcisi
    bridgeDays.ts     # Köprü günü hesaplama algoritması (saf fonksiyon,
                       # dış veriye ihtiyaç duymaz)
    supabase.ts        # Supabase client + auth storage
    entitlements.tsx    # Abonelik durumu context'i (ödeme entegrasyonu
                          # gelene kadar test amaçlı yerel state)
  types/            # Paylaşılan TypeScript tipleri
```

## Free / Premium ayrımı

**Ücretsiz:**
- Türkiye'nin resmi tatilleri (önümüzdeki 3 ay)
- Takvim görünümü, bir sonraki tatile geri sayım

**Premium (Aylık/Yıllık):**
- Tam 1 yıllık tatil takvimi
- Köprü günü optimizasyonu (`findBridgeOpportunities` — kaç gün izinle kaç
  gün tatil yapılacağını hesaplar, verimliliğe göre sıralar)
- Maliyet hesaplayıcı (Faz 1: kullanıcı girdili — kişi sayısı × gün × günlük
  bütçe; gerçek zamanlı fiyat API'si için bütçe ayrılmadığından Faz 2'ye
  ertelendi)

## Yol haritası

- **Faz 1 (mevcut iskelet):** Auth (e-posta magic link) + tek ülke tatil
  takvimi + köprü günü hesaplayıcı + kullanıcı girdili maliyet hesaplayıcı +
  free/premium duvarı (test amaçlı yerel toggle)
- **Faz 2:** Gerçek ödeme entegrasyonu (Stripe Checkout), çoklu ülke takibi
- **Faz 3:** Gerçek zamanlı seyahat fiyatı entegrasyonu (bütçe ayrılırsa),
  e-posta/push bildirimleri

## Geliştirme

```bash
npm install
npx expo start --web
```

`.env.example` dosyasını `.env` olarak kopyalayıp Supabase proje bilgilerini
girin.

## Bilinen sınırlamalar / Faz 1 TODO

- Paywall ekranındaki satın alma butonları şu an sadece yerel test state'ini
  değiştiriyor; gerçek ödeme entegrasyonu (Stripe) yapılmadı.
- Ramazan/Kurban Bayramı gibi ay takvimine bağlı tatillerin tarihi resmi
  olarak kesinleşene kadar Nager.Date'te "tentative" işaretli gelir; bu
  durum UI'da "Tarih kesinleşmedi" rozeti ve köprü günü kartlarında uyarı
  olarak gösteriliyor (bkz. `holidays.ts` → `isTentative`).
