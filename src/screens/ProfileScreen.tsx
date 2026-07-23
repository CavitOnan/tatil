import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { useSubscription } from "../lib/entitlements";

export default function ProfileScreen() {
  const { tier } = useSubscription();
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) =>
      setSession(s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const sendMagicLink = async () => {
    if (!email) return;
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setSending(false);
    Alert.alert(
      error ? "Hata" : "Bağlantı gönderildi",
      error ? error.message : `${email} adresine giriş bağlantısı gönderildi.`
    );
  };

  if (session) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Giriş yapıldı</Text>
        <Text style={styles.email}>{session.user.email}</Text>
        <Text style={styles.tier}>Plan: {tier}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => supabase.auth.signOut()}
        >
          <Text style={styles.buttonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>E-posta ile giriş yap</Text>
      <TextInput
        style={styles.input}
        placeholder="ornek@eposta.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={sendMagicLink}
        disabled={sending}
      >
        <Text style={styles.buttonText}>
          {sending ? "Gönderiliyor..." : "Giriş Bağlantısı Gönder"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  label: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  email: { fontSize: 16, marginBottom: 4 },
  tier: { color: "#6b7280", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
