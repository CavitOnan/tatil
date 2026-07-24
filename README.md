# Tatil Asistanı

Türkiye'deki resmi tatilleri ~1 yıl önceden gösteren, köprü günü (uzun hafta
sonu) fırsatlarını hesaplayan ve tatil planlamaya yardımcı olan web
uygulaması. Faz 1'de tüm özellikler girişsiz ve ücretsiz herkese açık.

## Ana özellik

Kullanıcının bulunduğu ülkenin (ilk sürümde: Türkiye) resmi tatillerini
görüntüler, bu tatiller etrafında birkaç izin günüyle uzun tatil yapmayı
sağlayan "köprü günü" fırsatlarını otomatik hesaplar ve kullanıcının bu
tatilleri bütçesine göre planlamasına yardımcı olur.

## Teknoloji

- **React Native (Expo, TypeScript) + react-native-web** — tek kod tabanı,
  hedef platform web (`expo start --web` / `expo export --platform web`)
- **React Navigation** — ekranlar arası gezinme (bottom tabs)
- **Nager.Date API** ([date.nager.at](https://date.nager.at)) — ücretsiz
  resmi tatil verisi kaynağı

## Proje yapısı

```
src/
  screens/         # HomeScreen, BridgeDaysScreen, CostCalculatorScreen
  navigation/       # RootNavigator (bottom tabs)
  lib/
    holidays.ts      # Nager.Date API istemcisi
    bridgeDays.ts     # Köprü günü hesaplama algoritması (saf fonksiyon,
                       # dış veriye ihtiyaç duymaz)
  types/            # Paylaşılan TypeScript tipleri
```

## Özellikler (Faz 1: hepsi ücretsiz, girişsiz)

- Tam 1 yıllık tatil takvimi, bir sonraki tatile geri sayım
- Köprü günü optimizasyonu (`findBridgeOpportunities` — kaç gün izinle kaç
  gün tatil yapılacağını hesaplar, verimliliğe göre sıralar)
- Maliyet hesaplayıcı (kullanıcı girdili — kişi sayısı × gün × günlük bütçe)

## Yol haritası

- **Faz 1 (mevcut iskelet):** Tek ülke tatil takvimi + köprü günü
  hesaplayıcı + kullanıcı girdili maliyet hesaplayıcı, tüm özellikler
  girişsiz ve ücretsiz
- **Faz 2:** Kullanıcı girişi (auth), ödeme/abonelik entegrasyonu (iyzico),
  çoklu ülke takibi
- **Faz 3:** Gerçek zamanlı seyahat fiyatı entegrasyonu (bütçe ayrılırsa),
  e-posta/push bildirimleri

## Geliştirme

```bash
npm install
npx expo start --web
```

## Bilinen sınırlamalar

- Ramazan/Kurban Bayramı gibi ay takvimine bağlı tatillerin tarihi resmi
  olarak kesinleşene kadar Nager.Date'te "tentative" işaretli gelir; bu
  durum UI'da "Tarih kesinleşmedi" rozeti ve köprü günü kartlarında uyarı
  olarak gösteriliyor (bkz. `holidays.ts` → `isTentative`).
