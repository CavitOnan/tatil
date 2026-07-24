import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSubscription } from "../lib/entitlements";

interface Props {
  feature?: string;
}

/**
 * Faz 1'de gerçek ödeme akışı yok (bilinçli olarak kapsam dışı); butonlar
 * entitlement'ı test amaçlı yerelde değiştirir. Faz 2'de iyzico entegre
 * edildiğinde bu iki handler gerçek checkout çağrılarıyla değiştirilecek.
 */
export default function PaywallScreen({ feature }: Props) {
  const { setTierForTesting } = useSubscription();

  const handlePurchase = (tier: "monthly" | "yearly") => {
    setTierForTesting(tier);
    Alert.alert(
      "Test modu",
      `${tier === "monthly" ? "Aylık" : "Yıllık"} plan (test) etkinleştirildi. Gerçek satın alma iyzico entegrasyonuyla eklenecek.`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Premium'a Geç</Text>
      {feature && <Text style={styles.feature}>{feature}</Text>}

      <View style={styles.benefits}>
        <Benefit text="Tam 1 yıllık tatil takvimi" />
        <Benefit text="Köprü günü optimizasyonu" />
        <Benefit text="Maliyet hesaplayıcı" />
        <Benefit text="Gelişmiş hatırlatmalar" />
      </View>

      <TouchableOpacity
        style={styles.planButton}
        onPress={() => handlePurchase("monthly")}
      >
        <Text style={styles.planButtonText}>Aylık Abonelik</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.planButton, styles.planButtonPrimary]}
        onPress={() => handlePurchase("yearly")}
      >
        <Text style={[styles.planButtonText, styles.planButtonTextPrimary]}>
          Yıllık Abonelik (indirimli)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <View style={styles.benefitRow}>
      <Text style={styles.benefitBullet}>✓</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  feature: { color: "#6b7280", marginBottom: 24 },
  benefits: { marginBottom: 32 },
  benefitRow: { flexDirection: "row", marginBottom: 10 },
  benefitBullet: { color: "#0f766e", fontWeight: "700", marginRight: 8 },
  benefitText: { fontSize: 15 },
  planButton: {
    borderWidth: 1,
    borderColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  planButtonPrimary: { backgroundColor: "#0f766e" },
  planButtonText: { color: "#0f766e", fontWeight: "700" },
  planButtonTextPrimary: { color: "#fff" },
});
