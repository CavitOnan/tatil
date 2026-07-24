import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchHolidaysForNextYear } from "../lib/holidays";
import type { PublicHoliday } from "../types";

const COUNTRY_CODE = "TR";

function formatDateWithWeekday(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
    timeZone: "UTC",
  });
}

export default function HomeScreen() {
  const [holidays, setHolidays] = useState<PublicHoliday[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHolidaysForNextYear(COUNTRY_CODE)
      .then(setHolidays)
      .catch((e) => setError(e.message));
  }, []);

  const nextHoliday = holidays?.[0];
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
        data={holidays}
        keyExtractor={(item) => `${item.date}-${item.localName}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowDate}>
              {formatDateWithWeekday(item.date)}
            </Text>
            <View style={styles.rowNameGroup}>
              <Text style={styles.rowName}>{item.localName}</Text>
              {item.isTentative && (
                <Text style={styles.tentativeBadge}>Tarih kesinleşmedi</Text>
              )}
            </View>
          </View>
        )}
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
});
