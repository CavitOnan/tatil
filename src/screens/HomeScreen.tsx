import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchHolidaysForNextYear } from "../lib/holidays";
import { useSubscription } from "../lib/entitlements";
import type { PublicHoliday } from "../types";

const COUNTRY_CODE = "TR";
const FREE_TIER_MONTHS_AHEAD = 3;

export default function HomeScreen() {
  const { isPremium } = useSubscription();
  const [holidays, setHolidays] = useState<PublicHoliday[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHolidaysForNextYear(COUNTRY_CODE)
      .then(setHolidays)
      .catch((e) => setError(e.message));
  }, []);

  const visibleHolidays = useMemo(() => {
    if (!holidays) return [];
    if (isPremium) return holidays;

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() + FREE_TIER_MONTHS_AHEAD);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return holidays.filter((h) => h.date <= cutoffStr);
  }, [holidays, isPremium]);

  const nextHoliday = visibleHolidays[0];
  const daysUntilNext = nextHoliday
    ? Math.ceil(
        (new Date(nextHoliday.date).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Tatil verisi alınamadı: {error}</Text>
      </View>
    );
  }

  if (!holidays) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {nextHoliday && (
        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>Sıradaki resmi tatil</Text>
          <Text style={styles.countdownHoliday}>{nextHoliday.localName}</Text>
          <Text style={styles.countdownDays}>{daysUntilNext} gün kaldı</Text>
        </View>
      )}

      <FlatList
        data={visibleHolidays}
        keyExtractor={(item) => `${item.date}-${item.localName}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowDate}>{item.date}</Text>
            <View style={styles.rowNameGroup}>
              <Text style={styles.rowName}>{item.localName}</Text>
              {item.isTentative && (
                <Text style={styles.tentativeBadge}>Tarih kesinleşmedi</Text>
              )}
            </View>
          </View>
        )}
        ListFooterComponent={
          !isPremium ? (
            <Text style={styles.upsell}>
              Ücretsiz sürümde önümüzdeki {FREE_TIER_MONTHS_AHEAD} ay
              gösterilir. Tam 1 yıllık takvim ve köprü günü önerileri için
              Premium'a geç.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: "#c0392b", padding: 16, textAlign: "center" },
  countdownCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#0f766e",
  },
  countdownLabel: { color: "#d1fae5", fontSize: 13 },
  countdownHoliday: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  countdownDays: { color: "#d1fae5", fontSize: 15, marginTop: 6 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  rowDate: { color: "#6b7280" },
  rowNameGroup: { alignItems: "flex-end" },
  rowName: { fontWeight: "600" },
  tentativeBadge: { color: "#b45309", fontSize: 11, marginTop: 2 },
  upsell: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fef3c7",
    color: "#92400e",
    textAlign: "center",
  },
});
