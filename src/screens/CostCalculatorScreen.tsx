import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

/**
 * Faz 1 maliyet hesaplayıcı: dış API'ye bağlı değil, kullanıcının girdiği
 * kişi sayısı / gün sayısı / günlük ortalama bütçeden toplam tahmini
 * çıkarır. Faz 2'de gerçek fiyat kaynaklarıyla zenginleştirilebilir.
 */
export default function CostCalculatorScreen() {
  const [people, setPeople] = useState("2");
  const [days, setDays] = useState("4");
  const [dailyBudgetPerPerson, setDailyBudgetPerPerson] = useState("1500");

  const total = useMemo(() => {
    const p = Number(people) || 0;
    const d = Number(days) || 0;
    const b = Number(dailyBudgetPerPerson) || 0;
    return p * d * b;
  }, [people, days, dailyBudgetPerPerson]);

  return (
    <View style={styles.container}>
      <Field
        label="Kişi sayısı"
        value={people}
        onChangeText={setPeople}
      />
      <Field label="Gün sayısı" value={days} onChangeText={setDays} />
      <Field
        label="Kişi başı günlük bütçe (TL)"
        value={dailyBudgetPerPerson}
        onChangeText={setDailyBudgetPerPerson}
      />

      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>Tahmini toplam maliyet</Text>
        <Text style={styles.resultValue}>
          {total.toLocaleString("tr-TR")} TL
        </Text>
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  field: { marginBottom: 16 },
  label: { marginBottom: 6, color: "#374151", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  resultCard: {
    marginTop: 12,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#0f766e",
    alignItems: "center",
  },
  resultLabel: { color: "#d1fae5" },
  resultValue: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 6 },
});
