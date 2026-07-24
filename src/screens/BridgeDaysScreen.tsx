import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { findBridgeOpportunities } from "../lib/bridgeDays";
import { fetchHolidaysForNextYear } from "../lib/holidays";
import type { BridgeOpportunity } from "../types";

const COUNTRY_CODE = "TR";

export default function BridgeDaysScreen() {
  const [opportunities, setOpportunities] = useState<
    BridgeOpportunity[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const from = new Date();
    const to = new Date();
    to.setFullYear(to.getFullYear() + 1);

    fetchHolidaysForNextYear(COUNTRY_CODE)
      .then((holidays) =>
        setOpportunities(findBridgeOpportunities(from, to, holidays))
      )
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!opportunities) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={opportunities}
      keyExtractor={(item) => item.resultStart}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>
            {item.leaveDates.length} gün izinle {item.resultDays.length} gün
            tatil
          </Text>
          <Text style={styles.subtitle}>
            {item.resultStart} → {item.resultEnd}
          </Text>
          <Text style={styles.leaveDates}>
            İzin alman gereken günler: {item.leaveDates.join(", ")}
          </Text>
          {item.relatedHolidays.length > 0 && (
            <Text style={styles.holidays}>
              {item.relatedHolidays.join(", ")}
            </Text>
          )}
          {item.relatedHolidaysTentative && (
            <Text style={styles.tentativeNote}>
              ⚠ Bu tatilin tarihi resmi olarak kesinleşmedi (dini bayram, ay
              gözlemine bağlı), izin talebini kesinleşene kadar ertele.
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  error: { color: "#c0392b", padding: 16, textAlign: "center" },
  list: { padding: 16 },
  card: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#f0fdf4",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  title: { fontWeight: "700", fontSize: 16, color: "#14532d" },
  subtitle: { color: "#166534", marginTop: 4 },
  leaveDates: { marginTop: 8, color: "#166534" },
  holidays: { marginTop: 4, color: "#4d7c0f", fontStyle: "italic" },
  tentativeNote: { marginTop: 8, color: "#b45309", fontSize: 12 },
});
